const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Check if content has baby name indicators
const hasBabyNameContent = (content) => {
  if (!content) return false;
  const lowerContent = content.toLowerCase();
  const indicators = [
    'baby name',
    'baby names',
    'name for baby',
    'name meaning',
    'name origin',
    'popular names',
    'unique names',
    'girl names',
    'boy names',
    'gender-neutral names',
    'unisex names',
    'biblical names',
    'modern names',
    'traditional names',
    'vintage names',
    'trendy names'
  ];
  return indicators.some(indicator => lowerContent.includes(indicator));
};

async function checkBlogPost() {
  try {
    const snapshot = await db.collection('blogs')
      .where('slug', '==', 'literary-baby-names-classic-literature-2025')
      .where('status', '==', 'published')
      .get();

    if (snapshot.empty) {
      console.log('❌ Blog post not found!');
      return;
    }

    const post = snapshot.docs[0].data();
    console.log('✅ Found post:', post.title);
    console.log('Category:', post.category);
    console.log('Content length:', post.content?.length || 0);
    
    const hasBabyNames = hasBabyNameContent(post.content);
    console.log('Has baby name content?', hasBabyNames);
    
    // Check for specific indicators
    const lowerContent = post.content.toLowerCase();
    console.log('\nIndicators found:');
    console.log('- "baby name":', lowerContent.includes('baby name'));
    console.log('- "baby names":', lowerContent.includes('baby names'));
    console.log('- First 500 chars:', post.content.substring(0, 500));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkBlogPost();
