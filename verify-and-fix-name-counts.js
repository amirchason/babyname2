/**
 * Verify that blog post titles match actual name counts
 * Fix titles if they don't match the content
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog-posts-seasonal');

function countNamesInPost(content) {
  // Count numbered list items (1. **Name**, 2. **Name**, etc.)
  const numberPattern = /^\d+\.\s+\*\*[^*]+\*\*/gm;
  const matches = content.match(numberPattern);
  return matches ? matches.length : 0;
}

function extractTitleNumber(title) {
  const match = title.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function updateTitle(content, oldNumber, newNumber) {
  // Replace the number in the title (first H1)
  const titleRegex = new RegExp(`^#\\s+(.+?):\\s*${oldNumber}\\s+(.+?)$`, 'm');
  return content.replace(titleRegex, `# $1: ${newNumber} $2`);
}

async function verifyAndFix() {
  console.log('🔍 Verifying name counts in all 30 blog posts...\n');

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
  const results = [];

  for (const file of files) {
    const filepath = path.join(blogDir, file);
    let content = fs.readFileSync(filepath, 'utf8');

    // Extract title
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (!titleMatch) {
      console.log(`⚠️  ${file}: No title found`);
      continue;
    }

    const title = titleMatch[1];
    const titleNumber = extractTitleNumber(title);
    const actualCount = countNamesInPost(content);

    console.log(`📄 ${file}`);
    console.log(`   Title: ${title}`);
    console.log(`   Expected: ${titleNumber} names`);
    console.log(`   Actual: ${actualCount} names`);

    if (titleNumber && titleNumber !== actualCount) {
      console.log(`   ⚠️  MISMATCH! Fixing title...`);

      // Update the title with correct count
      content = updateTitle(content, titleNumber, actualCount);
      fs.writeFileSync(filepath, content, 'utf8');

      console.log(`   ✅ Updated title to reflect ${actualCount} names`);
      results.push({ file, oldCount: titleNumber, newCount: actualCount, fixed: true });
    } else if (titleNumber === actualCount) {
      console.log(`   ✅ Count matches!`);
      results.push({ file, count: actualCount, fixed: false });
    } else {
      console.log(`   ⚠️  No number in title`);
      results.push({ file, count: actualCount, fixed: false, noNumber: true });
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const fixed = results.filter(r => r.fixed).length;
  const correct = results.filter(r => !r.fixed && !r.noNumber).length;
  const noNumber = results.filter(r => r.noNumber).length;

  console.log(`✅ Correct: ${correct}/${files.length}`);
  console.log(`🔧 Fixed: ${fixed}/${files.length}`);
  console.log(`⚠️  No number: ${noNumber}/${files.length}`);

  if (fixed > 0) {
    console.log('\n🔧 Fixed posts:');
    results.filter(r => r.fixed).forEach(r => {
      console.log(`   ${r.file}: ${r.oldCount} → ${r.newCount} names`);
    });
  }

  console.log('\n✨ Verification complete!\n');
}

verifyAndFix().catch(console.error);
