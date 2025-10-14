/**
 * BLOG NAME SCRAPER - Automated Blog-to-Database Enrichment
 *
 * Automatically detects new/updated blog posts, extracts names,
 * enriches them with GPT-4o-mini, and adds to database.
 *
 * USAGE:
 *   node blog-name-scraper.js                    # Process all new/updated blogs
 *   node blog-name-scraper.js --dry-run          # Preview without changes
 *   node blog-name-scraper.js --force            # Process all blogs (ignore timestamps)
 *   node blog-name-scraper.js --blog=slug-name   # Process specific blog
 *
 * FEATURES:
 * - Detects new blogs (not in last run report)
 * - Detects updated blogs (modified since last run)
 * - Extracts names from <strong> tags
 * - Batch enrichment (10 names per API call)
 * - Updates database with new names only
 * - Progress tracking and detailed logging
 * - Safe: creates backups before any changes
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ==================== CONFIGURATION ====================

const CONFIG = {
  blogPostsDir: './blog-posts-seo',
  databaseDir: './public/data',
  chunkFiles: ['names-chunk1.json', 'names-chunk2.json', 'names-chunk3.json', 'names-chunk4.json'],
  targetChunk: 'names-chunk1.json',

  // Tracking files
  lastRunFile: './blog-scraper-last-run.json',
  reportFile: './blog-scraper-report.json',

  // API settings
  openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  batchSize: 10,
  batchDelay: 1500, // 1.5 seconds between batches
  maxRetries: 3
};

// ==================== HELPER FUNCTIONS ====================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load last run data to detect new/updated blogs
 */
function loadLastRun() {
  if (!fs.existsSync(CONFIG.lastRunFile)) {
    return { timestamp: 0, processedBlogs: {} };
  }

  try {
    return JSON.parse(fs.readFileSync(CONFIG.lastRunFile, 'utf8'));
  } catch (err) {
    console.warn(`⚠️  Could not load last run data: ${err.message}`);
    return { timestamp: 0, processedBlogs: {} };
  }
}

/**
 * Save last run data
 */
function saveLastRun(data) {
  fs.writeFileSync(CONFIG.lastRunFile, JSON.stringify(data, null, 2));
}

/**
 * Load all blog posts and detect new/updated ones
 */
function detectBlogChanges(force = false, specificBlog = null) {
  console.log('\n📚 Detecting blog post changes...');

  const files = fs.readdirSync(CONFIG.blogPostsDir)
    .filter(f => f.endsWith('.json'));

  const lastRun = loadLastRun();
  const newBlogs = [];
  const updatedBlogs = [];
  const unchangedBlogs = [];
  let skipped = 0;

  files.forEach(file => {
    try {
      const filePath = path.join(CONFIG.blogPostsDir, file);
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const blogData = JSON.parse(content);

      // Skip non-blog files
      if (!blogData.content || !blogData.slug || !blogData.title) {
        skipped++;
        return;
      }

      // If specific blog requested, only process that one
      if (specificBlog && blogData.slug !== specificBlog) {
        return;
      }

      const lastModified = stats.mtimeMs;
      const previousData = lastRun.processedBlogs[blogData.slug];

      if (force) {
        // Force mode: process everything
        newBlogs.push({ file, blogData, lastModified });
      } else if (!previousData) {
        // New blog
        newBlogs.push({ file, blogData, lastModified });
      } else if (lastModified > previousData.timestamp) {
        // Updated blog
        updatedBlogs.push({ file, blogData, lastModified, previousNamesCount: previousData.namesCount || 0 });
      } else {
        // Unchanged
        unchangedBlogs.push({ file, blogData });
      }

    } catch (err) {
      console.warn(`   ⚠️  Skipping ${file}: ${err.message}`);
      skipped++;
    }
  });

  console.log(`   ✓ Found ${newBlogs.length} new blogs`);
  console.log(`   ✓ Found ${updatedBlogs.length} updated blogs`);
  console.log(`   ✓ ${unchangedBlogs.length} unchanged blogs`);
  console.log(`   ✓ Skipped ${skipped} invalid files`);

  return { newBlogs, updatedBlogs, unchangedBlogs, lastRun };
}

/**
 * Extract names from HTML content
 */
function extractNamesFromHTML(htmlContent) {
  const strongRegex = /<strong>(.*?)<\/strong>/gi;
  const matches = [];
  let match;

  while ((match = strongRegex.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    // Filter out non-name content
    if (text && text.length > 1 && text.length < 30 && /^[A-Za-z\s\-']+$/.test(text)) {
      // Normalize: title case
      const normalized = text
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      matches.push(normalized);
    }
  }

  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Load all database chunks
 */
function loadDatabaseChunks() {
  console.log('\n💾 Loading database chunks...');
  const allNames = [];

  CONFIG.chunkFiles.forEach(chunkFile => {
    const filePath = path.join(CONFIG.databaseDir, chunkFile);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const names = JSON.parse(content);
      allNames.push(...names);
      console.log(`   ✓ Loaded ${names.length} names from ${chunkFile}`);
    }
  });

  console.log(`   ✓ Total database: ${allNames.length} names`);
  return allNames;
}

/**
 * Find names not in database
 */
function findMissingNames(blogNames, databaseNames) {
  console.log('\n🔎 Finding missing names...');

  const dbNamesLower = new Set(
    databaseNames.map(n => n.name.toLowerCase())
  );

  const missing = blogNames.filter(name =>
    !dbNamesLower.has(name.toLowerCase())
  );

  console.log(`   ✓ Found ${missing.length} names NOT in database`);
  console.log(`   ✓ Already have ${blogNames.length - missing.length} names in database`);

  return missing;
}

/**
 * Call OpenAI API for batch enrichment
 */
async function enrichNamesBatch(names, retryCount = 0) {
  const prompt = `You are a baby name expert. Enrich the following names with accurate meanings, origins, and gender.

Names to enrich: ${names.join(', ')}

Return a JSON array with this EXACT structure for each name:
[
  {
    "name": "NameHere",
    "gender": "boy" OR "girl" OR "unisex",
    "origin": ["Origin1", "Origin2"],
    "meaning": "Concise meaning here",
    "description": "Brief 1-2 sentence description"
  }
]

CRITICAL REQUIREMENTS:
- gender MUST be EXACTLY one of: "boy", "girl", or "unisex"
- origin MUST be an array, even if single origin
- meaning should be concise but informative
- Return EXACTLY ${names.length} objects in the SAME ORDER
- Return ONLY valid JSON, no markdown or explanations

NEVER use "Modern" as an origin - dig deeper to find the real cultural root.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in baby name etymology and cultural meanings. Provide accurate, concise analysis in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });

    // Handle rate limits with exponential backoff
    if (response.status === 429 && retryCount < CONFIG.maxRetries) {
      const delayMs = CONFIG.batchDelay * Math.pow(2, retryCount);
      console.warn(`   ⚠️  Rate limit hit. Retrying in ${delayMs/1000}s... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
      await delay(delayMs);
      return enrichNamesBatch(names, retryCount + 1);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    // Extract JSON from response
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) ||
                     jsonStr.match(/(\[[\s\S]*\])/);

    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const results = JSON.parse(jsonStr);

    if (!Array.isArray(results)) {
      throw new Error('Response is not an array');
    }

    if (results.length !== names.length) {
      console.warn(`   ⚠️  Expected ${names.length} results, got ${results.length}`);
    }

    return results;

  } catch (error) {
    console.error(`   ✗ Batch enrichment error:`, error.message);

    // Retry on network errors
    if (retryCount < CONFIG.maxRetries) {
      const delayMs = CONFIG.batchDelay * Math.pow(2, retryCount);
      console.warn(`   ⚠️  Retrying in ${delayMs/1000}s... (attempt ${retryCount + 1}/${CONFIG.maxRetries})`);
      await delay(delayMs);
      return enrichNamesBatch(names, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Validate enriched name data
 */
function validateEnrichedName(enrichedData, originalName) {
  const errors = [];

  if (!enrichedData.name) errors.push('Missing name field');
  if (!enrichedData.gender) errors.push('Missing gender field');
  if (!enrichedData.origin) errors.push('Missing origin field');
  if (!enrichedData.meaning) errors.push('Missing meaning field');

  const validGenders = ['boy', 'girl', 'unisex'];
  if (enrichedData.gender && !validGenders.includes(enrichedData.gender)) {
    errors.push(`Invalid gender: ${enrichedData.gender}`);
  }

  if (enrichedData.origin && !Array.isArray(enrichedData.origin)) {
    errors.push('Origin must be an array');
  }

  if (enrichedData.name &&
      enrichedData.name.toLowerCase() !== originalName.toLowerCase()) {
    errors.push(`Name mismatch: expected "${originalName}", got "${enrichedData.name}"`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Convert enriched data to database format
 * CRITICAL: Must match EXACT schema of existing names for search/display to work
 */
function convertToDatabaseFormat(enrichedData) {
  // Gender mapping: boy/girl → male/female
  const genderMap = {
    'boy': 'male',
    'girl': 'female',
    'unisex': 'unisex',
    'male': 'male',
    'female': 'female'
  };

  const gender = genderMap[enrichedData.gender] || 'female';
  const isUnisex = gender === 'unisex';

  // Get origin (use first if array)
  const origins = Array.isArray(enrichedData.origin) ? enrichedData.origin : [enrichedData.origin];
  const primaryOrigin = origins[0] || 'Unknown';

  return {
    name: enrichedData.name,
    gender: gender,
    isUnisex: isUnisex,
    origin: primaryOrigin,
    meaning: enrichedData.meaning,

    // CRITICAL: These fields are required for search to work!
    popularity: 5000,
    rank: 999999,
    count: 5000,
    popularityRank: 999999, // Search uses this!

    // Enrichment data
    enriched: true,
    culturalSignificance: enrichedData.description || enrichedData.meaning,
    modernRelevance: '',
    pronunciationGuide: '',
    variations: [],
    similarNames: [],
    processingStatus: 'completed',
    enrichmentDate: Date.now(),

    // Source tracking
    enrichmentSource: 'blog-name-scraper',
    enrichmentModel: 'gpt-4o-mini',

    // Additional fields for better display
    meaningFull: enrichedData.meaning,
    meaningShort: enrichedData.meaning,
    originGroup: primaryOrigin,
    origins: origins
  };
}

/**
 * Enrich all missing names in batches
 */
async function enrichAllNames(missingNames) {
  console.log('\n🤖 Enriching names with OpenAI GPT-4o-mini...');
  console.log(`   Batch size: ${CONFIG.batchSize} names per API call`);
  console.log(`   Delay between batches: ${CONFIG.batchDelay/1000}s`);

  const enriched = [];
  const failed = [];
  const totalBatches = Math.ceil(missingNames.length / CONFIG.batchSize);

  for (let i = 0; i < missingNames.length; i += CONFIG.batchSize) {
    const batch = missingNames.slice(i, i + CONFIG.batchSize);
    const batchNum = Math.floor(i / CONFIG.batchSize) + 1;

    console.log(`\n   📦 Batch ${batchNum}/${totalBatches} (${batch.length} names): ${batch.join(', ')}`);

    try {
      const results = await enrichNamesBatch(batch);

      batch.forEach((originalName, index) => {
        const result = results[index];

        if (!result) {
          console.error(`      ✗ ${originalName}: No result returned`);
          failed.push({ name: originalName, error: 'No result from API' });
          return;
        }

        const validation = validateEnrichedName(result, originalName);

        if (!validation.valid) {
          console.error(`      ✗ ${originalName}: Validation failed - ${validation.errors.join(', ')}`);
          failed.push({ name: originalName, error: validation.errors.join('; '), data: result });
          return;
        }

        const dbFormat = convertToDatabaseFormat(result);
        enriched.push(dbFormat);
        console.log(`      ✓ ${result.name}: "${result.meaning}" (${result.origin.join(', ')}) [${result.gender}]`);
      });

      if (i + CONFIG.batchSize < missingNames.length) {
        console.log(`\n   ⏱️  Waiting ${CONFIG.batchDelay/1000}s before next batch...`);
        await delay(CONFIG.batchDelay);
      }

    } catch (error) {
      console.error(`   ✗ Batch ${batchNum} failed:`, error.message);
      batch.forEach(name => {
        failed.push({ name, error: error.message });
      });
    }
  }

  return { enriched, failed };
}

/**
 * Update database chunk with new names
 */
function updateDatabaseChunk(newNames, dryRun = false) {
  console.log('\n💾 Updating database...');

  const chunkPath = path.join(CONFIG.databaseDir, CONFIG.targetChunk);
  const backupPath = chunkPath.replace('.json', `.backup-${Date.now()}.json`);

  const currentChunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  console.log(`   Current ${CONFIG.targetChunk}: ${currentChunk.length} names`);

  if (dryRun) {
    console.log(`   🔍 DRY RUN: Would add ${newNames.length} names to ${CONFIG.targetChunk}`);
    console.log(`   🔍 DRY RUN: New total would be ${currentChunk.length + newNames.length} names`);
    return;
  }

  // Create backup
  fs.writeFileSync(backupPath, JSON.stringify(currentChunk, null, 2));
  console.log(`   ✓ Backup created: ${backupPath}`);

  // Add new names
  const updatedChunk = [...currentChunk, ...newNames];

  // Sort alphabetically by name
  updatedChunk.sort((a, b) => a.name.localeCompare(b.name));

  // Write updated chunk
  fs.writeFileSync(chunkPath, JSON.stringify(updatedChunk, null, 2));
  console.log(`   ✓ Updated ${CONFIG.targetChunk}: ${updatedChunk.length} names (+${newNames.length})`);
}

/**
 * Generate scraper report
 */
function generateReport(changes, enriched, failed, dryRun, lastRun) {
  const { newBlogs, updatedBlogs } = changes;
  const timestamp = Date.now();

  console.log('\n📊 Blog Scraper Summary');
  console.log('═══════════════════════════════════════');
  console.log(`New blogs processed:           ${newBlogs.length}`);
  console.log(`Updated blogs processed:       ${updatedBlogs.length}`);
  console.log(`Names successfully enriched:   ${enriched.length}`);
  console.log(`Failed enrichments:            ${failed.length}`);
  console.log('═══════════════════════════════════════');

  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes made');
  } else {
    console.log(`\n✅ Added ${enriched.length} names to ${CONFIG.targetChunk}`);
  }

  if (failed.length > 0) {
    console.log('\n⚠️  Failed Names:');
    failed.forEach(f => {
      console.log(`   - ${f.name}: ${f.error}`);
    });
  }

  // Update last run data
  const updatedLastRun = {
    timestamp,
    processedBlogs: { ...lastRun.processedBlogs }
  };

  [...newBlogs, ...updatedBlogs].forEach(blog => {
    const names = extractNamesFromHTML(blog.blogData.content);
    updatedLastRun.processedBlogs[blog.blogData.slug] = {
      timestamp: blog.lastModified,
      title: blog.blogData.title,
      namesCount: names.length,
      processedAt: timestamp
    };
  });

  if (!dryRun) {
    saveLastRun(updatedLastRun);
    console.log(`\n📄 Last run data updated: ${CONFIG.lastRunFile}`);
  }

  // Save detailed report
  const report = {
    timestamp: new Date(timestamp).toISOString(),
    dryRun,
    summary: {
      newBlogs: newBlogs.length,
      updatedBlogs: updatedBlogs.length,
      totalBlogsProcessed: newBlogs.length + updatedBlogs.length,
      namesEnriched: enriched.length,
      failed: failed.length
    },
    newBlogs: newBlogs.map(b => ({
      slug: b.blogData.slug,
      title: b.blogData.title,
      namesExtracted: extractNamesFromHTML(b.blogData.content).length
    })),
    updatedBlogs: updatedBlogs.map(b => ({
      slug: b.blogData.slug,
      title: b.blogData.title,
      namesExtracted: extractNamesFromHTML(b.blogData.content).length,
      previousNamesCount: b.previousNamesCount
    })),
    enrichedNames: enriched.map(n => ({
      name: n.name,
      gender: n.gender,
      origin: n.origin,
      meaning: n.meaning
    })),
    failedNames: failed,
    config: {
      batchSize: CONFIG.batchSize,
      batchDelay: CONFIG.batchDelay,
      targetChunk: CONFIG.targetChunk
    }
  };

  fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved: ${CONFIG.reportFile}`);
}

// ==================== MAIN EXECUTION ====================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');
  const blogArg = args.find(arg => arg.startsWith('--blog='));
  const specificBlog = blogArg ? blogArg.split('=')[1] : null;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   BLOG NAME SCRAPER                    ║');
  console.log('║   Automated Blog-to-Database System    ║');
  console.log('╚════════════════════════════════════════╝');

  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made');
  }

  if (force) {
    console.log('\n⚠️  FORCE MODE - Processing all blogs');
  }

  if (specificBlog) {
    console.log(`\n🎯 TARGET MODE - Processing blog: ${specificBlog}`);
  }

  // Check API key
  if (!CONFIG.openaiApiKey) {
    console.error('\n❌ ERROR: REACT_APP_OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  try {
    // Step 1: Detect blog changes
    const changes = detectBlogChanges(force, specificBlog);
    const { newBlogs, updatedBlogs, lastRun } = changes;

    if (newBlogs.length === 0 && updatedBlogs.length === 0) {
      console.log('\n✅ No new or updated blogs found. Nothing to do!');
      return;
    }

    // Step 2: Extract all names from new/updated blogs
    const allNames = [];
    [...newBlogs, ...updatedBlogs].forEach(blog => {
      const names = extractNamesFromHTML(blog.blogData.content);
      allNames.push(...names);
      console.log(`   ${blog.blogData.title}: ${names.length} names`);
    });

    const uniqueNames = [...new Set(allNames)];
    console.log(`\n   ✓ Total unique names: ${uniqueNames.length}`);

    // Step 3: Load database
    const databaseNames = loadDatabaseChunks();

    // Step 4: Find missing names
    const missingNames = findMissingNames(uniqueNames, databaseNames);

    if (missingNames.length === 0) {
      console.log('\n✅ All names already in database! Updating blog tracking...');
      if (!dryRun) {
        generateReport(changes, [], [], dryRun, lastRun);
      }
      return;
    }

    console.log('\n📝 Names to enrich:');
    missingNames.forEach((name, i) => {
      console.log(`   ${i + 1}. ${name}`);
    });

    // Step 5: Enrich missing names
    const { enriched, failed } = await enrichAllNames(missingNames);

    // Step 6: Update database
    if (enriched.length > 0 && !dryRun) {
      updateDatabaseChunk(enriched, dryRun);
    }

    // Step 7: Generate report
    generateReport(changes, enriched, failed, dryRun, lastRun);

    console.log('\n✅ Blog Name Scraper completed successfully!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

// Export for use as module
module.exports = { main, detectBlogChanges, extractNamesFromHTML, findMissingNames };
