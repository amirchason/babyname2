# Blog Posts Upload Guide

## Quick Upload Commands

### Upload Individual Posts
```bash
# Post 2 - Vintage Names
node upload-single-blog-post.js blog-posts-seo/post-2-vintage-names.json

# Post 3 - Nature Names
node upload-single-blog-post.js blog-posts-seo/post-3-nature-names.json

# Post 4 - Short Names
node upload-single-blog-post.js blog-posts-seo/post-4-short-names.json

# Post 5 - Royal Names
node upload-single-blog-post.js blog-posts-seo/post-5-royal-names.json

# Post 6 - Mythology Names
node upload-single-blog-post.js blog-posts-seo/post-6-mythology-names.json

# Post 7 - International Names
node upload-single-blog-post.js blog-posts-seo/post-7-international-names.json

# Post 8 - Gender-Neutral Names
node upload-single-blog-post.js blog-posts-seo/post-8-unisex-names.json

# Post 9 - Color & Gemstone Names
node upload-single-blog-post.js blog-posts-seo/post-9-color-gemstone-names.json

# Post 10 - Literary Names
node upload-single-blog-post.js blog-posts-seo/post-10-literary-names.json
```

### Batch Upload All Remaining Posts
```bash
# Upload posts 2-10 in sequence with 2-second delays
for post in post-{2..10}-*.json; do
  echo "Uploading: $post"
  node upload-single-blog-post.js "blog-posts-seo/$post"
  sleep 2
done
```

### Alternative Batch Upload (one-liner)
```bash
# Upload all posts at once
node upload-single-blog-post.js blog-posts-seo/post-2-vintage-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-3-nature-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-4-short-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-5-royal-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-6-mythology-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-7-international-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-8-unisex-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-9-color-gemstone-names.json && \
node upload-single-blog-post.js blog-posts-seo/post-10-literary-names.json
```

## Verification After Upload

### Check Firestore Console
1. Go to Firebase Console → Firestore Database
2. Navigate to `blogPosts` collection
3. Verify 10 documents exist (total, including post-1)
4. Check each document has:
   - `id` field
   - `slug` field
   - `title` field
   - `content` field with formatted HTML
   - `seo` object with schema
   - `stats` object with wordCount

### Test in App
1. Navigate to `/blog` route
2. Verify all 10 posts appear in list
3. Click each post to verify:
   - Content renders correctly
   - Names are interactive with heart buttons
   - SEO meta tags present (view page source)
   - FAQ schema displays

### SEO Verification
```bash
# Check meta tags in production
curl -s https://amirchason.github.io/babyname2/blog/vintage-baby-names-comeback-2025 | grep -i "meta name"
curl -s https://amirchason.github.io/babyname2/blog/vintage-baby-names-comeback-2025 | grep -i "schema.org"
```

## Troubleshooting

### Error: "Document already exists"
```bash
# Delete existing document first (if needed)
# Use Firebase console or:
node -e "const admin = require('firebase-admin'); /* delete logic */"
```

### Error: "Invalid JSON"
```bash
# Validate JSON before upload
node -e "console.log(require('./blog-posts-seo/post-X-name.json'))"
```

### Error: "Firebase not initialized"
```bash
# Check .env has Firebase config
cat .env | grep FIREBASE
```

## Post-Upload Checklist

- [ ] All 10 posts uploaded to Firestore
- [ ] Blog list page shows all posts
- [ ] Individual post pages render correctly
- [ ] Names are clickable with heart buttons
- [ ] Meta tags present on all pages
- [ ] FAQ schema visible in search console
- [ ] Images referenced (create OG images later)
- [ ] Internal links work (to name explorer, swipe mode)
- [ ] Mobile responsive on all posts
- [ ] Load time < 2 seconds

## Next Steps After Upload

1. **Submit to Google Search Console**
   - Add sitemap with blog URLs
   - Request indexing for each post

2. **Social Media Promotion**
   - Share on Pinterest (nature, gemstone posts especially visual)
   - Post to Reddit parenting communities
   - Twitter/X with relevant hashtags

3. **Analytics Setup**
   - Track which posts get most traffic
   - Monitor keyword rankings
   - A/B test meta descriptions

4. **Content Updates**
   - Quarterly: Update celebrity mentions, statistics
   - Annually: Add new names, refresh examples
   - Monitor comments for engagement

5. **Link Building**
   - Guest post on parenting blogs linking to posts
   - Resource pages on baby name sites
   - Forum signatures with blog links

---

**Created:** October 12, 2025
**Ready to deploy:** 9 posts awaiting upload
