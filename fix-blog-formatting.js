/**
 * Fix Blog Post Formatting Issues
 *
 * Scans all blog posts for markdown syntax (##, **, etc.) that wasn't converted to HTML
 * and converts them to proper HTML formatting
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Convert markdown to HTML
 */
function markdownToHtml(text) {
  if (!text || typeof text !== 'string') return text;

  let html = text;

  // Convert headers (## Header -> <h2>Header</h2>)
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Convert bold (**text** -> <strong>text</strong>)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert italic (*text* -> <em>text</em>)
  html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Convert links ([text](url) -> <a href="url">text</a>)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-600 hover:text-purple-800 underline">$1</a>');

  // Convert unordered lists (- item -> <li>item</li>)
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, '<ul class="list-disc ml-6 my-4">$&</ul>');

  // Convert numbered lists (1. item -> <li>item</li>)
  html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
    if (!match.includes('<ul')) {
      return `<ol class="list-decimal ml-6 my-4">${match}</ol>`;
    }
    return match;
  });

  // Convert line breaks (preserve paragraphs)
  html = html.replace(/\n\n+/g, '</p><p class="mb-4">');

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul') && !html.startsWith('<ol')) {
    html = `<p class="mb-4">${html}</p>`;
  }

  return html;
}

/**
 * Check if content has unformatted markdown
 */
function hasUnformattedMarkdown(content) {
  if (!content || typeof content !== 'string') return false;

  // Check for markdown headers
  if (/^#{1,3} /m.test(content)) return true;

  // Check for markdown bold
  if (/\*\*[^*]+\*\*/.test(content)) return true;

  // Check for markdown lists starting lines
  if (/^[-*] /m.test(content)) return true;

  return false;
}

/**
 * Check and fix a single blog post
 */
async function checkAndFixBlogPost(post, index, total) {
  console.log(`\n[${ index + 1}/${total}] Checking: "${post.title}"`);
  console.log(`   ID: ${post.id}`);
  console.log(`   Slug: ${post.slug}`);

  let needsUpdate = false;
  let changes = [];

  // Check title
  if (hasUnformattedMarkdown(post.title)) {
    console.log(`   ⚠️  Title has unformatted markdown`);
    needsUpdate = true;
    changes.push('title');
  }

  // Check content
  if (hasUnformattedMarkdown(post.content)) {
    console.log(`   ⚠️  Content has unformatted markdown`);
    needsUpdate = true;
    changes.push('content');
  }

  // Check excerpt
  if (hasUnformattedMarkdown(post.excerpt)) {
    console.log(`   ⚠️  Excerpt has unformatted markdown`);
    needsUpdate = true;
    changes.push('excerpt');
  }

  if (!needsUpdate) {
    console.log(`   ✅ Formatting is correct`);
    return { success: true, fixed: false };
  }

  // Fix the formatting
  console.log(`   🔧 Fixing: ${changes.join(', ')}`);

  const updates = {};

  if (changes.includes('title')) {
    // Remove markdown from title (titles should be plain text)
    updates.title = post.title
      .replace(/^#{1,3} /, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');
  }

  if (changes.includes('content')) {
    updates.content = markdownToHtml(post.content);
  }

  if (changes.includes('excerpt')) {
    // Remove markdown from excerpt (should be plain text)
    updates.excerpt = post.excerpt
      .replace(/^#{1,3} /, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');
  }

  // Update Firestore
  try {
    // Convert ID to string (Firebase needs string document IDs)
    const docRef = doc(db, 'blogs', String(post.id));
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });

    console.log(`   ✅ Fixed successfully`);
    return { success: true, fixed: true, changes };

  } catch (error) {
    console.error(`   ❌ Error updating:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 BLOG POST FORMATTING FIX');
  console.log('='.repeat(70));
  console.log('\nScanning for posts with unformatted markdown (##, **, etc.)\n');

  try {
    // Fetch all blog posts
    console.log('📚 Fetching blog posts from Firestore...');
    const blogsRef = collection(db, 'blogs');
    const snapshot = await getDocs(blogsRef);
    const posts = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(post => post.status === 'published');

    console.log(`✅ Found ${posts.length} published posts\n`);
    console.log('='.repeat(70));

    // Check and fix each post
    const results = {
      total: posts.length,
      checked: 0,
      needsFix: 0,
      fixed: 0,
      failed: 0,
      details: []
    };

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const result = await checkAndFixBlogPost(post, i, posts.length);

      results.checked++;

      if (result.fixed) {
        results.needsFix++;
        results.fixed++;
        results.details.push({
          id: post.id,
          title: post.title,
          changes: result.changes
        });
      }

      if (!result.success) {
        results.failed++;
      }

      // Rate limit: Wait 500ms between posts
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('✅ FORMATTING FIX COMPLETE\n');
    console.log('📊 Summary:');
    console.log(`   Total Posts: ${results.total}`);
    console.log(`   Checked: ${results.checked}`);
    console.log(`   Needed Fixing: ${results.needsFix}`);
    console.log(`   ✅ Fixed: ${results.fixed}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    if (results.details.length > 0) {
      console.log('\n📝 Posts That Were Fixed:');
      results.details.forEach((detail, i) => {
        console.log(`\n   ${i + 1}. "${detail.title}"`);
        console.log(`      ID: ${detail.id}`);
        console.log(`      Fixed: ${detail.changes.join(', ')}`);
      });
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Re-deploy to see changes: npm run deploy');
    console.log('   2. Test blog posts in browser');
    console.log('   3. Verify HTML formatting is correct');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
