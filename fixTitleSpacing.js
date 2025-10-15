/**
 * Fix leading/trailing spaces in blog titles
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

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

const blogsToFix = [
  'baby-names-mean-light-sun-star-2025',
  'unique-baby-names-not-weird'
];

async function fixSpacing() {
  console.log('🔧 Fixing title spacing issues...\n');

  for (const blogId of blogsToFix) {
    try {
      const blogRef = doc(db, 'blogs', blogId);
      const blogSnap = await getDoc(blogRef);

      if (blogSnap.exists()) {
        const oldTitle = blogSnap.data().title;
        const newTitle = oldTitle.trim();

        if (oldTitle !== newTitle) {
          console.log(`📝 ${blogId}`);
          console.log(`   Old: "${oldTitle}"`);
          console.log(`   New: "${newTitle}"`);

          await updateDoc(blogRef, { title: newTitle });
          console.log(`   ✅ Fixed\n`);
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${blogId}:`, error.message);
    }
  }

  console.log('\n✅ Spacing fixes complete!\n');
  process.exit(0);
}

fixSpacing();
