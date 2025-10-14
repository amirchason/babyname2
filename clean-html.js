const fs = require('fs');
const path = './blog-posts-seo/post-1-light-sun-star-names.json';
const post = JSON.parse(fs.readFileSync(path, 'utf-8'));

// Remove markdown code blocks
post.content = post.content
  .replace(/^```html\n+/,'')
  .replace(/\n*```$/g, '')
  .trim();

fs.writeFileSync(path, JSON.stringify(post, null, 2));
console.log('✅ Cleaned HTML - removed markdown markers');
