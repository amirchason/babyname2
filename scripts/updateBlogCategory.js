/**
 * Update blog post category from "Personal Stories" to "Personal Blogs"
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70",
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.firebasestorage.app",
  messagingSenderId: "1093132372253",
  appId: "1:1093132372253:web:0327c13610942d60f4f9f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateCategory() {
  try {
    console.log('📝 Updating blog post category...');

    const docRef = doc(db, 'blogs', 'the-name-panic-new-dad-confession-2025');

    await updateDoc(docRef, {
      category: 'Personal Blogs'
    });

    console.log('✅ Category updated successfully!');
    console.log('   Old: "Personal Stories"');
    console.log('   New: "Personal Blogs"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    process.exit(1);
  }
}

updateCategory();
