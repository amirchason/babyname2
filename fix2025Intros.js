/**
 * Fix intros where "2025" was incorrectly replaced with name counts
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
  {
    id: 'royal-regal-baby-names-history-2025',
    find: 'Ah, 36!',
    replace: 'Ah, 2025!'
  },
  {
    id: 'top-100-baby-names-2025',
    find: 'As we navigate through 41,',
    replace: 'As we navigate through 2025,'
  }
];

async function fixYearReferences() {
  console.log('🔧 Fixing year references in intros...\n');

  for (const fix of blogsToFix) {
    try {
      const blogRef = doc(db, 'blogs', fix.id);
      const blogSnap = await getDoc(blogRef);

      if (blogSnap.exists()) {
        const content = blogSnap.data().content;
        const newContent = content.replace(fix.find, fix.replace);

        if (content !== newContent) {
          console.log(`📝 ${fix.id}`);
          console.log(`   Restoring: "${fix.find}" → "${fix.replace}"`);

          await updateDoc(blogRef, { content: newContent });
          console.log(`   ✅ Fixed\n`);
        }
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.id}:`, error.message);
    }
  }

  console.log('\n✅ Year reference fixes complete!\n');
  process.exit(0);
}

fixYearReferences();
