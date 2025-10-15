/**
 * Fix self-referencing links by converting them to Amazon search links
 */

const https = require('https');

// Fetch a specific blog
async function fetchBlog(slug) {
  return new Promise((resolve, reject) => {
    const url = `https://firestore.googleapis.com/v1/projects/babynames-app-9fa2a/databases/(default)/documents/blogs`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const blog = (parsed.documents || []).find(d => d.fields.slug?.stringValue === slug);
          if (blog) {
            resolve({
              id: blog.name.split('/').pop(),
              title: blog.fields.title?.stringValue || '',
              slug: blog.fields.slug?.stringValue || '',
              content: blog.fields.content?.stringValue || ''
            });
          } else {
            reject(new Error('Blog not found'));
          }
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// Create Amazon search link
function createAmazonSearchLink(productName) {
  const searchTerm = encodeURIComponent(productName.trim());
  return `https://www.amazon.com/s?k=${searchTerm}`;
}

// Fix the postpartum-recovery-essentials blog
async function fixBlog() {
  console.log('🔧 Fixing postpartum-recovery-essentials blog...\n');

  const blog = await fetchBlog('postpartum-recovery-essentials');
  console.log(`✅ Fetched: "${blog.title}"\n`);

  let updatedContent = blog.content;

  // Define the fixes (product name -> Amazon search link)
  const fixes = [
    {
      product: 'Hospital Recovery Kit',
      search: 'postpartum recovery kit hospital essentials'
    },
    {
      product: 'Cooling Pads',
      search: 'postpartum cooling pads perineal'
    },
    {
      product: 'Nipple Cream',
      search: 'nipple cream breastfeeding lanolin'
    },
    {
      product: 'High-Waisted Leggings',
      search: 'postpartum high waisted leggings compression'
    },
    {
      product: 'Meal Delivery Services',
      search: 'meal delivery service subscription'
    },
    {
      product: 'Online Counseling Services',
      search: 'online therapy counseling postpartum'
    }
  ];

  console.log('Applying fixes:\n');

  fixes.forEach((fix, i) => {
    const amazonLink = createAmazonSearchLink(fix.search);
    const oldPattern = `<strong>${fix.product}</strong>: <a href="#">Link to Amazon</a>`;
    const oldPattern2 = `<strong>${fix.product}</strong>: <a href="#">Link to Service</a>`;

    const newPattern = `<strong>${fix.product}</strong>: <a href="${amazonLink}" target="_blank" rel="noopener noreferrer" class="text-purple-600 hover:text-purple-700 underline">Shop on Amazon →</a>`;

    if (updatedContent.includes(oldPattern)) {
      updatedContent = updatedContent.replace(oldPattern, newPattern);
      console.log(`  ${i + 1}. ✅ Fixed: ${fix.product}`);
      console.log(`     → ${amazonLink}\n`);
    } else if (updatedContent.includes(oldPattern2)) {
      updatedContent = updatedContent.replace(oldPattern2, newPattern);
      console.log(`  ${i + 1}. ✅ Fixed: ${fix.product}`);
      console.log(`     → ${amazonLink}\n`);
    } else {
      console.log(`  ${i + 1}. ⚠️  Could not find pattern for: ${fix.product}\n`);
    }
  });

  // Save the fixed content to a file for manual update
  const fs = require('fs');
  fs.writeFileSync('fixed-blog-content.html', updatedContent);
  console.log('📄 Fixed content saved to: fixed-blog-content.html');
  console.log('\n✅ All links fixed! You can now update Firestore with this content.\n');

  return { blog, updatedContent };
}

fixBlog()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
