/**
 * Fix Color & Gemstone blog title
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

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

async function fixTitle() {
  console.log('🔧 Fixing Color & Gemstone blog title...\n');

  try {
    const blogRef = doc(db, 'blogs', 'color-gemstone-baby-names-2025');
    await updateDoc(blogRef, {
      title: 'Color & Gemstone Baby Names: 30 Vibrant & Precious Names for 2025'
    });

    console.log('✅ Updated title to: "Color & Gemstone Baby Names: 30 Vibrant & Precious Names for 2025"\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTitle();
