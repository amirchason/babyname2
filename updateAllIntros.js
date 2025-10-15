/**
 * Aggressively update ALL blog introductions to match actual name counts
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');

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
 * Comprehensive intro number replacements
 * Searches entire content but focuses on intro paragraphs
 */
function updateIntroComprehensively(content, actualCount) {
  if (!content) return content;

  let updated = content;

  // AGGRESSIVE PATTERNS - Replace ANY number reference near name-related keywords

  // Pattern 1: "X+ names/options/choices" (most common)
  updated = updated.replace(/(\d+)\+(\s+\w+)*\s+(names|options|choices|selections|picks|gems|characters|beauties)/gi,
    `${actualCount}$2 $3`);

  // Pattern 2: "over/more than/at least X" near names
  updated = updated.replace(/(over|more than|at least|up to|nearly)\s+(\d+)(\s+\w+)*\s+(names|options|choices)/gi,
    `${actualCount}$3 $4`);

  // Pattern 3: "X or more"
  updated = updated.replace(/(\d+)\s+or more\s+(names|options|choices)/gi,
    `${actualCount} $2`);

  // Pattern 4: "collection/list/selection of X"
  updated = updated.replace(/(collection|list|selection|curation|compilation|array|set)\s+of\s+(\d+)(\+)?(\s+\w+)*\s+(names|options)/gi,
    `$1 of ${actualCount}$4 $5`);

  // Pattern 5: Numbers in <p> tags at start (intro paragraphs)
  updated = updated.replace(/<p[^>]*>([^<]*?)\b(\d+)(\+)?\b([^<]*?\b(names|options|choices|selections)\b[^<]*?)<\/p>/gi,
    (match, before, num, plus, after) => {
      return `<p>${before}${actualCount}${after}</p>`;
    });

  // Pattern 6: "curated X", "handpicked X", "selected X"
  updated = updated.replace(/(curated|handpicked|selected|chosen|compiled)\s+(\d+)(\+)?(\s+\w+)*\s+(names|options)/gi,
    `$1 ${actualCount}$4 $5`);

  // Pattern 7: "X beautiful/stunning/gorgeous/perfect names"
  updated = updated.replace(/(\d+)(\+)?\s+(beautiful|stunning|gorgeous|perfect|lovely|timeless|classic|modern|unique|special|wonderful|amazing|incredible|fantastic|excellent)\s+(names|options|choices)/gi,
    `${actualCount} $3 $4`);

  // Pattern 8: "featuring X", "includes X", "contains X"
  updated = updated.replace(/(featuring|includes|contains|offers|presents|showcases)\s+(\d+)(\+)?(\s+\w+)*\s+(names|options)/gi,
    `$1 ${actualCount}$4 $5`);

  return updated;
}

async function updateAllIntros() {
  console.log('🔄 COMPREHENSIVE INTRO UPDATE - All Baby Names Blogs\n');
  console.log('📊 Fetching all blogs from Firebase...\n');

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

      const oldContent = blogData.content || '';
      const newContent = updateIntroComprehensively(oldContent, actualCount);

      if (newContent !== oldContent) {
        console.log(`\n📝 ${blogData.slug}`);
        console.log(`   Count: ${actualCount} names`);

        // Show first intro paragraph changes
        const oldIntroMatch = oldContent.match(/<p[^>]*>(.*?)<\/p>/);
        const newIntroMatch = newContent.match(/<p[^>]*>(.*?)<\/p>/);

        if (oldIntroMatch && newIntroMatch && oldIntroMatch[1] !== newIntroMatch[1]) {
          const oldText = oldIntroMatch[1].replace(/<[^>]+>/g, '').trim();
          const newText = newIntroMatch[1].replace(/<[^>]+>/g, '').trim();

          console.log(`   Old intro: ${oldText.substring(0, 120)}...`);
          console.log(`   New intro: ${newText.substring(0, 120)}...`);
        }

        // Apply update to Firebase
        try {
          const blogRef = doc(db, 'blogs', docSnap.id);
          await updateDoc(blogRef, { content: newContent });

          updates.push({
            id: docSnap.id,
            slug: blogData.slug,
            actualCount
          });

          console.log(`   ✅ Updated successfully`);

        } catch (error) {
          console.error(`   ❌ Error updating: ${error.message}`);
        }

      } else {
        console.log(`\n✅ ${blogData.slug} - No intro changes needed (${actualCount} names)`);
      }

      console.log('-'.repeat(80));
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 INTRO UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total blogs processed: ${snapshot.size}`);
    console.log(`Intros updated: ${updates.length}`);

    if (updates.length > 0) {
      console.log('\n📋 Blogs with Updated Intros:');
      updates.forEach((update, i) => {
        console.log(`${i + 1}. ${update.slug} (${update.actualCount} names)`);
      });

      fs.writeFileSync('blog-intro-updates.json', JSON.stringify(updates, null, 2));
      console.log('\n📄 Update log saved to: blog-intro-updates.json');
    }

    console.log('\n✅ All intro updates complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

updateAllIntros();
