/**
 * Update all baby name blogs to "Baby Names" category
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

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

// All baby name blog IDs (from baby-name-blogs-report.json)
const babyNameBlogs = [
  { id: "47", title: "Pregnancy Week by Week", oldCategory: "Pregnancy" },
  { id: "baby-names-mean-light-sun-star-2025", title: "Baby Names That Shine", oldCategory: "Meanings" },
  { id: "biblical-baby-names-meanings", title: "Biblical Baby Names", oldCategory: "Origins" },
  { id: "color-gemstone-baby-names-2025", title: "Color & Gemstone Baby Names", oldCategory: "Themes" },
  { id: "gender-neutral-unisex-baby-names-2025", title: "Gender-Neutral Baby Names", oldCategory: "Trends" },
  { id: "how-to-choose-baby-name", title: "How to Choose the Perfect Baby Name", oldCategory: "Guides" },
  { id: "international-baby-names-english-2025", title: "International Baby Names", oldCategory: "Cultural" },
  { id: "irish-baby-names-guide", title: "Irish Baby Names", oldCategory: "Origins" },
  { id: "literary-baby-names-classic-literature-2025", title: "Literary Baby Names", oldCategory: "Themes" },
  { id: "mythology-baby-names-greek-norse-celtic-2025", title: "Mythology Baby Names", oldCategory: "Themes" },
  { id: "names-that-mean-moon-2025", title: "Names That Mean Moon", oldCategory: "Themes" },
  { id: "nature-inspired-baby-names-2025", title: "Nature-Inspired Baby Names", oldCategory: "Themes" },
  { id: "royal-regal-baby-names-history-2025", title: "Royal & Regal Baby Names", oldCategory: "Themes" },
  { id: "short-baby-names-big-meanings-2025", title: "Short Baby Names", oldCategory: "Trends" },
  { id: "top-100-baby-names-2025", title: "Top 100 Baby Names of 2025", oldCategory: "Trends" },
  { id: "unique-baby-names-not-weird", title: "100 Unique Baby Names", oldCategory: "Guides" },
  { id: "vintage-baby-names-comeback-2025", title: "Vintage Baby Names", oldCategory: "Trends" }
];

async function updateCategories() {
  console.log('🔄 Updating all baby name blogs to "Baby Names" category...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const blog of babyNameBlogs) {
    try {
      const blogRef = doc(db, 'blogs', blog.id);
      await updateDoc(blogRef, {
        category: 'Baby Names',
        updatedAt: Date.now()
      });

      console.log(`✅ ${blog.title}`);
      console.log(`   ${blog.oldCategory} → Baby Names\n`);
      successCount++;

    } catch (error) {
      console.error(`❌ Failed: ${blog.title}`);
      console.error(`   Error: ${error.message}\n`);
      errorCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Total blogs: ${babyNameBlogs.length}`);
  console.log(`   Successfully updated: ${successCount}`);
  console.log(`   Failed: ${errorCount}`);

  if (successCount === babyNameBlogs.length) {
    console.log('\n🎉 All baby name blogs now in "Baby Names" category!');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

updateCategories();
