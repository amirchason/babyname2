# 🚀 Google OAuth Quick Start Guide

## ⚡ One-Command Setup

```bash
node setup-google-auth.js
```

This automated script will:
- ✅ Check your environment variables
- ✅ Generate Vercel sync commands
- ✅ Create helper scripts
- ✅ Provide step-by-step instructions
- ✅ Open correct console URLs

---

## 📋 3 Manual Steps Required

After running the setup script, complete these 3 steps:

### 1️⃣ Google Cloud Console (2 minutes)

**URL:** https://console.cloud.google.com/apis/credentials

**What to do:**
1. Find your OAuth 2.0 Client ID
2. Click "Edit"
3. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://soulseedbaby.com
   https://www.soulseedbaby.com
   https://babyname2-votingsystem.vercel.app
   ```
4. Add **Authorized redirect URIs** (same list as above)
5. Click "Save"

### 2️⃣ Firebase Console (1 minute)

**URL:** https://console.firebase.google.com/project/babynames-app-9fa2a/authentication/providers

**What to do:**
1. Click on "Google" provider
2. Toggle "Enable"
3. Add your support email
4. Click "Save"

### 3️⃣ Sync to Vercel (1 minute)

**Option A - Automated (Recommended):**
```bash
bash sync-vercel-env.sh
```

**Option B - Manual:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Copy variables from `.env` file

---

## ✅ Testing Your Setup

### Local Testing:
```bash
npm start
# Open http://localhost:3000
# Click "Sign in with Google"
# Verify login works
```

### Production Testing:
```bash
npm run deploy
# Open https://soulseedbaby.com
# Test Google login
# Test favorites sync
```

---

## 🔧 Helper Scripts Created

| Script | Purpose |
|--------|---------|
| `setup-google-auth.js` | Main setup wizard |
| `sync-vercel-env.sh` | Auto-sync env vars to Vercel |
| `verify-google-auth.js` | Test OAuth configuration |

---

## 🚨 Common Issues

### "Redirect URI mismatch"
- Make sure ALL domains are added to both JavaScript origins AND redirect URIs
- Include `http://localhost:3000` for local development

### "This app isn't verified"
- Normal for apps in testing mode
- Click "Advanced" → "Go to SoulSeed (unsafe)"
- To remove: Submit for Google verification (takes 4-6 weeks)

### "Client ID not found"
- Verify `.env` has `REACT_APP_GOOGLE_CLIENT_ID`
- Restart dev server after changing `.env`
- Check Vercel environment variables match

### Login works locally but not on Vercel
- Run `bash sync-vercel-env.sh` to sync env vars
- Check Vercel dashboard → Settings → Environment Variables
- Redeploy after adding env vars

---

## 📚 Additional Resources

- **Full Setup Guide:** `GOOGLE_AUTH_SETUP.md`
- **Project Instructions:** `CLAUDE.md`
- **Environment Variables:** `.env`
- **Auth Implementation:** `src/contexts/AuthContext.tsx`

---

## 🎯 Quick Commands Reference

```bash
# Run setup wizard
node setup-google-auth.js

# Verify configuration
node verify-google-auth.js

# Sync to Vercel
bash sync-vercel-env.sh

# Test locally
npm start

# Deploy to production
npm run deploy
```

---

**⏱️ Total setup time: ~5 minutes**

**Questions?** Check `GOOGLE_AUTH_SETUP.md` for detailed troubleshooting.
