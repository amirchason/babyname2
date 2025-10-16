# 🚀 Hot Deployment Guide

Your GitHub Actions workflow is **already configured for automatic hot deployment**! Every push to the `master` branch automatically triggers a build and deploy to GitHub Pages.

## Quick Deploy Commands

### Option 1: Super Quick Deploy (with auto timestamp)
```bash
npm run ship
```
This will:
- Stage all changes (`git add .`)
- Commit with timestamp message
- Push to master → **triggers automatic deployment**
- Live in ~2-3 minutes!

### Option 2: Deploy with Custom Message
```bash
npm run ship-msg
```
This will:
- Stage all changes
- Open editor for you to write a commit message
- Push to master → **triggers automatic deployment**

### Option 3: Manual Git Commands
```bash
git add .
git commit -m "your message here"
git push origin master
```

### Option 4: Use the Quick Deploy Script
```bash
./quick-deploy.sh
# or with custom message:
./quick-deploy.sh "Add new feature: heart likes"
```

## Deployment Workflow

1. **You push to master** (using any method above)
2. **GitHub Actions automatically**:
   - Checks out your code
   - Installs dependencies
   - Creates `.env` with secrets
   - Builds the React app (`npm run build`)
   - Deploys build folder to `gh-pages` branch
3. **GitHub Pages serves** your site at:
   - https://amirchason.github.io/babyname2

## Monitor Deployment

**Check deployment status:**
- https://github.com/amirchason/babyname2/actions

**View live site:**
- https://amirchason.github.io/babyname2

## Deployment Time

- ⏱️ **Build time**: ~1-2 minutes
- ⏱️ **Deploy time**: ~30 seconds
- ⏱️ **Total**: ~2-3 minutes from push to live

## Current Workflow Configuration

Located in `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - master
      - main
```

This means **every push to master/main = automatic deployment** ✅

## Tips

- **Fast iteration**: Use `npm run ship` for quick deployments
- **Meaningful commits**: Use `npm run ship-msg` when you want to document changes
- **Check status**: Visit GitHub Actions tab to see build progress
- **Rollback**: If deployment fails, previous version stays live

## Environment Variables

The following are automatically injected during deployment from GitHub Secrets:
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_GOOGLE_API_KEY`
- `REACT_APP_GEMINI_API_KEY`
- `REACT_APP_YOUTUBE_API_KEY`
- `REACT_APP_SHOPIFY_ACCESS_TOKEN`
- `REACT_APP_SHOPIFY_STORE_URL`

**Note**: Fallback values are provided in the workflow for development.

---

**Last updated**: 2025-10-15
