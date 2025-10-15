const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCydKy79vU999mXO60x-mmg8MRuozPCqqE',
  authDomain: 'babynames-app-9fa2a.firebaseapp.com',
  projectId: 'babynames-app-9fa2a',
  storageBucket: 'babynames-app-9fa2a.appspot.com',
  messagingSenderId: '792099154161',
  appId: '1:792099154161:web:1a5b0d4e7f8c9d0e1f2a3b'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCategories() {
  const blogsRef = collection(db, 'blogs');
  const snapshot = await getDocs(blogsRef);

  const categories = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    const category = data.category || 'Unknown';

    if (!categories[category]) {
      categories[category] = 0;
    }
    categories[category]++;
  });

  console.log('📊 Blog Distribution by Category:\n');
  Object.keys(categories).sort().forEach(category => {
    console.log(`${category}: ${categories[category]} blogs`);
  });

  console.log(`\nTotal: ${snapshot.size} blogs`);
  process.exit(0);
}

checkCategories();
