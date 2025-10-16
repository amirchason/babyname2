# 🚀 Vercel Deployment & Custom Domain Setup Guide

**Complete guide for deploying SoulSeed to Vercel with a custom domain**

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Vercel CLI Setup (Termux/Android)](#vercel-cli-setup-termuxandroid)
3. [Initial Vercel Deployment](#initial-vercel-deployment)
4. [Domain Purchase Recommendations](#domain-purchase-recommendations)
5. [Custom Domain Configuration](#custom-domain-configuration)
6. [Environment Variables Setup](#environment-variables-setup)
7. [Testing & Validation](#testing--validation)
8. [Troubleshooting](#troubleshooting)
9. [Migration Checklist](#migration-checklist)

---

## Prerequisites

### Current Project State ✅
- React 19 + TypeScript app
- Firebase integration (auth + Firestore)
- Already configured for Vercel:
  - ✅ `vercel.json` exists with proper rewrites
  - ✅ `basename="/"` set in App.tsx (no subpath)
  - ✅ Environment variables in `.env`
- Git repository with uncommitted changes

### What You Need
- [ ] Vercel account (free tier works great)
- [ ] Credit/debit card for domain purchase ($10-15/year)
- [ ] Access to DNS settings (handled by Vercel)

---

## Vercel CLI Setup (Termux/Android)

### Step 1: Install Vercel CLI

```bash
# Update npm first
npm install -g npm@latest

# Install Vercel CLI globally
npm install -g vercel

# Verify installation
vercel --version
# Should output: Vercel CLI 35.x.x or similar
```

**Note for Termux**: Vercel CLI is Node.js-based, so it works perfectly on Termux (unlike Python-based tools).

### Step 2: Login to Vercel

```bash
# This will open browser for authentication
vercel login

# Alternative: Use email (if browser doesn't work)
vercel login --email your-email@example.com
# Then check your email for verification code
```

**Termux Tip**: If `vercel login` doesn't open browser automatically:
1. Run the command
2. Copy the URL shown in terminal
3. Open it manually in your browser
4. Complete authentication
5. Return to terminal (should auto-detect)

---

## Initial Vercel Deployment

### Step 3: Commit Current Changes First

```bash
cd /data/data/com.termux/files/home/proj/babyname2

# Review what's changed
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "chore: Prepare for Vercel deployment - vercel.json, basename update"

# Push to GitHub (for backup)
git push origin master
```

### Step 4: Deploy to Vercel

```bash
# From project root, run:
vercel

# You'll be asked several questions:
```

**Interactive Setup Questions:**

```
? Set up and deploy "~/proj/babyname2"? [Y/n]
→ Y

? Which scope do you want to deploy to?
→ Select your personal account (or create team)

? Link to existing project? [y/N]
→ N (first deployment)

? What's your project's name?
→ soulseed
   (or custom name like "soulseed-baby-names")

? In which directory is your code located?
→ ./ (press Enter)

? Want to modify these settings? [y/N]
→ y (we need to configure build settings)
```

**Build Configuration:**

```
? Build Command:
→ npm run build

? Output Directory:
→ build

? Development Command:
→ npm start
```

**Deployment Process:**
```bash
# Vercel will now:
# 1. Upload your project files
# 2. Install dependencies
# 3. Run build command
# 4. Deploy to temporary URL
# 5. Show you the live URL

# Expected output:
🔗 Preview: https://soulseed-abc123.vercel.app
✅ Production: https://soulseed.vercel.app
```

**⏱️ First deployment takes ~3-5 minutes** (installing deps + building)

---

## Domain Purchase Recommendations

### Top Registrar Recommendations (2025)

#### 🥇 **Option 1: Vercel Domains** (EASIEST)
- **Price**: $15/year (.com), $20/year (.io)
- **Pros**:
  - Zero-config DNS (auto-connects)
  - Managed through Vercel dashboard
  - SSL included automatically
  - No DNS propagation needed
- **Cons**:
  - Slightly more expensive
  - Limited to Vercel ecosystem
- **How to buy**: Vercel Dashboard → Domains → Register

#### 🥈 **Option 2: Namecheap** (RECOMMENDED)
- **Price**: $8-13/year (.com)
- **Pros**:
  - Cheapest reliable option
  - Free WHOIS privacy
  - Easy DNS management
  - Great support
  - Works perfectly with Vercel
- **Cons**:
  - Requires manual DNS setup (easy)
- **Website**: https://www.namecheap.com

#### 🥉 **Option 3: Cloudflare Registrar** (BEST VALUE)
- **Price**: $9.77/year (.com) - at-cost pricing
- **Pros**:
  - Cheapest (no markup)
  - Free WHOIS privacy
  - Built-in CDN/security
  - Excellent DNS
- **Cons**:
  - Requires existing Cloudflare account
  - Manual DNS configuration needed
- **Website**: https://www.cloudflare.com/products/registrar/

#### ⚠️ **Avoid**: GoDaddy, Network Solutions (expensive, pushy upsells)

### Domain Name Ideas for SoulSeed

**Available TLDs to check (.com is best for credibility):**

```
Premium choices:
- soulseed.com          ⭐ Best choice
- soulseedapp.com       ⭐ Backup if .com taken
- soulseed.app          ⭐ Modern, good for apps

Creative alternatives:
- soulseed.io           (tech-friendly)
- soulseed.baby         (perfect match!)
- getsoulseed.com       (startup style)
- mysoulseed.com        (personal touch)
- soulseednames.com     (descriptive)

Budget options:
- soulseed.co           (cheaper than .com)
- soulseed.xyz          (modern, cheap)
- soulseed.online       (affordable)
```

**Checking Availability:**
```bash
# Quick availability check (free):
# Visit: https://tld-list.com
# Or: https://www.namecheap.com/domains/domain-name-search/

# Check multiple TLDs at once:
soulseed.com
soulseed.app
soulseed.baby
```

### Domain Purchase Process (Namecheap Example)

1. **Go to Namecheap**: https://www.namecheap.com
2. **Search**: "soulseed" (or your chosen name)
3. **Select**: Click "Add to Cart" on your preferred TLD
4. **Checkout**:
   - WHOIS Guard: ✅ FREE (enable for privacy)
   - Auto-renew: ✅ Recommended
   - Email forwarding: Optional
   - Skip hosting/email (you don't need these)
5. **Complete Purchase**: $8-15 total
6. **Verify Email**: Check email for verification link
7. **Done!** Domain is now in your account

---

## Custom Domain Configuration

### Method A: Using Namecheap/External Registrar

#### Step 1: Add Domain in Vercel

```bash
# Option 1: Via CLI
vercel domains add soulseed.com

# Option 2: Via Dashboard
# 1. Go to: https://vercel.com/dashboard
# 2. Select your project (soulseed)
# 3. Settings → Domains
# 4. Enter: soulseed.com
# 5. Click "Add"
```

**Vercel will show you DNS records to add:**

```
Type    Name    Value
────────────────────────────────────────────────
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

#### Step 2: Configure DNS in Namecheap

1. **Login to Namecheap**: https://www.namecheap.com
2. **Go to Domain List**: Click "Manage" next to your domain
3. **Advanced DNS Tab**: Click it
4. **Add Records**:

```
Record Type: A Record
Host: @
Value: 76.76.21.21
TTL: Automatic
[Add Record]

Record Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
TTL: Automatic
[Add Record]
```

5. **Save Changes**: Wait 5-60 minutes for propagation

#### Step 3: Verify Domain in Vercel

```bash
# Check status
vercel domains ls

# Force verification check
vercel domains verify soulseed.com

# Expected output:
# ✅ soulseed.com verified
# ✅ SSL certificate issued
```

### Method B: Using Vercel Domains (Easiest)

If you purchase domain through Vercel:

1. **Dashboard**: https://vercel.com/dashboard
2. **Domains Tab**: Click "Register Domain"
3. **Search**: Enter "soulseed"
4. **Purchase**: Follow checkout (~$15/year)
5. **Auto-Connect**: Vercel automatically connects to your project
6. **Done!**: SSL + DNS configured instantly ✅

**This is the easiest option** - everything just works!

---

## Environment Variables Setup

### Critical Variables to Configure

Vercel needs these environment variables (from your `.env` file):

#### Step 1: Add Variables via CLI

```bash
# From project root:

# Firebase Configuration
vercel env add REACT_APP_FIREBASE_API_KEY production
# Paste: AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70

vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN production
# Paste: babynames-app-9fa2a.firebaseapp.com

vercel env add REACT_APP_FIREBASE_PROJECT_ID production
# Paste: babynames-app-9fa2a

vercel env add REACT_APP_FIREBASE_STORAGE_BUCKET production
# Paste: babynames-app-9fa2a.firebasestorage.app

vercel env add REACT_APP_FIREBASE_MESSAGING_SENDER_ID production
# Paste: 1093132372253

vercel env add REACT_APP_FIREBASE_APP_ID production
# Paste: 1:1093132372253:web:0327c13610942d60f4f9f4

# Google OAuth
vercel env add REACT_APP_GOOGLE_CLIENT_ID production
# Paste: 1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com

vercel env add REACT_APP_GOOGLE_CLIENT_SECRET production
# Paste: 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

# API Keys
vercel env add REACT_APP_GOOGLE_API_KEY production
# Paste: AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA

vercel env add REACT_APP_GEMINI_API_KEY production
# Paste: AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA

vercel env add REACT_APP_YOUTUBE_API_KEY production
# Paste: AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA
```

#### Step 2: Alternative - Add via Dashboard

1. **Go to**: https://vercel.com/dashboard
2. **Select Project**: Click "soulseed"
3. **Settings**: Click settings tab
4. **Environment Variables**: Scroll to section
5. **Add Variables**: Click "Add" for each:

```
Name: REACT_APP_FIREBASE_API_KEY
Value: AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70
Environment: Production ✓ Preview ✓ Development ✓
[Save]

(Repeat for all variables above)
```

**Note**: Select all three environments (Production, Preview, Development) for each variable.

#### Step 3: Batch Import (Fastest Method)

```bash
# Create a temporary file with all variables
cat > vercel-env-vars.txt << 'EOF'
REACT_APP_FIREBASE_API_KEY=AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70
REACT_APP_FIREBASE_AUTH_DOMAIN=babynames-app-9fa2a.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=babynames-app-9fa2a
REACT_APP_FIREBASE_STORAGE_BUCKET=babynames-app-9fa2a.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1093132372253
REACT_APP_FIREBASE_APP_ID=1:1093132372253:web:0327c13610942d60f4f9f4
REACT_APP_GOOGLE_CLIENT_ID=1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=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
REACT_APP_GOOGLE_API_KEY=AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA
REACT_APP_GEMINI_API_KEY=AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA
REACT_APP_YOUTUBE_API_KEY=AIzaSyALzy3qXMyXPtLl7pUuCDo_eE5X89u3dpA
EOF

# Import to Vercel (unfortunately, no CLI batch import)
# Use Dashboard method above or script below:

# Manual script to add each line:
while IFS='=' read -r key value; do
  echo "Adding $key..."
  vercel env add "$key" production <<< "$value"
done < vercel-env-vars.txt

# Clean up
rm vercel-env-vars.txt
```

#### Step 4: Update OAuth Redirect URI

**IMPORTANT**: After getting your custom domain, update Google OAuth:

1. **Go to**: https://console.cloud.google.com/apis/credentials
2. **Select OAuth Client**: Click your client ID
3. **Authorized Redirect URIs**: Add:
   ```
   https://soulseed.com
   https://soulseed.com/auth/callback
   https://www.soulseed.com
   https://www.soulseed.com/auth/callback
   ```
4. **Save**: Click "Save"

**Also update in Vercel**:
```bash
vercel env add REACT_APP_OAUTH_REDIRECT_URI_PROD production
# Enter: https://soulseed.com
```

---

## Testing & Validation

### Pre-Deployment Testing

```bash
# Test build locally first
npm run build

# Verify build output
ls -lh build/
# Should see: index.html, static/ folder, etc.

# Test locally with production build
npx serve -s build -l 3000
# Visit: http://localhost:3000
```

### Post-Deployment Testing Checklist

#### 1. Basic Functionality
- [ ] Homepage loads correctly
- [ ] Name search works
- [ ] Filters function properly
- [ ] Pagination works
- [ ] Name cards display with images

#### 2. Authentication
- [ ] Google login button appears
- [ ] Login flow completes successfully
- [ ] User profile displays after login
- [ ] Logout works

#### 3. Firebase Integration
- [ ] Favorites save to cloud
- [ ] Cloud sync works (login on different device)
- [ ] Firestore data persists
- [ ] Offline mode works

#### 4. Swipe Mode
- [ ] Swipe interface loads
- [ ] Card animations work smoothly
- [ ] Like/dislike saves correctly
- [ ] Questionnaire appears for new users

#### 5. Voting System
- [ ] Can create new votes
- [ ] Can share vote links
- [ ] Voting interface works
- [ ] Results display correctly

#### 6. Performance
- [ ] Page loads in < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile-responsive design works
- [ ] No console errors

### Testing Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs soulseed.vercel.app

# Test specific URLs
curl -I https://soulseed.vercel.app
curl -I https://soulseed.vercel.app/favorites
curl -I https://soulseed.vercel.app/swipe

# Check DNS propagation (after domain setup)
dig soulseed.com
dig www.soulseed.com

# Test SSL certificate
curl -vI https://soulseed.com 2>&1 | grep "SSL connection"
```

### Performance Testing

```bash
# Run Lighthouse audit
# Install lighthouse-cli:
npm install -g lighthouse

# Audit production site:
lighthouse https://soulseed.com --view

# Or use online tool:
# https://pagespeed.web.dev/
# Enter: https://soulseed.com
```

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: Build Fails on Vercel

**Symptoms**: Deployment fails during build step

**Solutions**:
```bash
# Check Vercel logs
vercel logs

# Common causes:
# 1. Missing environment variables
vercel env ls  # Check if all vars are set

# 2. Out of memory
# Add to package.json scripts:
"build": "NODE_OPTIONS='--max-old-space-size=4096' react-scripts build"

# 3. TypeScript errors
# Fix locally first:
npm run build
# Fix all errors shown
```

#### Issue 2: 404 Errors on Refresh

**Symptoms**: Direct URLs return 404 (e.g., `/favorites` works from nav but not direct link)

**Solution**: Verify `vercel.json` has correct rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Issue 3: Environment Variables Not Working

**Symptoms**: Features fail that worked locally (OAuth, Firebase, etc.)

**Solutions**:
```bash
# 1. Verify variables are set
vercel env ls

# 2. Check variable names (must start with REACT_APP_)
vercel env add REACT_APP_MY_VAR production

# 3. Redeploy after adding variables
vercel --prod

# 4. Check build logs for warnings
vercel logs --follow
```

#### Issue 4: Domain Not Connecting

**Symptoms**: Domain shows "Domain not found" or SSL errors

**Solutions**:
```bash
# 1. Verify DNS records
dig soulseed.com
# Should show Vercel IP: 76.76.21.21

# 2. Check Vercel domain status
vercel domains ls
# Should show: ✅ soulseed.com

# 3. Force verification
vercel domains verify soulseed.com

# 4. Wait for propagation (up to 48 hours, usually < 1 hour)
# Check propagation:
# https://www.whatsmydns.net/#A/soulseed.com

# 5. Clear DNS cache
# Flush local DNS:
sudo systemd-resolve --flush-caches  # Linux
# Or wait 5 minutes
```

#### Issue 5: Firebase Connection Fails

**Symptoms**: "Firebase: Error (auth/invalid-api-key)" or similar

**Solutions**:
```bash
# 1. Verify Firebase config in Vercel
vercel env ls | grep FIREBASE

# 2. Check Firebase console
# https://console.firebase.google.com/
# Project Settings → Check API key matches

# 3. Verify domain is authorized in Firebase
# Firebase Console → Authentication → Settings → Authorized domains
# Add: soulseed.com, www.soulseed.com

# 4. Update Firestore rules if needed
# Firestore → Rules → Ensure your domain is allowed
```

#### Issue 6: OAuth Login Fails

**Symptoms**: Google login button doesn't work or shows error

**Solutions**:
```bash
# 1. Update OAuth redirect URIs
# Google Cloud Console → Credentials → OAuth 2.0 Client
# Add:
# - https://soulseed.com
# - https://www.soulseed.com

# 2. Update environment variable
vercel env add REACT_APP_OAUTH_REDIRECT_URI_PROD production
# Value: https://soulseed.com

# 3. Verify client ID is correct
vercel env ls | grep CLIENT_ID

# 4. Test OAuth consent screen
# Google Cloud Console → OAuth consent screen
# Ensure status is "In production" or test users added
```

#### Issue 7: Slow Performance

**Symptoms**: Page takes > 5 seconds to load

**Solutions**:
```bash
# 1. Enable Vercel Analytics
vercel analytics enable

# 2. Check bundle size
npm run build
# Look for large chunks

# 3. Optimize images (if applicable)
# Compress images: https://tinypng.com/

# 4. Review Lighthouse suggestions
lighthouse https://soulseed.com --view

# 5. Enable Vercel Edge Caching
# Add to vercel.json:
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Getting Help

**Vercel Support**:
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Twitter: [@vercel](https://twitter.com/vercel)

**Firebase Support**:
- Documentation: https://firebase.google.com/docs
- Community: https://stackoverflow.com/questions/tagged/firebase

**Project-Specific**:
- Check `SESSION_LOG.md` for recent changes
- Review `CLAUDE.md` for architecture details
- See `troubleshooting/` folder (if exists)

---

## Migration Checklist

### Before Migration
- [ ] Backup project: `tar -czf backup-$(date +%Y%m%d).tar.gz .`
- [ ] Test build locally: `npm run build`
- [ ] Verify all features work in dev: `npm start`
- [ ] Document current GitHub Pages URL for rollback

### During Migration
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Initial deployment: `vercel`
- [ ] Add environment variables (see above)
- [ ] Test deployment URL: `https://soulseed.vercel.app`
- [ ] Fix any build errors

### Domain Setup
- [ ] Purchase domain (Namecheap/Vercel/Cloudflare)
- [ ] Add domain in Vercel: `vercel domains add soulseed.com`
- [ ] Configure DNS records (A + CNAME)
- [ ] Wait for verification (5-60 minutes)
- [ ] Verify SSL: `curl -I https://soulseed.com`

### OAuth Update
- [ ] Update Google OAuth redirect URIs
- [ ] Update Firebase authorized domains
- [ ] Test login on new domain

### Post-Migration
- [ ] Test all features on new domain
- [ ] Run Lighthouse audit
- [ ] Monitor Vercel analytics
- [ ] Update README.md with new URL
- [ ] Update social media/marketing materials
- [ ] Set up redirects from old URL (optional)

### Cleanup (Optional)
- [ ] Keep GitHub Pages as backup OR
- [ ] Disable GitHub Pages deployment
- [ ] Update `.env` with new production URL
- [ ] Update `package.json` homepage field

---

## Quick Reference Commands

### Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Open dashboard
vercel dashboard
```

### Domains
```bash
# List domains
vercel domains ls

# Add domain
vercel domains add soulseed.com

# Verify domain
vercel domains verify soulseed.com

# Remove domain
vercel domains rm soulseed.com
```

### Environment Variables
```bash
# List all env vars
vercel env ls

# Add new variable
vercel env add REACT_APP_MY_VAR production

# Remove variable
vercel env rm REACT_APP_MY_VAR production

# Pull env vars to local .env
vercel env pull
```

### Project
```bash
# Link to existing project
vercel link

# Unlink project
vercel unlink

# Get project info
vercel project ls

# Remove project
vercel project rm soulseed
```

---

## Cost Summary

### Free Tier (Vercel)
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ 100GB bandwidth/month
- ✅ Serverless functions
- ✅ Preview deployments
- ✅ Analytics (basic)

**Costs**:
- Domain: $8-20/year (one-time annual)
- Vercel: $0/month (free tier sufficient)
- **Total**: ~$10-20/year

### Pro Tier (Optional)
- $20/month
- 1TB bandwidth
- Advanced analytics
- Team collaboration
- Password protection

**For SoulSeed**: Free tier is more than enough!

---

## Next Steps After Deployment

1. **Set up monitoring**:
   ```bash
   vercel analytics enable
   ```

2. **Add custom error page** (optional):
   - Create `public/404.html`
   - Update `vercel.json` with error handling

3. **Set up GitHub integration**:
   - Vercel will auto-deploy on git push
   - Preview deployments for PRs

4. **Configure preview deployments**:
   ```bash
   # Every git push creates preview URL
   # Great for testing before production
   ```

5. **Add status page** (optional):
   - https://www.statuspage.io/ (free tier)
   - Monitor uptime and alert users

---

## Support & Resources

**Official Documentation**:
- Vercel Docs: https://vercel.com/docs
- React + Vercel: https://vercel.com/docs/frameworks/react
- Custom Domains: https://vercel.com/docs/concepts/projects/domains

**Video Tutorials**:
- "Deploy React to Vercel": https://www.youtube.com/results?search_query=deploy+react+to+vercel
- "Custom Domain Setup": https://www.youtube.com/results?search_query=vercel+custom+domain

**Community**:
- Vercel Discord: https://vercel.com/discord
- GitHub Discussions: https://github.com/vercel/vercel/discussions

---

**Last Updated**: 2025-10-15
**Project**: SoulSeed Baby Names App
**Current Status**: Ready for Vercel deployment ✅
