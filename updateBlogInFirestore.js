/**
 * Update blog in Firestore with fixed content
 * Run this from the React app context
 */

// This script needs to be run in a browser console on the app page
// Or we can create a temporary admin page to do the update

const updateScript = `
// Run this in browser console on http://localhost:3000/babyname2
(async function() {
  const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');

  // Your Firebase config (from src/config/firebase.ts)
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

  // Read fixed content
  const response = await fetch('/fixed-blog-content.html');
  const fixedContent = await response.text();

  // Update blog
  const blogRef = doc(db, 'blogs', 'postpartum-recovery-essentials');
  await updateDoc(blogRef, {
    content: fixedContent,
    updatedAt: Date.now()
  });

  console.log('✅ Blog updated successfully!');
})();
`;

console.log('To update the blog in Firestore, you have two options:\n');
console.log('Option 1: Use Firebase Console');
console.log('  1. Go to: https://console.firebase.google.com/project/babynames-app-9fa2a/firestore');
console.log('  2. Navigate to: blogs > postpartum-recovery-essentials');
console.log('  3. Edit the "content" field');
console.log('  4. Copy content from: fixed-blog-content.html\n');

console.log('Option 2: Create an admin update page');
console.log('  (Let me create a React component for you to update blogs)\n');

// Better approach: Create a Node.js script using firebase-admin
const fs = require('fs');
const adminScript = `
// updateBlogAdmin.js - Use this if you have firebase-admin installed
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize with service account or use default credentials
admin.initializeApp({
  projectId: 'babynames-app-9fa2a'
});

const db = admin.firestore();

async function updateBlog() {
  const fixedContent = fs.readFileSync('fixed-blog-content.html', 'utf8');

  await db.collection('blogs').doc('postpartum-recovery-essentials').update({
    content: fixedContent,
    updatedAt: Date.now()
  });

  console.log('✅ Blog updated!');
}

updateBlog().then(() => process.exit(0)).catch(console.error);
`;

fs.writeFileSync('updateBlogAdmin.js', adminScript);
console.log('📄 Admin update script saved to: updateBlogAdmin.js\n');
console.log('Since we don\'t have firebase-admin setup, I\'ll create a React component instead...\n');
