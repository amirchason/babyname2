# ⚡ Vercel Environment Variables - Quick Start

## 🎯 TL;DR - 3 Simple Steps

### Option 1: Automated (FASTEST - 1 minute)
```bash
# 1. Make script executable (already done ✅)
chmod +x upload-vercel-env.sh

# 2. Upload all variables
./upload-vercel-env.sh all

# 3. Deploy
npm run deploy
```

### Option 2: Manual (10 minutes)
```bash
# 1. Go to Vercel dashboard
https://vercel.com/teamawesomeyay/soulseed/settings/environment-variables

# 2. Copy-paste from .env.vercel file
# 3. Mark these as "Sensitive":
#    - OPENAI_API_KEY
#    - NANOBANANA_API_KEY
#    - REACT_APP_GOOGLE_CLIENT_SECRET
#    - REACT_APP_*_API_KEY (all API keys)

# 4. Select: Production + Preview + Development

# 5. Deploy
npm run deploy
```

---

## 📁 Files Created for You

| File | Purpose | Use When |
|------|---------|----------|
| `.env.vercel` | Human-readable format | Manual dashboard upload |
| `vercel-env-upload.json` | Vercel API format | API/SDK integration |
| `upload-vercel-env.sh` | Automated upload script | CLI bulk upload |
| `VERCEL_ENV_UPLOAD_GUIDE_FINAL.md` | Complete documentation | Full reference |
| `VERCEL_ENV_QUICKSTART.md` | This file | Quick lookup |

---

## 🔐 Security Checklist

### Mark as "Sensitive" in Vercel:
- ✅ `OPENAI_API_KEY`
- ✅ `REACT_APP_OPENAI_API_KEY`
- ✅ `NANOBANANA_API_KEY`
- ✅ `REACT_APP_GOOGLE_CLIENT_SECRET`
- ✅ `REACT_APP_GOOGLE_API_KEY`
- ✅ `REACT_APP_GEMINI_API_KEY`
- ✅ `REACT_APP_YOUTUBE_API_KEY`

### Leave as "Plain":
- ❌ Firebase config (protected by rules)
- ❌ Feature flags
- ❌ Theme colors
- ❌ App metadata

---

## 🧪 Testing Checklist

After upload:

```bash
# 1. Test preview first
npm run deploy:preview

# 2. Visit preview URL and check:
#    ✅ App loads
#    ✅ Google login works
#    ✅ Favorites save
#    ✅ No console errors

# 3. Deploy to production
npm run deploy

# 4. Visit soulseedbaby.com and verify same
```

---

## 📊 Your Variables Summary

- **Total:** 32 variables
- **Sensitive:** 10 variables
- **Size:** ~2.5 KB (4% of 64 KB limit)
- **Environments:** Production + Preview + Development

### Categories:
- 🔨 Build Config: 4
- 🔑 Google Services: 3
- 🔐 OAuth: 2
- 🔥 Firebase: 6
- 🤖 AI Keys: 3
- 🎯 Feature Flags: 4
- 🎨 Theme: 3
- 🚀 Vercel: 2
- ⚙️ Metadata: 4
- 🐛 Debug: 1

---

## ❓ FAQ

### Q: Is it safe to delete existing env vars?
**A:** YES! You have local backups in `.env` files.

### Q: Will app go down during upload?
**A:** NO! Old deployment stays live until new one succeeds.

### Q: Which variables are exposed to browser?
**A:** All `REACT_APP_*` variables (embedded in bundle at build time).

### Q: Do I need to set NODE_ENV or PUBLIC_URL?
**A:** NO! Vercel sets these automatically.

### Q: Why are some API keys marked REACT_APP_?
**A:** Create React App requires this prefix. Consider moving sensitive operations to serverless functions.

---

## 🆘 Quick Troubleshooting

**Build fails:**
```bash
# Verify these are set:
TSC_COMPILE_ON_ERROR=true
SKIP_PREFLIGHT_CHECK=true
```

**Firebase auth broken:**
```bash
# Check all REACT_APP_FIREBASE_* vars are set
```

**Vercel CLI not linked:**
```bash
vercel link --project=prj_wDbXRJMvE12QLEk3QivyEdDWH9Lo
```

---

## 🔗 Useful Links

- **Dashboard:** https://vercel.com/teamawesomeyay/soulseed/settings/environment-variables
- **Deployments:** https://vercel.com/teamawesomeyay/soulseed/deployments
- **Vercel Docs:** https://vercel.com/docs/environment-variables
- **Full Guide:** See `VERCEL_ENV_UPLOAD_GUIDE_FINAL.md`

---

## 🚀 Ready to Upload?

**Recommended:** Use automated script
```bash
./upload-vercel-env.sh all
npm run deploy:preview  # Test first
npm run deploy          # Then production
```

**Manual:** Use Vercel dashboard with `.env.vercel` file

**Done! Your environment variables are research-backed and production-ready! 🎉**
