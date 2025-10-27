/**
 * Check all blog posts in Firestore and their order
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, orderBy, getDocs } = require('firebase/firestore');

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

async function checkPosts() {
  try {
    console.log('📊 Checking all blog posts in Firestore...\n');

    const q = query(
      collection(db, 'blogs'),
      orderBy('publishedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    console.log(`Total posts found: ${snapshot.docs.length}\n`);

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const date = new Date(data.publishedAt);

      console.log(`${index + 1}. ${data.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Category: ${data.category}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Published: ${date.toLocaleString()}`);
      console.log(`   Timestamp: ${data.publishedAt}`);
      console.log(`   Featured: ${data.featured}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking posts:', error);
    process.exit(1);
  }
}

checkPosts();
