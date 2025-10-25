/**
 * Simple Sitemap Generator for SoulSeed Baby Names App
 * Creates sitemap with static pages + blog pillar pages
 *
 * Run: node generate-sitemap-simple.js
 */

const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://soulseedbaby.com';
const OUTPUT_PATH = path.join(__dirname, 'public', 'sitemap.xml');
const today = new Date().toISOString().split('T')[0];

// All pages to include in sitemap
const pages = [
  // Core app pages
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/swipe', changefreq: 'weekly', priority: '0.9' },
  { url: '/votes', changefreq: 'daily', priority: '0.8' },
  { url: '/create-vote', changefreq: 'weekly', priority: '0.7' },
  { url: '/favorites', changefreq: 'daily', priority: '0.7' },
  { url: '/about', changefreq: 'monthly', priority: '0.6' },
  { url: '/contact', changefreq: 'monthly', priority: '0.5' },

  // Blog hub
  { url: '/blog', changefreq: 'weekly', priority: '0.9' },

  // Blog pillar pages (high SEO value)
  { url: '/blog?pillar=baby-names', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog?pillar=baby-milestones', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog?pillar=baby-gear', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog?pillar=pregnancy', changefreq: 'weekly', priority: '0.8' },
  { url: '/blog?pillar=postpartum', changefreq: 'weekly', priority: '0.8' },

  // Pillar 1: Baby Names (10 posts - EXISTING)
  { url: '/blog/baby-names-that-mean-miracle', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/hottest-baby-names-2025', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/90s-baby-names-comeback', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/bird-names-for-babies', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/luxury-baby-names', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/names-ending-in-lynn', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/landscape-baby-names', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/gender-neutral-baby-names', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/names-from-different-cultures', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-names-for-twins', changefreq: 'weekly', priority: '0.7' },

  // Pillar 2: Baby Milestones (20 posts - EXISTING)
  { url: '/blog/first-year-milestones', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-sleep-schedule-by-age', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/when-do-babies-start-talking', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-first-words', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/when-do-babies-walk', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/teething-timeline', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-growth-spurts', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/tummy-time-guide', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-smiling-milestones', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/crawling-age-guide', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-sitting-up', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-hand-eye-coordination', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-vision-development', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-hearing-milestones', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/social-emotional-milestones', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-stranger-anxiety', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/separation-anxiety-babies', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-object-permanence', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-motor-skills-development', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-milestone-tracking-app', changefreq: 'weekly', priority: '0.7' },

  // Pillar 3: Baby Gear & Products (12 posts - TO CREATE)
  { url: '/blog/best-strollers-2025', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/best-car-seats-safety-ratings', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/best-baby-monitors', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/nursery-essentials-checklist', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/best-diaper-bags-parents', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-carriers-wraps-guide', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/best-bottles-breastfed-babies', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/crib-vs-bassinet', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-registry-must-haves', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/best-high-chairs-2025', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-proofing-checklist', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/sustainable-baby-products', changefreq: 'weekly', priority: '0.7' },

  // Pillar 4: Pregnancy & Expecting (12 posts - TO CREATE)
  { url: '/blog/pregnancy-week-by-week', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/first-trimester-survival-guide', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/gender-reveal-ideas', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/pregnancy-announcement-ideas', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/hospital-bag-checklist', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/birth-plan-template', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/pregnancy-symptoms-by-trimester', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-shower-planning-guide', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/maternity-leave-planning', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/pregnancy-nutrition-guide', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/pregnancy-workout-safe-exercises', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/prenatal-vitamins-guide', changefreq: 'weekly', priority: '0.7' },

  // Pillar 5: New Mom Life & Postpartum (11 posts - TO CREATE)
  { url: '/blog/postpartum-recovery-timeline', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/breastfeeding-guide-new-moms', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/postpartum-depression-signs', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/newborn-sleep-schedule', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/pumping-schedule-working-moms', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/postpartum-essentials-checklist', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/baby-sleep-training-methods', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/mom-self-care-postpartum', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/going-back-to-work-after-baby', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/second-baby-vs-first', changefreq: 'weekly', priority: '0.7' },
  { url: '/blog/new-mom-support-groups', changefreq: 'weekly', priority: '0.7' },
];

// Generate XML sitemap
function generateSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

  pages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';
  return xml;
}

// Write sitemap to file
console.log('🚀 Generating sitemap...\n');

const sitemap = generateSitemap();
fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');

console.log('✅ Sitemap generated successfully!');
console.log(`📁 Location: ${OUTPUT_PATH}`);
console.log(`📊 Total URLs: ${pages.length}`);
console.log(`🌐 Domain: ${DOMAIN}`);
console.log('\n📋 Breakdown:');
console.log(`  - Core app pages: 7`);
console.log(`  - Blog hub + pillars: 6`);
console.log(`  - Baby Names posts: 10`);
console.log(`  - Baby Milestones posts: 20`);
console.log(`  - Baby Gear posts: 12`);
console.log(`  - Pregnancy posts: 12`);
console.log(`  - Postpartum posts: 11`);
console.log('\n🔍 Next steps:');
console.log('  1. Deploy to Vercel: npm run deploy');
console.log('  2. Submit to Google Search Console');
console.log('  3. Request indexing for top 20 pages');
console.log('\n🎯 Previous sitemap had only 7 URLs');
console.log(`🚀 NEW sitemap has ${pages.length} URLs (+${pages.length - 7} more!)`);
