/**
 * Blog Names Database Enrichment Script
 *
 * PURPOSE:
 * Extracts all names from blog posts, checks against database,
 * enriches missing names with OpenAI GPT-4o-mini, and adds them to the database.
 *
 * USAGE:
 *   node enrich-blog-names.js              # Full run
 *   node enrich-blog-names.js --dry-run    # Preview without changes
 *   node enrich-blog-names.js --limit=50   # Process max 50 names
 *
 * ARCHITECTURE:
 * 1. Load blog posts → 2. Extract names from <strong> tags → 3. Load database chunks
 * 4. Find missing names → 5. Batch enrich (10 at a time) → 6. Add to chunk1 → 7. Report
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ==================== CONFIGURATION ====================

const CONFIG = {
  blogPostsDir: './blog-posts-seo',
  databaseDir: './public/data',
  chunkFiles: [
    'names-chunk1.json',
    'names-chunk2.json',
    'names-chunk3.json',
    'names-chunk4.json'
  ],
  targetChunk: 'names-chunk1.json', // Where to add new names
  backupSuffix: '.backup-blog-enrichment.json',
  reportFile: 'blog-names-enrichment-report.json',
  openaiApiKey: process.env.REACT_APP_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  batchSize: 10, // Process 10 names per API call
  batchDelay: 1500, // 1.5 seconds between batches
  maxRetries: 3
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Delay helper for rate limiting
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load all blog posts from directory
 */
function loadBlogPosts() {
  console.log('\n📚 Loading blog posts...');
  const files = fs.readdirSync(CONFIG.blogPostsDir)
    .filter(f => f.endsWith('.json'));

  const posts = [];
  let skipped = 0;

  files.forEach(file => {
    try {
      const filePath = path.join(CONFIG.blogPostsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const blogData = JSON.parse(content);

      // Skip non-blog-post files (reports, summaries, etc.)
      if (blogData.content && blogData.slug && blogData.title) {
        posts.push(blogData);
      } else {
        skipped++;
      }
    } catch (err) {
      console.warn(`   ⚠️  Skipping ${file}: ${err.message}`);
      skipped++;
    }
  });

  console.log(`   ✓ Loaded ${posts.length} blog posts (skipped ${skipped} invalid files)`);
  return posts;
}

/**
 * Extract names from HTML content (finds all <strong> tags)
 */
function extractNamesFromHTML(htmlContent) {
  // Match all <strong>...</strong> tags
  const strongRegex = /<strong>(.*?)<\/strong>/gi;
  const matches = [];
  let match;

  while ((match = strongRegex.exec(htmlContent)) !== null) {
    const text = match[1].trim();
    // Filter out non-name content (numbers, very long text, etc.)
    if (text &&
        text.length > 1 &&
        text.length < 30 &&
        /^[A-Za-z\s\-']+$/.test(text)) {
      matches.push(text);
    }
  }

  return matches;
}

/**
 * Extract all names from all blog posts
 */
function extractAllNames(blogPosts) {
  console.log('\n🔍 Extracting names from blog posts...');
  const allNames = new Set();

  blogPosts.forEach(post => {
    const names = extractNamesFromHTML(post.content);
    names.forEach(name => {
      // Normalize: title case
      const normalized = name
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      allNames.add(normalized);
    });
  });

  const uniqueNames = Array.from(allNames).sort();
  console.log(`   ✓ Found ${uniqueNames.length} unique names across ${blogPosts.length} blog posts`);
  return uniqueNames;
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

  // Create lowercase Set for case-insensitive comparison
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
 * Call OpenAI API for batch enrichment (10 names at once)
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

    // Extract JSON from response (handle markdown code blocks)
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

  // Check required fields
  if (!enrichedData.name) errors.push('Missing name field');
  if (!enrichedData.gender) errors.push('Missing gender field');
  if (!enrichedData.origin) errors.push('Missing origin field');
  if (!enrichedData.meaning) errors.push('Missing meaning field');

  // Validate gender enum
  const validGenders = ['boy', 'girl', 'unisex'];
  if (enrichedData.gender && !validGenders.includes(enrichedData.gender)) {
    errors.push(`Invalid gender: ${enrichedData.gender} (must be boy/girl/unisex)`);
  }

  // Validate origin is array
  if (enrichedData.origin && !Array.isArray(enrichedData.origin)) {
    errors.push('Origin must be an array');
  }

  // Check name match (case-insensitive)
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
    enrichmentSource: 'blog-post-enrichment-script',
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

      // Validate and convert each result
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

      // Delay between batches
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
 * Backup and update database chunk
 */
function updateDatabaseChunk(newNames, dryRun = false) {
  console.log('\n💾 Updating database...');

  const chunkPath = path.join(CONFIG.databaseDir, CONFIG.targetChunk);
  const backupPath = chunkPath.replace('.json', CONFIG.backupSuffix);

  // Load current chunk
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
 * Generate enrichment report
 */
function generateReport(blogNames, missingNames, enriched, failed, dryRun = false) {
  console.log('\n📊 Enrichment Summary');
  console.log('═══════════════════════════════════════');
  console.log(`Total names in blog posts:     ${blogNames.length}`);
  console.log(`Names already in database:     ${blogNames.length - missingNames.length}`);
  console.log(`Names needing enrichment:      ${missingNames.length}`);
  console.log(`Successfully enriched:         ${enriched.length}`);
  console.log(`Failed enrichment:             ${failed.length}`);
  console.log('═══════════════════════════════════════');

  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes made to database');
  } else {
    console.log(`\n✅ Added ${enriched.length} names to ${CONFIG.targetChunk}`);
  }

  // Log failed names
  if (failed.length > 0) {
    console.log('\n⚠️  Failed Names:');
    failed.forEach(f => {
      console.log(`   - ${f.name}: ${f.error}`);
    });
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    dryRun,
    summary: {
      totalBlogNames: blogNames.length,
      existingInDatabase: blogNames.length - missingNames.length,
      needingEnrichment: missingNames.length,
      successfullyEnriched: enriched.length,
      failed: failed.length
    },
    enrichedNames: enriched.map(n => ({
      name: n.name,
      gender: n.gender,
      origin: n.origin,
      meaning: n.meaning
    })),
    failedNames: failed,
    blogNames: blogNames,
    config: {
      batchSize: CONFIG.batchSize,
      batchDelay: CONFIG.batchDelay,
      targetChunk: CONFIG.targetChunk
    }
  };

  fs.writeFileSync(CONFIG.reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved: ${CONFIG.reportFile}`);
}

// ==================== MAIN EXECUTION ====================

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Blog Names Enrichment Script         ║');
  console.log('╚════════════════════════════════════════╝');

  if (dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made');
  }

  if (limit) {
    console.log(`\n⚠️  LIMIT MODE - Processing max ${limit} names`);
  }

  // Check API key
  if (!CONFIG.openaiApiKey) {
    console.error('\n❌ ERROR: REACT_APP_OPENAI_API_KEY not found in .env file');
    process.exit(1);
  }

  try {
    // Step 1: Load blog posts
    const blogPosts = loadBlogPosts();

    // Step 2: Extract names
    const blogNames = extractAllNames(blogPosts);

    // Step 3: Load database
    const databaseNames = loadDatabaseChunks();

    // Step 4: Find missing names
    let missingNames = findMissingNames(blogNames, databaseNames);

    // Apply limit if specified
    if (limit && missingNames.length > limit) {
      console.log(`   ⚠️  Limiting to first ${limit} names`);
      missingNames = missingNames.slice(0, limit);
    }

    if (missingNames.length === 0) {
      console.log('\n✅ All blog names already in database! Nothing to do.');
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
    generateReport(blogNames, missingNames, enriched, failed, dryRun);

    console.log('\n✅ Script completed successfully!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
