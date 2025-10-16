# ⚡ Vercel Quick Reference Card

**One-page command reference for SoulSeed deployment**

---

## 🚀 Three Ways to Deploy

### 1. Automated (Easiest)
```bash
./deploy-to-vercel.sh
```

### 2. Quick Manual
```bash
npm install -g vercel && vercel login && vercel
./add-vercel-env-vars.sh
vercel --prod
```

### 3. Step-by-Step
See `QUICK_START_VERCEL.md`

---

## 📋 Essential Commands

### Installation
```bash
npm install -g vercel              # Install CLI
vercel --version                   # Check version
vercel login                       # Login (opens browser)
vercel whoami                      # Check login status
```

### Deployment
```bash
vercel                             # Deploy preview
vercel --prod                      # Deploy production
vercel ls                          # List deployments
vercel logs                        # View logs
vercel dashboard                   # Open dashboard
```

### Environment Variables
```bash
vercel env ls                      # List variables
vercel env add VAR_NAME production # Add variable
vercel env rm VAR_NAME production  # Remove variable
./add-vercel-env-vars.sh          # Batch import
```

### Domains
```bash
vercel domains add soulseed.com    # Add domain
vercel domains verify soulseed.com # Verify domain
vercel domains ls                  # List domains
vercel domains rm soulseed.com     # Remove domain
```

### Project Management
```bash
vercel link                        # Link to project
vercel unlink                      # Unlink project
vercel project ls                  # List projects
vercel project rm PROJECT_NAME     # Remove project
```

---

## 🌐 DNS Records (Namecheap Example)

### What Vercel Needs
```
Type: A Record
Host: @
Value: 76.76.21.21

Type: CNAME Record
Host: www
Value: cname.vercel-dns.com
```

### Where to Add
1. Login to Namecheap
2. Domain List → Manage
3. Advanced DNS tab
4. Add records above
5. Wait 5-60 minutes

---

## 🔐 Environment Variables (11 Required)

```bash
# Firebase
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID
REACT_APP_GOOGLE_CLIENT_SECRET

# API Keys
REACT_APP_GOOGLE_API_KEY
REACT_APP_GEMINI_API_KEY
REACT_APP_YOUTUBE_API_KEY
```

**Add with**: `./add-vercel-env-vars.sh` or `vercel dashboard`

---

## 🔧 Troubleshooting Quick Fixes

### Build Fails
```bash
npm run build                      # Test locally first
vercel logs                        # Check error logs
```

### 404 Errors
Check `vercel.json` has:
```json
{
  "rewrites": [
    {"source": "/(.*)", "destination": "/index.html"}
  ]
}
```

### Env Vars Not Working
```bash
vercel env ls                      # Verify all set
vercel --prod                      # Redeploy
```

### Domain Not Connecting
```bash
dig soulseed.com                   # Check DNS
vercel domains verify soulseed.com # Force verify
```

### OAuth Fails
1. Update Google Console redirect URIs
2. Add new domain to Firebase authorized domains
3. Redeploy: `vercel --prod`

---

## 💰 Cost Summary

| Item | Cost | Notes |
|------|------|-------|
| Domain (Namecheap) | $8-13/year | Best value |
| Domain (Vercel) | $15/year | Easiest setup |
| Domain (Cloudflare) | $9.77/year | Cheapest |
| Vercel Hosting | $0/month | Free tier |
| SSL Certificate | $0 | Included |
| **Total** | **$8-15/year** | ~$1/month! |

---

## ⏱️ Timeline

**Fastest Path**: 15 minutes
- Deploy: 5 min
- Env vars: 3 min
- Test: 2 min

**With Custom Domain**: 1-2 hours
- Above + Domain purchase: 10 min
- DNS setup + wait: 30-60 min
- OAuth update: 5 min

---

## 📚 Documentation Files

| File | Purpose | Size | Time |
|------|---------|------|------|
| `DEPLOYMENT_INDEX.md` | Navigation | 12K | 5 min |
| `QUICK_START_VERCEL.md` | Fast deploy | 5.4K | 15 min |
| `VERCEL_DEPLOYMENT_GUIDE.md` | Complete guide | 22K | 1-2 hrs |
| `DEPLOYMENT_CHECKLIST.md` | Track progress | 12K | Reference |
| `DOMAIN_PURCHASE_GUIDE.md` | Domain help | 8.2K | 10 min |
| `VERCEL_SETUP_SUMMARY.md` | Overview | 12K | 10 min |

---

## 🎯 Decision Flowchart

```
Need to deploy? → Yes
  ↓
Want automation? → Yes → Run ./deploy-to-vercel.sh
  ↓ No
Want detailed guide? → Yes → Read VERCEL_DEPLOYMENT_GUIDE.md
  ↓ No
Want fastest path? → Yes → Read QUICK_START_VERCEL.md
  ↓
Deploy manually with commands above
```

---

## ✅ Success Checklist

- [ ] App loads at Vercel URL
- [ ] Custom domain connected (if purchased)
- [ ] SSL active (green padlock)
- [ ] All routes work
- [ ] Google login works
- [ ] Firebase sync works
- [ ] Mobile-responsive
- [ ] Performance > 90

---

## 🆘 Get Help

**Quick Issues**: Check troubleshooting section above
**Domain Issues**: See `DOMAIN_PURCHASE_GUIDE.md`
**Detailed Help**: See `VERCEL_DEPLOYMENT_GUIDE.md` Section 10
**Automation**: Run `./deploy-to-vercel.sh`

**Official Support**:
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

---

## 🚀 Ready to Deploy?

**Start here**: `./deploy-to-vercel.sh`

**Or follow**: `QUICK_START_VERCEL.md`

**Or read**: `DEPLOYMENT_INDEX.md` for navigation

---

**Last Updated**: 2025-10-15
**Project**: SoulSeed Baby Names App
**Status**: Ready to deploy ✅
