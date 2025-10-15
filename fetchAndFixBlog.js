/**
 * Fetch blog from Firestore, fix self-referencing links, and update it
 */

const https = require('https');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');

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

// Create search link (Google or Amazon based on product type)
function createSearchLink(linkText, context) {
  // Determine if it's a product (use Amazon) or service (use Google)
  const isService = linkText.toLowerCase().includes('service');

  // Extract product/service name from surrounding context
  const matches = context.match(/<strong>([^<]+)<\/strong>:\s*<a[^>]*>Link to/i);
  const productName = matches ? matches[1] : linkText;

  if (isService) {
    // Use Google search for services
    const searchTerm = encodeURIComponent(productName.trim());
    return `https://www.google.com/search?q=${searchTerm}`;
  } else {
    // Use Amazon search for products
    const searchTerm = encodeURIComponent(productName.trim());
    return `https://www.amazon.com/s?k=${searchTerm}`;
  }
}

async function fixBlog() {
  console.log('📥 Fetching blog from Firestore...\n');

  try {
    const blogRef = doc(db, 'blogs', '65');
    const blogSnap = await getDoc(blogRef);

    if (!blogSnap.exists()) {
      console.error('❌ Blog not found!');
      process.exit(1);
    }

    const blogData = blogSnap.data();
    console.log(`✅ Fetched: "${blogData.title}"\n`);

    let content = blogData.content;
    let fixCount = 0;

    // Find all self-referencing links with context
    const regex = /<strong>([^<]+)<\/strong>:\s*<a\s+href=["']#["'][^>]*>([^<]+)<\/a>/gi;

    console.log('🔧 Fixing links:\n');

    content = content.replace(regex, (match, productName, linkText) => {
      fixCount++;
      const isService = linkText.toLowerCase().includes('service');

      let searchLink, displayText;

      if (isService) {
        // Google search for services
        const searchTerm = encodeURIComponent(productName.trim());
        searchLink = `https://www.google.com/search?q=${searchTerm}`;
        displayText = 'Find Services →';
      } else {
        // Amazon search for products
        const searchTerm = encodeURIComponent(productName.trim());
        searchLink = `https://www.amazon.com/s?k=${searchTerm}`;
        displayText = 'Shop on Amazon →';
      }

      console.log(`  ${fixCount}. ${productName}`);
      console.log(`     → ${searchLink}`);
      console.log(`     (${isService ? 'Google' : 'Amazon'} search)\n`);

      return `<strong>${productName}</strong>: <a href="${searchLink}" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-700 underline">${displayText}</a>`;
    });

    if (fixCount === 0) {
      console.log('✅ No links to fix! Blog is already updated.\n');
      process.exit(0);
    }

    console.log(`\n📝 Updating blog in Firestore...`);

    await updateDoc(blogRef, {
      content: content,
      updatedAt: Date.now()
    });

    console.log(`✅ Successfully updated blog with ${fixCount} fixed links!\n`);
    console.log('🌐 View at: http://localhost:3000/babyname2/blog/postpartum-recovery-essentials\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBlog();
