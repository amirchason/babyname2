const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

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

async function checkSamplePost() {
  try {
    console.log('Fetching sample blog post...\n');

    const q = query(collection(db, 'blogs'), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No blog posts found!');
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    console.log('=== SAMPLE BLOG POST ===');
    console.log('ID:', doc.id);
    console.log('Title:', data.title);
    console.log('Published:', data.published);
    console.log('Category:', data.category);
    console.log('\n=== CONTENT PREVIEW (first 800 chars) ===');
    console.log(data.content.substring(0, 800));
    console.log('\n...\n');
    console.log('\n=== ANALYSIS ===');
    console.log('Content Type:', typeof data.content);
    console.log('Content Length:', data.content.length, 'characters');
    console.log('Contains Markdown Headers (##):', data.content.includes('##'));
    console.log('Contains Markdown Bold (**):', data.content.includes('**'));
    console.log('Contains HTML Tags (<h2>):', data.content.includes('<h2>'));
    console.log('Contains HTML Tags (<strong>):', data.content.includes('<strong>'));

  } catch (error) {
    console.error('Error:', error);
  }

  process.exit(0);
}

checkSamplePost();
