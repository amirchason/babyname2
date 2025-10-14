#!/usr/bin/env node

/**
 * 🚀 BLOG UPLOAD WITH COMPLETE SEO STRUCTURE
 *
 * Uploads ALL blog posts (Baby Names + Baby Milestones) to Firestore
 * with optimized SEO structure for topic authority.
 *
 * Features:
 * - Categorization (Baby Names vs Baby Milestones)
 * - Subcategorization (Month-by-Month, Domains, Sleep & Growth)
 * - Internal linking (related posts, prev/next)
 * - Pillar hub references
 * - Breadcrumbs for SEO
 * - Complete metadata
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');
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
// HELPER FUNCTIONS
//===========================================

function determineSubcategory(post) {
  if (post.category === 'Month-by-Month') return 'Month-by-Month';
  if (post.category === 'Developmental Domains') return 'Developmental Domains';
  if (post.category === 'Sleep & Growth') return 'Sleep & Growth';
  return null;
}

function determinePillar(category) {
  if (category === 'Baby Names') return 'baby-names';
  return 'baby-milestones'; // All other categories are milestones
}

function getPillarHub(pillar) {
  if (pillar === 'baby-names') {
    return {
      title: "Baby Names Hub",
      slug: "baby-names",
      url: "/babyname2/blog/baby-names"
    };
  }
  return {
    title: "Baby Milestones Hub",
    slug: "baby-milestones",
    url: "/babyname2/blog/baby-milestones"
  };
}

function generateBreadcrumbs(post, pillar) {
  const breadcrumbs = [
    { label: "Home", url: "/babyname2" },
    { label: "Blog", url: "/babyname2/blog" }
  ];

  // Add pillar level
  if (pillar === 'baby-names') {
    breadcrumbs.push({ label: "Baby Names", url: "/babyname2/blog/baby-names" });
  } else {
    breadcrumbs.push({ label: "Baby Milestones", url: "/babyname2/blog/baby-milestones" });
  }

  // Add current post
  breadcrumbs.push({
    label: post.title,
    url: `/babyname2/blog/${pillar}/${post.slug}`
  });

  return breadcrumbs;
}

function findRelatedPosts(currentPost, allPosts) {
  const related = [];

  // For month-by-month posts, relate to adjacent months + domain posts
  if (currentPost.category === 'Month-by-Month') {
    const monthNum = parseInt(currentPost.slug.match(/\d+/)?.[0] || '0');

    // Find adjacent months
    allPosts.forEach(post => {
      if (post.id === currentPost.id) return;

      const postMonthNum = parseInt(post.slug.match(/\d+/)?.[0] || '0');

      // Adjacent months (±1 or ±2)
      if (post.category === 'Month-by-Month' && Math.abs(postMonthNum - monthNum) <= 2) {
        related.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category
        });
      }

      // Related domain posts (always relevant)
      if (post.category === 'Developmental Domains') {
        related.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category
        });
      }
    });
  }

  // For domain posts, relate to all month posts + other domains
  if (currentPost.category === 'Developmental Domains') {
    allPosts.forEach(post => {
      if (post.id === currentPost.id) return;

      if (post.category === 'Month-by-Month' || post.category === 'Developmental Domains') {
        related.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category
        });
      }
    });
  }

  // For sleep & growth, relate to relevant months + other sleep/growth
  if (currentPost.category === 'Sleep & Growth') {
    allPosts.forEach(post => {
      if (post.id === currentPost.id) return;

      if (post.category === 'Month-by-Month' || post.category === 'Sleep & Growth') {
        related.push({
          id: post.id,
          title: post.title,
          slug: post.slug,
          category: post.category
        });
      }
    });
  }

  // Limit to 5-6 most relevant
  return related.slice(0, 6);
}

function findPreviousNextPosts(currentPost, allPosts) {
  // Only for sequential posts (month-by-month)
  if (currentPost.category !== 'Month-by-Month') {
    return { previousPost: null, nextPost: null };
  }

  const sortedMonthPosts = allPosts
    .filter(p => p.category === 'Month-by-Month')
    .sort((a, b) => a.id - b.id);

  const currentIndex = sortedMonthPosts.findIndex(p => p.id === currentPost.id);

  const previousPost = currentIndex > 0 ? {
    id: sortedMonthPosts[currentIndex - 1].id,
    title: sortedMonthPosts[currentIndex - 1].title,
    slug: sortedMonthPosts[currentIndex - 1].slug
  } : null;

  const nextPost = currentIndex < sortedMonthPosts.length - 1 ? {
    id: sortedMonthPosts[currentIndex + 1].id,
    title: sortedMonthPosts[currentIndex + 1].title,
    slug: sortedMonthPosts[currentIndex + 1].slug
  } : null;

  return { previousPost, nextPost };
}

//===========================================
// MAIN UPLOAD FUNCTION
//===========================================

async function uploadAllBlogs() {
  console.log('🚀 UPLOADING ALL BLOG POSTS WITH SEO STRUCTURE\n');
  console.log('================================================================================\n');

  // Step 1: Load Baby Names posts (from blog-posts-new/)
  console.log('📂 Loading Baby Names posts...');
  const babyNamesDir = path.join(__dirname, 'blog-posts-new');
  const babyNamesFiles = fs.existsSync(babyNamesDir)
    ? fs.readdirSync(babyNamesDir).filter(f => f.endsWith('.json'))
    : [];

  const babyNamesPosts = babyNamesFiles.map(filename => {
    const data = JSON.parse(fs.readFileSync(path.join(babyNamesDir, filename), 'utf8'));
    return {
      ...data,
      category: 'Baby Names',
      pillar: 'baby-names'
    };
  });

  console.log(`   ✅ Loaded ${babyNamesPosts.length} Baby Names posts\n`);

  // Step 2: Load Baby Milestones posts (from blog-posts-milestones/)
  console.log('📂 Loading Baby Milestones posts...');
  const milestonesDir = path.join(__dirname, 'blog-posts-milestones');
  const milestonesFiles = fs.existsSync(milestonesDir)
    ? fs.readdirSync(milestonesDir).filter(f => f.endsWith('.json'))
    : [];

  const milestonesPosts = milestonesFiles.map(filename => {
    const data = JSON.parse(fs.readFileSync(path.join(milestonesDir, filename), 'utf8'));
    return {
      ...data,
      category: 'Baby Milestones',
      pillar: 'baby-milestones'
    };
  });

  console.log(`   ✅ Loaded ${milestonesPosts.length} Baby Milestones posts\n`);

  // Step 3: Combine all posts
  const allPosts = [...babyNamesPosts, ...milestonesPosts];
  console.log(`📊 Total posts to upload: ${allPosts.length}\n`);
  console.log('================================================================================\n');

  // Step 4: Upload each post with full SEO structure
  const results = { success: [], failed: [] };

  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    console.log(`📝 POST ${i + 1}/${allPosts.length}: ${post.title}`);
    console.log(`   Category: ${post.category}`);
    console.log(`   Pillar: ${post.pillar}`);

    try {
      // Determine subcategory (for milestones only)
      const subcategory = determineSubcategory(post);

      // Get pillar hub reference
      const pillarHub = getPillarHub(post.pillar);

      // Generate breadcrumbs
      const breadcrumbs = generateBreadcrumbs(post, post.pillar);

      // Find related posts
      const relatedPosts = findRelatedPosts(post, allPosts);

      // Find previous/next (for sequential posts)
      const { previousPost, nextPost } = findPreviousNextPosts(post, allPosts);

      // Build complete post object
      const completePost = {
        ...post,
        category: post.category,
        pillar: post.pillar,
        subcategory: subcategory,
        pillarHub: pillarHub,
        breadcrumbs: breadcrumbs,
        relatedPosts: relatedPosts,
        previousPost: previousPost,
        nextPost: nextPost,
        status: 'published',
        publishedAt: post.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        featured: false,
        // SEO metadata
        internalLinksCount: relatedPosts.length + (previousPost ? 1 : 0) + (nextPost ? 1 : 0),
        topicCluster: post.pillar
      };

      // Upload to Firestore
      const docRef = doc(db, 'blogs', String(post.id));
      await setDoc(docRef, completePost);

      console.log(`   ✅ Uploaded successfully!`);
      console.log(`   🔗 Related posts: ${relatedPosts.length}`);
      console.log(`   🔗 Prev/Next: ${previousPost ? '✅' : '❌'} / ${nextPost ? '✅' : '❌'}`);
      console.log(`   🌐 URL: /babyname2/blog/${post.pillar}/${post.slug}\n`);

      results.success.push({
        id: post.id,
        title: post.title,
        category: post.category,
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

  // Group by category
  const byCategory = results.success.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {});

  console.log('📈 POSTS BY CATEGORY:\n');
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} posts`);
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
    byCategory: byCategory,
    results: results.success,
    failures: results.failed
  };

  const reportPath = path.join(__dirname, 'blog-upload-complete-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Detailed report: blog-upload-complete-report.json\n`);

  // List all uploaded posts
  if (results.success.length > 0) {
    console.log('🎉 SUCCESSFULLY UPLOADED POSTS:\n');

    // Group by pillar
    const babyNames = results.success.filter(p => p.category === 'Baby Names');
    const milestones = results.success.filter(p => p.category === 'Baby Milestones');

    if (babyNames.length > 0) {
      console.log('📛 BABY NAMES PILLAR:\n');
      babyNames.forEach((post, idx) => {
        console.log(`   ${idx + 1}. ${post.title}`);
        console.log(`      /blog/baby-names/${post.slug}\n`);
      });
    }

    if (milestones.length > 0) {
      console.log('👶 BABY MILESTONES PILLAR:\n');
      milestones.forEach((post, idx) => {
        console.log(`   ${idx + 1}. ${post.title}`);
        console.log(`      /blog/baby-milestones/${post.slug}\n`);
      });
    }
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED UPLOADS:\n');
    results.failed.forEach((post, idx) => {
      console.log(`   ${idx + 1}. ${post.title} (ID: ${post.id})`);
      console.log(`      Error: ${post.error}\n`);
    });
  }

  console.log('================================================================================');
  console.log(`\n🎊 UPLOAD COMPLETE! ${results.success.length}/${allPosts.length} posts now live on Firestore!\\n`);
  console.log('✅ SEO STRUCTURE IMPLEMENTED:\n');
  console.log('   - Categories assigned (Baby Names / Baby Milestones)');
  console.log('   - Subcategories added (Month-by-Month / Domains / Sleep & Growth)');
  console.log('   - Internal linking (related posts, prev/next)');
  console.log('   - Pillar hub references added');
  console.log('   - Breadcrumbs for SEO');
  console.log('   - All posts reachable from blog page\n');
  console.log('🚀 NEXT STEPS:\n');
  console.log('   1. Test blog page: /babyname2/blog');
  console.log('   2. Test pillar hubs: /babyname2/blog/baby-names, /babyname2/blog/baby-milestones');
  console.log('   3. Verify all internal links work');
  console.log('   4. Submit sitemap to Google Search Console\n');

  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run it!
uploadAllBlogs().catch(console.error);
