/**
 * Update blog titles AND introductions to reflect actual name counts
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
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

// Load actual name counts
const nameCounts = JSON.parse(fs.readFileSync('blog-name-counts.json', 'utf8'));
const countMap = {};
nameCounts.forEach(blog => {
  countMap[blog.id] = blog.nameCount;
});

/**
 * Generate accurate title based on actual count
 */
function generateAccurateTitle(oldTitle, actualCount) {
  let newTitle = oldTitle;

  // Pattern 1: "X+ something" (e.g., "11+ Timeless Names")
  newTitle = newTitle.replace(/:\s*\d+\+\s+/g, `: ${actualCount} `);
  newTitle = newTitle.replace(/(\d+)\+\s+/g, `${actualCount} `);

  // Pattern 2: "X Majestic Names", "X Beautiful Names", etc. (adjective + Names)
  newTitle = newTitle.replace(/:\s*(\d+)\s+(Majestic|Timeless|Beautiful|Stunning|Gorgeous|Perfect|Powerful|Vibrant|Unique|Global|Unisex|Lunar|Old-Fashioned|Earth|Flora|Fauna)\s+(Names|Characters|Gems|Options)/gi,
    `: ${actualCount} $2 $3`);

  // Pattern 3: "X Baby Names", "X Unique Baby Names"
  newTitle = newTitle.replace(/(\d+)\s+(Baby Names|Unique Baby Names|Names)/g, `${actualCount} $2`);

  // Pattern 4: "Top X" or "X Unique"
  newTitle = newTitle.replace(/(Top|)\s*(\d+)\s+(Baby Names|Unique|Names)/gi,
    `$1 ${actualCount} $3`.trim());

  // If still no change and no number exists, add count intelligently
  if (newTitle === oldTitle && !/\d+/.test(oldTitle)) {
    if (oldTitle.includes('Baby Names')) {
      newTitle = oldTitle.replace(/Baby Names/g, `${actualCount} Baby Names`);
    } else if (oldTitle.includes('Names')) {
      newTitle = oldTitle.replace(/Names/g, `${actualCount} Names`);
    }
  }

  return newTitle;
}

/**
 * Update introduction text with accurate count
 * Focuses on first 1000 characters to avoid changing numbers elsewhere
 */
function updateIntroNumbers(content, actualCount) {
  if (!content) return content;

  // Extract first 1000 chars (intro section)
  const introLength = Math.min(1000, content.length);
  const intro = content.substring(0, introLength);
  const rest = content.substring(introLength);

  let updatedIntro = intro;

  // Pattern 1: "X+ names" or "X+ beautiful names" etc.
  updatedIntro = updatedIntro.replace(/(\d+)\+(\s+\w+)?\s+(names|options|choices|selections)/gi,
    `${actualCount}$2 $3`);

  // Pattern 2: "over X", "more than X", "at least X" near "names"
  updatedIntro = updatedIntro.replace(/(over|more than|at least)\s+(\d+)(\s+\w+)?\s+(names|options)/gi,
    `${actualCount}$3 $4`);

  // Pattern 3: "X or more names"
  updatedIntro = updatedIntro.replace(/(\d+)\s+or more\s+(names|options)/gi,
    `${actualCount} $2`);

  // Pattern 4: Standalone "X names" at start of sentences (be careful)
  updatedIntro = updatedIntro.replace(/(\.|^|<p>|<h\d>)\s*(\d+)\s+(beautiful|stunning|unique|perfect|timeless|gorgeous|lovely|classic|modern|vintage|popular)?\s*(names)/gi,
    `$1 ${actualCount} $3 $4`);

  // Pattern 5: "collection of X", "list of X", "curated X"
  updatedIntro = updatedIntro.replace(/(collection|list|selection|curation)\s+of\s+(\d+)(\+)?\s+(names|options)/gi,
    `$1 of ${actualCount} $4`);

  return updatedIntro + rest;
}

async function updateAllBlogs() {
  console.log('🔄 Updating blog titles AND introductions with accurate counts...\n');
  console.log('📊 Fetching all Baby Names blogs from Firebase...\n');

  try {
    const q = query(
      collection(db, 'blogs'),
      where('category', '==', 'Baby Names'),
      where('status', '==', 'published')
    );

    const snapshot = await getDocs(q);
    const updates = [];

    console.log(`Found ${snapshot.size} blogs to process\n`);
    console.log('='.repeat(80));

    for (const docSnap of snapshot.docs) {
      const blogData = docSnap.data();
      const actualCount = countMap[docSnap.id];

      if (!actualCount) {
        console.log(`⚠️  Skipping ${docSnap.id} - no count data`);
        continue;
      }

      const oldTitle = blogData.title;
      const oldContent = blogData.content || '';

      // Generate new title
      const newTitle = generateAccurateTitle(oldTitle, actualCount);

      // Update introduction numbers
      const newContent = updateIntroNumbers(oldContent, actualCount);

      const titleChanged = newTitle !== oldTitle;
      const contentChanged = newContent !== oldContent;

      if (titleChanged || contentChanged) {
        console.log(`\n📝 ${blogData.slug}`);
        console.log(`   Actual count: ${actualCount} names`);

        if (titleChanged) {
          console.log(`   📌 TITLE:`);
          console.log(`      Old: ${oldTitle}`);
          console.log(`      New: ${newTitle}`);
        }

        if (contentChanged) {
          // Show intro changes (first 300 chars)
          const oldIntro = oldContent.substring(0, 300).replace(/<[^>]+>/g, ' ').trim();
          const newIntro = newContent.substring(0, 300).replace(/<[^>]+>/g, ' ').trim();

          if (oldIntro !== newIntro) {
            console.log(`   📄 INTRO UPDATED (preview):`);
            console.log(`      Old: ${oldIntro.substring(0, 150)}...`);
            console.log(`      New: ${newIntro.substring(0, 150)}...`);
          }
        }

        // Prepare update object
        const updateData = {};
        if (titleChanged) updateData.title = newTitle;
        if (contentChanged) updateData.content = newContent;

        // Apply update to Firebase
        try {
          const blogRef = doc(db, 'blogs', docSnap.id);
          await updateDoc(blogRef, updateData);

          updates.push({
            id: docSnap.id,
            slug: blogData.slug,
            actualCount,
            titleChanged,
            contentChanged,
            oldTitle,
            newTitle
          });

          console.log(`   ✅ Updated successfully`);

        } catch (error) {
          console.error(`   ❌ Error updating: ${error.message}`);
        }

      } else {
        console.log(`\n✅ ${blogData.slug} - No changes needed (${actualCount} names)`);
      }

      console.log('-'.repeat(80));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total blogs processed: ${snapshot.size}`);
    console.log(`Blogs updated: ${updates.length}`);
    console.log(`Title updates: ${updates.filter(u => u.titleChanged).length}`);
    console.log(`Content updates: ${updates.filter(u => u.contentChanged).length}`);

    if (updates.length > 0) {
      console.log('\n📋 Updated Blogs:');
      updates.forEach((update, i) => {
        console.log(`\n${i + 1}. ${update.slug} (${update.actualCount} names)`);
        if (update.titleChanged) {
          console.log(`   Title: ${update.oldTitle}`);
          console.log(`       → ${update.newTitle}`);
        }
        if (update.contentChanged) {
          console.log(`   Intro: Updated number references`);
        }
      });

      // Save update log
      fs.writeFileSync('blog-full-updates.json', JSON.stringify(updates, null, 2));
      console.log('\n📄 Full update log saved to: blog-full-updates.json');
    }

    console.log('\n✅ All updates complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

updateAllBlogs();
