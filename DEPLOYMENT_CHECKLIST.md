# ✅ Vercel Deployment Checklist

**Step-by-step checklist for deploying SoulSeed to Vercel with custom domain**

---

## Phase 1: Pre-Deployment Prep (5 minutes)

### Local Testing
- [ ] Run `npm run build` successfully
- [ ] Test build locally: `npx serve -s build -l 3000`
- [ ] All features work in dev mode
- [ ] No console errors

### Git Repository
- [ ] All changes committed
- [ ] Pushed to GitHub
- [ ] `.env` file exists (but not committed)
- [ ] `vercel.json` exists

### Project Configuration
- [ ] `basename="/"` in App.tsx (line 51)
- [ ] Environment variables documented
- [ ] Firebase config ready
- [ ] Google OAuth credentials ready

---

## Phase 2: Vercel Setup (10 minutes)

### Install Vercel CLI
```bash
npm install -g vercel
vercel --version  # Verify installation
```
- [ ] Vercel CLI installed
- [ ] Version displayed correctly

### Login to Vercel
```bash
vercel login
```
- [ ] Logged in successfully
- [ ] Can run `vercel whoami` without error

### Initial Deployment
```bash
cd /data/data/com.termux/files/home/proj/babyname2
vercel
```

**Answer prompts**:
- [ ] Set up and deploy? → **Y**
- [ ] Which scope? → **Select your account**
- [ ] Link to existing? → **N**
- [ ] Project name? → **soulseed**
- [ ] Code directory? → **./**
- [ ] Modify settings? → **y**
- [ ] Build command? → **npm run build**
- [ ] Output directory? → **build**
- [ ] Dev command? → **npm start**

**Verify deployment**:
- [ ] Deployment completed successfully
- [ ] Preview URL received (e.g., `soulseed-abc123.vercel.app`)
- [ ] Can access preview URL in browser

---

## Phase 3: Environment Variables (15 minutes)

### Option A: Via CLI (Copy-paste each)
```bash
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

### Option B: Via Dashboard (Easier)
1. [ ] Open `vercel dashboard`
2. [ ] Click project (soulseed)
3. [ ] Settings → Environment Variables
4. [ ] Add each variable (copy from `.env`)
5. [ ] Select all environments (Production, Preview, Development)
6. [ ] Save

### Verify
```bash
vercel env ls
```
- [ ] All 11 variables listed
- [ ] Each shows "Production, Preview, Development"

### Redeploy with Variables
```bash
vercel --prod
```
- [ ] Deployment successful
- [ ] Variables loaded (check logs)

---

## Phase 4: Domain Purchase (10-15 minutes)

### Choose Registrar
- [ ] Decided on registrar:
  - [ ] Namecheap (best value: $8-13/year)
  - [ ] Vercel Domains (easiest: $15/year)
  - [ ] Cloudflare (cheapest: $9.77/year)

### Purchase Domain
**Using Namecheap**:
1. [ ] Go to namecheap.com
2. [ ] Search: "soulseed" (or preferred name)
3. [ ] Select TLD (.com recommended)
4. [ ] Enable WhoisGuard (FREE - IMPORTANT!)
5. [ ] Enable auto-renew
6. [ ] Skip hosting/email offers
7. [ ] Complete purchase ($8-15)
8. [ ] Verify email

**Using Vercel**:
1. [ ] Open Vercel Dashboard
2. [ ] Domains tab → "Register Domain"
3. [ ] Search and purchase
4. [ ] Auto-configured ✅

**Using Cloudflare**:
1. [ ] Create Cloudflare account
2. [ ] Domain Registration section
3. [ ] Search and purchase
4. [ ] Note registrar takes 24-48h to transfer

---

## Phase 5: Domain Configuration (30-60 minutes)

### Add Domain to Vercel
```bash
vercel domains add soulseed.com
```
- [ ] Domain added
- [ ] DNS records displayed

**Note DNS Records**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Configure DNS (Skip if Vercel Domains)

**In Namecheap**:
1. [ ] Login to Namecheap
2. [ ] Domain List → Manage
3. [ ] Advanced DNS tab
4. [ ] Add A Record:
   - Host: `@`
   - Value: `76.76.21.21`
   - TTL: Automatic
5. [ ] Add CNAME Record:
   - Host: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic
6. [ ] Save changes

**In Cloudflare**:
1. [ ] Login to Cloudflare
2. [ ] Select domain
3. [ ] DNS → Records
4. [ ] Add A Record:
   - Name: `@`
   - IPv4: `76.76.21.21`
   - Proxy status: DNS only (gray cloud)
5. [ ] Add CNAME:
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   - Proxy status: DNS only
6. [ ] Save

### Wait for Propagation
- [ ] Waited 5-60 minutes (usually ~15 minutes)

### Verify DNS
```bash
dig soulseed.com
# Should show: 76.76.21.21

dig www.soulseed.com
# Should point to Vercel
```
- [ ] DNS resolves to Vercel IP
- [ ] www subdomain resolves

### Verify Domain in Vercel
```bash
vercel domains verify soulseed.com
```
- [ ] Domain verified ✅
- [ ] SSL certificate issued ✅

### Check Status
```bash
vercel domains ls
```
- [ ] Shows domain as verified
- [ ] SSL status: Active

---

## Phase 6: OAuth & Firebase Updates (10 minutes)

### Update Google OAuth
1. [ ] Go to: https://console.cloud.google.com/apis/credentials
2. [ ] Select OAuth 2.0 Client ID
3. [ ] Add Authorized Redirect URIs:
   ```
   https://soulseed.com
   https://soulseed.com/auth/callback
   https://www.soulseed.com
   https://www.soulseed.com/auth/callback
   ```
4. [ ] Save changes

### Update Firebase
1. [ ] Go to: https://console.firebase.google.com/
2. [ ] Select project: babynames-app-9fa2a
3. [ ] Authentication → Settings → Authorized domains
4. [ ] Add domains:
   ```
   soulseed.com
   www.soulseed.com
   ```
5. [ ] Save

### Update Environment Variable
```bash
vercel env add REACT_APP_OAUTH_REDIRECT_URI_PROD production
# Enter: https://soulseed.com
```
- [ ] Variable added
- [ ] Redeployed: `vercel --prod`

---

## Phase 7: Testing (15 minutes)

### Basic Tests
- [ ] Homepage loads: `https://soulseed.com`
- [ ] www redirects to apex: `https://www.soulseed.com`
- [ ] SSL works (green padlock)
- [ ] No console errors (F12 → Console)

### Feature Tests
- [ ] Search works
- [ ] Filters work
- [ ] Name cards display correctly
- [ ] Pagination works
- [ ] Modal opens

### Authentication Tests
- [ ] Google login button appears
- [ ] Can click login
- [ ] Login flow completes
- [ ] User profile shows
- [ ] Logout works

### Firebase Tests
- [ ] Can favorite names
- [ ] Favorites save to cloud
- [ ] Can see favorites in Firebase Console
- [ ] Sync works between devices/browsers

### Swipe Mode Tests
- [ ] Swipe page loads
- [ ] Cards swipe smoothly
- [ ] Like/dislike saves
- [ ] Questionnaire works (new users)

### Voting System Tests
- [ ] Can create votes
- [ ] Share link works
- [ ] Voting interface works
- [ ] Results display correctly

### Mobile Tests
- [ ] Test on mobile browser
- [ ] Responsive design works
- [ ] Touch gestures work
- [ ] Performance is acceptable

### Performance Tests
```bash
# Run Lighthouse
lighthouse https://soulseed.com --view
```
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 90

---

## Phase 8: Post-Deployment (Optional)

### Enable Analytics
```bash
vercel analytics enable
```
- [ ] Analytics enabled
- [ ] Dashboard accessible

### Set up Monitoring
- [ ] Vercel dashboard monitoring configured
- [ ] Error tracking working

### Update Documentation
- [ ] Update README.md with new URL
- [ ] Update `.env` example
- [ ] Update CLAUDE.md
- [ ] Add to SESSION_LOG.md

### Social Media Updates
- [ ] Update social media profiles with new domain
- [ ] Update marketing materials
- [ ] Announce on social media

### SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (if needed)
- [ ] Configure meta tags

---

## Phase 9: Cleanup (Optional)

### GitHub Pages (Choose One)

**Option A: Keep as Backup**
- [ ] Leave GitHub Pages active
- [ ] Document both URLs
- [ ] Monitor both deployments

**Option B: Disable GitHub Pages**
1. [ ] GitHub repo → Settings
2. [ ] Pages section
3. [ ] Source: None
4. [ ] Save
5. [ ] Update docs to remove old URL

### Update Config
- [ ] Update `.env` production URL
- [ ] Update `package.json` homepage field (optional)
- [ ] Remove GitHub Pages deployment script (optional)

---

## Troubleshooting Quick Reference

### Build Fails
```bash
# Check logs
vercel logs

# Test build locally
npm run build

# Increase memory
# Edit package.json:
"build": "NODE_OPTIONS='--max-old-space-size=4096' react-scripts build"
```

### Domain Not Connecting
```bash
# Check DNS
dig soulseed.com

# Check propagation
# Visit: https://www.whatsmydns.net/#A/soulseed.com

# Force verify
vercel domains verify soulseed.com

# Check status
vercel domains ls
```

### OAuth Fails
```bash
# Verify redirect URIs in Google Console
# Verify domain authorized in Firebase
# Check environment variable
vercel env ls | grep OAUTH
```

### Environment Variables Not Working
```bash
# List variables
vercel env ls

# Redeploy after adding
vercel --prod

# Check logs for errors
vercel logs
```

---

## Success Criteria

**All must be ✅ before going live**:

1. **Deployment**:
   - [ ] App deploys without errors
   - [ ] All pages load correctly
   - [ ] No 404 errors

2. **Custom Domain**:
   - [ ] Domain resolves to Vercel
   - [ ] SSL certificate active
   - [ ] Both apex and www work

3. **Authentication**:
   - [ ] Google login works
   - [ ] User stays logged in
   - [ ] Logout works

4. **Firebase**:
   - [ ] Can save data
   - [ ] Cloud sync works
   - [ ] Data persists

5. **Performance**:
   - [ ] Page load < 3 seconds
   - [ ] Lighthouse > 90 (all metrics)
   - [ ] Mobile-responsive

6. **Features**:
   - [ ] All core features work
   - [ ] No broken functionality
   - [ ] Error handling works

---

## Estimated Timeline

- **Pre-Deployment**: 5 minutes
- **Vercel Setup**: 10 minutes
- **Environment Variables**: 15 minutes
- **Domain Purchase**: 10-15 minutes
- **Domain Configuration**: 30-60 minutes (mostly waiting)
- **OAuth/Firebase Updates**: 10 minutes
- **Testing**: 15 minutes
- **Post-Deployment**: Optional
- **Cleanup**: Optional

**Total Active Time**: ~1 hour
**Total Elapsed Time**: ~2 hours (with DNS propagation wait)

---

## Quick Commands Reference

```bash
# Deploy
vercel                    # Preview deployment
vercel --prod            # Production deployment

# Domains
vercel domains add soulseed.com
vercel domains verify soulseed.com
vercel domains ls

# Environment Variables
vercel env ls
vercel env add VAR_NAME production
vercel env rm VAR_NAME production

# Logs & Status
vercel logs
vercel ls
vercel whoami
vercel dashboard

# Project
vercel link              # Link to existing project
vercel unlink           # Unlink project
```

---

## Support Resources

- **Full Guide**: `VERCEL_DEPLOYMENT_GUIDE.md`
- **Domain Guide**: `DOMAIN_PURCHASE_GUIDE.md`
- **Vercel Docs**: https://vercel.com/docs
- **Support**: https://vercel.com/support

---

**Last Updated**: 2025-10-15
**Status**: Ready to deploy ✅
