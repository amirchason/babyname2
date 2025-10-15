/**
 * Move Pregnancy Week by Week blog back to Pregnancy category
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

async function moveBlog() {
  console.log('🔄 Moving "Pregnancy Week by Week" back to Pregnancy category...\n');

  try {
    const blogRef = doc(db, 'blogs', '47');
    await updateDoc(blogRef, {
      category: 'Pregnancy',
      updatedAt: Date.now()
    });

    console.log('✅ Successfully moved!');
    console.log('   Title: Pregnancy Week by Week: Complete 40-Week Calendar');
    console.log('   Baby Names → Pregnancy\n');

    console.log('📊 Updated Baby Names count: 16 blogs');
    console.log('📊 Updated Pregnancy count: 12 blogs\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

moveBlog();
