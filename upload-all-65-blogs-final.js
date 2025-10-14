#!/usr/bin/env node

/**
 * 🚀 UPLOAD ALL 65 BLOG POSTS - FINAL VERSION
 *
 * Uploads ALL blog posts across 5 pillars to Firestore with complete SEO structure:
 * 1. Baby Names (10 posts)
 * 2. Baby Milestones (20 posts)
 * 3. Baby Gear (12 posts)
 * 4. Pregnancy (12 posts)
 * 5. Postpartum (11 posts)
 *
 * Total: 65 blog posts
 *
 * Features:
 * - Full categorization across 5 pillars
 * - Internal linking (related posts within same pillar)
 * - Pillar hub references
 * - Breadcrumbs for SEO
 * - Complete metadata
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  authDomain: "babynames-app-9fa2a.firebaseapp.com",
  projectId: "babynames-app-9fa2a",
  storageBucket: "babynames-app-9fa2a.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//===========================================
// PILLAR CONFIGURATION
//===========================================

const PILLARS = {
  'baby-names': {
    title: 'Baby Names',
    slug: 'baby-names',
    url: '/babyname2/blog/baby-names',
    directory: 'blog-posts-new'
  },
  'baby-milestones': {
    title: 'Baby Milestones',
    slug: 'baby-milestones',
    url: '/babyname2/blog/baby-milestones',
    directory: 'blog-posts-milestones'
  },
  'baby-gear': {
    title: 'Baby Gear',
    slug: 'baby-gear',
    url: '/babyname2/blog/baby-gear',
    directory: 'blog-posts-baby-gear'
  },
  'pregnancy': {
    title: 'Pregnancy',
    slug: 'pregnancy',
    url: '/babyname2/blog/pregnancy',
    directory: 'blog-posts-pregnancy'
  },
  'postpartum': {
    title: 'Postpartum',
    slug: 'postpartum',
    url: '/babyname2/blog/postpartum',
    directory: 'blog-posts-postpartum'
  }
};

//===========================================
// HELPER FUNCTIONS
//===========================================

function getPillarHub(pillarSlug) {
  return PILLARS[pillarSlug] || null;
}

function generateBreadcrumbs(post, pillarSlug) {
  const pillar = PILLARS[pillarSlug];
  if (!pillar) return [];

  return [
    { label: "Home", url: "/babyname2" },
    { label: "Blog", url: "/babyname2/blog" },
    { label: pillar.title, url: pillar.url },
    { label: post.title, url: `${pillar.url}/${post.slug}` }
  ];
}

function findRelatedPosts(currentPost, allPostsInPillar) {
  // Find related posts within same pillar (exclude current post)
  const related = allPostsInPillar
    .filter(p => p.id !== currentPost.id)
    .slice(0, 6) // Limit to 6 related posts
    .map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category
    }));

  return related;
}

//===========================================
// LOAD POSTS FROM DIRECTORIES
//===========================================

function loadPostsFromDirectory(dirPath, pillarSlug, category) {
  if (!fs.existsSync(dirPath)) {
    console.log(`   ⚠️  Directory not found: ${dirPath}`);
    return [];
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

  const posts = files.map(filename => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dirPath, filename), 'utf8'));
      return {
        ...data,
        category: category,
        pillar: pillarSlug
      };
    } catch (error) {
      console.error(`   ❌ Error loading ${filename}: ${error.message}`);
      return null;
    }
  }).filter(p => p !== null);

  return posts;
}

//===========================================
// MAIN UPLOAD FUNCTION
//===========================================

async function uploadAll65Blogs() {
  console.log('🚀 UPLOADING ALL 65 BLOG POSTS WITH SEO STRUCTURE\n');
  console.log('================================================================================\n');
  console.log('📦 PILLARS:\n');
  Object.entries(PILLARS).forEach(([slug, pillar]) => {
    console.log(`   ${pillar.title} (${slug})`);
  });
  console.log('\n================================================================================\n');

  // Load all posts by pillar
  const allPostsByPillar = {};

  // 1. Baby Names
  console.log('📂 Loading Baby Names posts...');
  const babyNamesDir = path.join(__dirname, PILLARS['baby-names'].directory);
  allPostsByPillar['baby-names'] = loadPostsFromDirectory(
    babyNamesDir,
    'baby-names',
    'Baby Names'
  );
  console.log(`   ✅ Loaded ${allPostsByPillar['baby-names'].length} posts\n`);

  // 2. Baby Milestones
  console.log('📂 Loading Baby Milestones posts...');
  const milestonesDir = path.join(__dirname, PILLARS['baby-milestones'].directory);
  allPostsByPillar['baby-milestones'] = loadPostsFromDirectory(
    milestonesDir,
    'baby-milestones',
    'Baby Milestones'
  );
  console.log(`   ✅ Loaded ${allPostsByPillar['baby-milestones'].length} posts\n`);

  // 3. Baby Gear
  console.log('📂 Loading Baby Gear posts...');
  const babyGearDir = path.join(__dirname, PILLARS['baby-gear'].directory);
  allPostsByPillar['baby-gear'] = loadPostsFromDirectory(
    babyGearDir,
    'baby-gear',
    'Baby Gear'
  );
  console.log(`   ✅ Loaded ${allPostsByPillar['baby-gear'].length} posts\n`);

  // 4. Pregnancy
  console.log('📂 Loading Pregnancy posts...');
  const pregnancyDir = path.join(__dirname, PILLARS['pregnancy'].directory);
  allPostsByPillar['pregnancy'] = loadPostsFromDirectory(
    pregnancyDir,
    'pregnancy',
    'Pregnancy'
  );
  console.log(`   ✅ Loaded ${allPostsByPillar['pregnancy'].length} posts\n`);

  // 5. Postpartum
  console.log('📂 Loading Postpartum posts...');
  const postpartumDir = path.join(__dirname, PILLARS['postpartum'].directory);
  allPostsByPillar['postpartum'] = loadPostsFromDirectory(
    postpartumDir,
    'postpartum',
    'Postpartum'
  );
  console.log(`   ✅ Loaded ${allPostsByPillar['postpartum'].length} posts\n`);

  // Combine all posts
  const allPosts = Object.values(allPostsByPillar).flat();
  console.log(`📊 Total posts to upload: ${allPosts.length}\n`);
  console.log('================================================================================\n');

  // Upload each post with full SEO structure
  const results = { success: [], failed: [] };
  let uploadedCount = 0;

  for (const post of allPosts) {
    uploadedCount++;
    console.log(`📝 POST ${uploadedCount}/${allPosts.length}: ${post.title}`);
    console.log(`   Category: ${post.category}`);
    console.log(`   Pillar: ${post.pillar}`);

    try {
      // Get pillar hub reference
      const pillarHub = getPillarHub(post.pillar);

      // Generate breadcrumbs
      const breadcrumbs = generateBreadcrumbs(post, post.pillar);

      // Find related posts within same pillar
      const relatedPosts = findRelatedPosts(post, allPostsByPillar[post.pillar]);

      // Build complete post object
      const completePost = {
        ...post,
        category: post.category,
        pillar: post.pillar,
        pillarHub: pillarHub,
        breadcrumbs: breadcrumbs,
        relatedPosts: relatedPosts,
        status: 'published',
        publishedAt: post.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: false,
        // SEO metadata
        internalLinksCount: relatedPosts.length,
        topicCluster: post.pillar
      };

      // Upload to Firestore
      const docRef = doc(db, 'blogs', String(post.id));
      await setDoc(docRef, completePost);

      console.log(`   ✅ Uploaded successfully!`);
      console.log(`   🔗 Related posts: ${relatedPosts.length}`);
      console.log(`   🌐 URL: ${pillarHub.url}/${post.slug}\n`);

      results.success.push({
        id: post.id,
        title: post.title,
        category: post.category,
        pillar: post.pillar,
        slug: post.slug
      });

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.error(`   ❌ FAILED: ${error.message}\n`);
      results.failed.push({
        id: post.id,
        title: post.title,
        error: error.message
      });
    }
  }

  // Final summary
  console.log('================================================================================');
  console.log('📊 UPLOAD SUMMARY\n');
  console.log(`   ✅ Successfully uploaded: ${results.success.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   📝 Total posts: ${allPosts.length}\n`);

  // Group by pillar
  const byPillar = results.success.reduce((acc, post) => {
    acc[post.pillar] = (acc[post.pillar] || []);
    acc[post.pillar].push(post);
    return acc;
  }, {});

  console.log('📈 POSTS BY PILLAR:\n');
  Object.entries(byPillar).forEach(([pillar, posts]) => {
    const pillarInfo = PILLARS[pillar];
    console.log(`   ${pillarInfo.title}: ${posts.length} posts`);
  });
  console.log();

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: allPosts.length,
      success: results.success.length,
      failed: results.failed.length
    },
    byPillar: Object.fromEntries(
      Object.entries(byPillar).map(([pillar, posts]) => [pillar, posts.length])
    ),
    results: results.success,
    failures: results.failed
  };

  const reportPath = path.join(__dirname, 'blog-upload-65-final-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Detailed report: blog-upload-65-final-report.json\n`);

  // List all uploaded posts by pillar
  if (results.success.length > 0) {
    console.log('🎉 SUCCESSFULLY UPLOADED POSTS:\n');

    Object.entries(byPillar).forEach(([pillar, posts]) => {
      const pillarInfo = PILLARS[pillar];
      console.log(`\n${pillarInfo.title.toUpperCase()} PILLAR (${posts.length} posts):\n`);
      posts.forEach((post, idx) => {
        console.log(`   ${idx + 1}. ${post.title}`);
        console.log(`      ${pillarInfo.url}/${post.slug}\n`);
      });
    });
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED UPLOADS:\n');
    results.failed.forEach((post, idx) => {
      console.log(`   ${idx + 1}. ${post.title} (ID: ${post.id})`);
      console.log(`      Error: ${post.error}\n`);
    });
  }

  console.log('================================================================================');
  console.log(`\n🎊 UPLOAD COMPLETE! ${results.success.length}/${allPosts.length} posts now live on Firestore!\n`);
  console.log('✅ SEO STRUCTURE IMPLEMENTED:\n');
  console.log('   - 5 pillar system: Baby Names, Baby Milestones, Baby Gear, Pregnancy, Postpartum');
  console.log('   - Internal linking (related posts within each pillar)');
  console.log('   - Pillar hub references added');
  console.log('   - Breadcrumbs for SEO');
  console.log('   - All posts reachable from blog page\n');
  console.log('🚀 NEXT STEPS:\n');
  console.log('   1. Test blog page: /babyname2/blog');
  console.log('   2. Test pillar hubs: /babyname2/blog/baby-names, /babyname2/blog/baby-gear, etc.');
  console.log('   3. Verify all internal links work');
  console.log('   4. Submit sitemap to Google Search Console\n');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run it!
uploadAll65Blogs().catch(console.error);
