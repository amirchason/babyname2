/**
 * Find all blogs that mention baby names in their content
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

// Check if content mentions baby names
function hasBabyNameContent(content) {
  if (!content) return false;

  const lowerContent = content.toLowerCase();

  // Check for baby name indicators
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
}

// Check for name list placeholder
function hasNameListPlaceholder(content) {
  if (!content) return false;
  return content.includes('<!-- NAME_LIST_PLACEHOLDER -->');
}

async function findBabyNameBlogs() {
  console.log('🔍 Scanning all blogs for baby name content...\n');

  try {
    const blogsRef = collection(db, 'blogs');
    const snapshot = await getDocs(blogsRef);

    const babyNameBlogs = [];
    const blogsByCategory = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category || 'Unknown';
      const hasBabyNames = hasBabyNameContent(data.content);
      const hasPlaceholder = hasNameListPlaceholder(data.content);

      if (!blogsByCategory[category]) {
        blogsByCategory[category] = [];
      }
      blogsByCategory[category].push({
        id: doc.id,
        slug: data.slug,
        title: data.title,
        hasBabyNames,
        hasPlaceholder
      });

      if (hasBabyNames) {
        babyNameBlogs.push({
          id: doc.id,
          slug: data.slug,
          title: data.title,
          category: category,
          hasPlaceholder: hasPlaceholder
        });
      }
    });

    console.log('📊 Results by Category:\n');
    Object.keys(blogsByCategory).sort().forEach(category => {
      const blogs = blogsByCategory[category];
      const withBabyNames = blogs.filter(b => b.hasBabyNames).length;
      console.log(`${category}: ${withBabyNames}/${blogs.length} mention baby names`);
    });

    console.log('\n\n🍼 Blogs with Baby Name Content:\n');
    babyNameBlogs.forEach((blog, i) => {
      console.log(`${i + 1}. ${blog.title}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Has name list placeholder: ${blog.hasPlaceholder ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });

    console.log(`\n📈 Summary:`);
    console.log(`   Total blogs: ${snapshot.size}`);
    console.log(`   Blogs with baby name content: ${babyNameBlogs.length}`);
    console.log(`   Blogs with name list placeholder: ${babyNameBlogs.filter(b => b.hasPlaceholder).length}`);

    // Save report
    const fs = require('fs');
    fs.writeFileSync('baby-name-blogs-report.json', JSON.stringify(babyNameBlogs, null, 2));
    console.log(`\n📄 Full report saved to: baby-name-blogs-report.json`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findBabyNameBlogs();
