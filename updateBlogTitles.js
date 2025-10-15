/**
 * Update blog titles to reflect actual name counts
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE",
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "792099154161",
  appId: "1:792099154161:web:1a5b0d4e7f8c9d0e1f2a3b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Load name counts
const nameCounts = JSON.parse(fs.readFileSync('blog-name-counts.json', 'utf8'));

/**
 * Generate new title with accurate count
 */
function generateNewTitle(oldTitle, actualCount) {
  // Pattern 1: "Topic: X+ Details" -> "Topic: [count] Details"
  let newTitle = oldTitle.replace(/:\s*\d+\+\s+/g, `: ${actualCount} `);

  // If no number pattern found, try to add count intelligently
  if (newTitle === oldTitle) {
    // Check if title already has a number
    const hasNumber = /\d+/.test(oldTitle);
    if (!hasNumber) {
      // Add count before "Baby Names" for better readability
      if (oldTitle.includes('Baby Names')) {
        newTitle = oldTitle.replace(/Baby Names/g, `${actualCount} Baby Names`);
      } else if (oldTitle.includes('Names')) {
        // Add count before "Names" as fallback
        newTitle = oldTitle.replace(/Names/g, `${actualCount} Names`);
      } else {
        // Add count after first colon as last resort
        newTitle = oldTitle.replace(/:\s*/, `: ${actualCount} `);
      }
    }
  }

  return newTitle;
}

async function updateBlogTitles() {
  console.log('🔄 Updating blog titles with accurate name counts...\n');

  const updates = [];
  let successCount = 0;
  let errorCount = 0;

  for (const blog of nameCounts) {
    const oldTitle = blog.title;
    const actualCount = blog.nameCount;

    // Generate new title
    const newTitle = generateNewTitle(oldTitle, actualCount);

    // Only update if title changed
    if (newTitle !== oldTitle) {
      console.log(`📝 Updating: ${blog.slug}`);
      console.log(`   Old: ${oldTitle}`);
      console.log(`   New: ${newTitle}`);
      console.log(`   Count: ${actualCount} names\n`);

      try {
        const blogRef = doc(db, 'blogs', blog.id);
        await updateDoc(blogRef, {
          title: newTitle
        });

        updates.push({
          id: blog.id,
          slug: blog.slug,
          oldTitle,
          newTitle,
          count: actualCount
        });

        successCount++;

      } catch (error) {
        console.error(`❌ Error updating ${blog.slug}:`, error.message);
        errorCount++;
      }
    } else {
      console.log(`✅ No change needed: ${blog.slug} (${actualCount} names)`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Update Summary:');
  console.log('='.repeat(60));
  console.log(`Total blogs checked: ${nameCounts.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`No changes needed: ${nameCounts.length - successCount - errorCount}`);

  if (updates.length > 0) {
    console.log('\n📋 Updated Titles:');
    updates.forEach((update, i) => {
      console.log(`\n${i + 1}. ${update.slug}`);
      console.log(`   Count: ${update.count} names`);
      console.log(`   Old: ${update.oldTitle}`);
      console.log(`   New: ${update.newTitle}`);
    });

    // Save update log
    fs.writeFileSync('blog-title-updates.json', JSON.stringify(updates, null, 2));
    console.log('\n📄 Update log saved to: blog-title-updates.json');
  }

  console.log('\n✅ Blog title update complete!\n');
  process.exit(0);
}

updateBlogTitles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
