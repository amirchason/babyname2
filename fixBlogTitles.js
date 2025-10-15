/**
 * Fix the 2 incorrectly formatted blog titles
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

// Manual corrections needed
const corrections = [
  {
    id: "biblical-baby-names-meanings",
    oldTitle: "Biblical 36 Baby Names: Complete Guide with Meanings & Origins",
    newTitle: "36 Biblical Baby Names: Complete Guide with Meanings & Origins"
  },
  {
    id: "irish-baby-names-guide",
    oldTitle: "Irish 37 Baby Names: Pronunciation Guide & Beautiful Meanings",
    newTitle: "37 Irish Baby Names: Pronunciation Guide & Beautiful Meanings"
  }
];

async function fixTitles() {
  console.log('🔧 Fixing incorrectly formatted blog titles...\n');

  for (const correction of corrections) {
    console.log(`📝 Fixing: ${correction.id}`);
    console.log(`   Old: ${correction.oldTitle}`);
    console.log(`   New: ${correction.newTitle}\n`);

    try {
      const blogRef = doc(db, 'blogs', correction.id);
      await updateDoc(blogRef, {
        title: correction.newTitle
      });

      console.log(`✅ Successfully updated ${correction.id}\n`);

    } catch (error) {
      console.error(`❌ Error updating ${correction.id}:`, error.message);
    }
  }

  console.log('\n✅ All corrections complete!\n');
  process.exit(0);
}

fixTitles().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
