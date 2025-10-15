/**
 * List all blog IDs in Firestore
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function listBlogs() {
  console.log('📥 Fetching all blogs from Firestore...\n');

  try {
    const blogsRef = collection(db, 'blogs');
    const snapshot = await getDocs(blogsRef);

    console.log(`Found ${snapshot.size} blogs:\n`);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const hasHashLinks = data.content?.includes('href="#"') || false;
      console.log(`ID: ${doc.id}`);
      console.log(`   Slug: ${data.slug || 'N/A'}`);
      console.log(`   Title: ${data.title || 'N/A'}`);
      console.log(`   Has # links: ${hasHashLinks ? '⚠️  YES' : '✅ NO'}`);
      console.log('');
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listBlogs();
