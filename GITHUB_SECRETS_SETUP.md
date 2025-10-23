# 🔐 GitHub Secrets Setup - Quick Reference

## Required Secrets for Enrichment Agent

The enrichment agent requires **2 secrets** to run on GitHub Actions:

1. **GEMINI_API_KEY** - Google Gemini AI API key
2. **FIREBASE_ADMIN_KEY** - Firebase service account credentials (JSON)

---

## Step 1: Navigate to Secrets Settings

1. Go to: `https://github.com/YOUR_USERNAME/babyname2/settings/secrets/actions`
2. Or manually: **Repository** → **Settings** → **Secrets and variables** → **Actions**

---

## Step 2: Add GEMINI_API_KEY

### From .env File

Your `.env` file contains: `REACT_APP_GEMINI_API_KEY=AIza...`

### Add to GitHub

1. Click **"New repository secret"**
2. **Name:** `GEMINI_API_KEY`
3. **Value:** Copy the API key from `.env` (the part after `=`)
   ```
   AIzaSy... (39 characters)
   ```
4. Click **"Add secret"**

✅ **Success indicator:** Secret shows as `GEMINI_API_KEY` with green checkmark

---

## Step 3: Create Firebase Service Account Key

### Via Firebase Console

1. Go to: [Firebase Console](https://console.firebase.google.com/)
2. Select project: **babynames-app-9fa2a**
3. Click ⚙️ **Settings** → **Project Settings**
4. Click **Service Accounts** tab
5. Click **"Generate new private key"** button
6. Confirm by clicking **"Generate key"**
7. A JSON file will download (e.g., `babynames-app-9fa2a-firebase-adminsdk-xxxxx.json`)

**⚠️ SECURITY WARNING:** This file grants admin access to your Firebase project. Never commit it to git!

### JSON File Format

The downloaded file should look like:

```json
{
  "type": "service_account",
  "project_id": "babynames-app-9fa2a",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@babynames-app-9fa2a.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40babynames-app-9fa2a.iam.gserviceaccount.com"
}
```

---

## Step 4: Add FIREBASE_ADMIN_KEY

### Prepare the JSON

**Option A: Copy entire file content**
```bash
cat babynames-app-9fa2a-firebase-adminsdk-xxxxx.json
```

**Option B: Convert to single-line JSON (optional)**
```bash
cat babynames-app-9fa2a-firebase-adminsdk-xxxxx.json | jq -c
```

Both work! GitHub handles multi-line JSON correctly.

### Add to GitHub

1. Click **"New repository secret"** again
2. **Name:** `FIREBASE_ADMIN_KEY`
3. **Value:** Paste the ENTIRE JSON content (multi-line is OK)
4. Click **"Add secret"**

✅ **Success indicator:** Secret shows as `FIREBASE_ADMIN_KEY` with green checkmark

---

## Verification Checklist

After adding both secrets, you should see:

- ✅ **GEMINI_API_KEY** - Updated X minutes ago
- ✅ **FIREBASE_ADMIN_KEY** - Updated X minutes ago

**Total secrets:** 2

---

## Test the Setup

### Option 1: Manual Workflow Trigger

1. Go to **Actions** tab in repository
2. Click **"🤖 Name Enrichment Agent"** workflow
3. Click **"Run workflow"** button (right side)
4. Set `max_names` to **5** (test with small batch)
5. Click **"Run workflow"** (green button)
6. Monitor the run in **Actions** tab

### Option 2: Wait for Scheduled Run

The agent runs automatically daily at **2 AM UTC**.

---

## Troubleshooting

### Secret Not Working?

1. **Verify secret name exactly matches:**
   - `GEMINI_API_KEY` (not `GEMINI_API_KEY ` with space)
   - `FIREBASE_ADMIN_KEY` (not `FIREBASE_ADMIN`)

2. **Check for extra characters:**
   - No quotes around the value
   - No trailing newlines
   - Complete JSON for Firebase key

3. **Re-create the secret:**
   - Delete old secret
   - Create new one with exact values

### Workflow Fails with "Firebase Admin initialization failed"

**Cause:** Invalid JSON in FIREBASE_ADMIN_KEY

**Fix:**
1. Download fresh service account key from Firebase Console
2. Copy entire file content (including `{}`)
3. Replace FIREBASE_ADMIN_KEY secret with new JSON

### Workflow Fails with "API key not valid"

**Cause:** GEMINI_API_KEY is incorrect or expired

**Fix:**
1. Verify API key in [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate new API key if needed
3. Update GEMINI_API_KEY secret with new value

---

## Security Best Practices

1. ✅ **Never commit secrets to git**
   - Secrets belong in GitHub Secrets only
   - `.env` is in `.gitignore` (already configured)
   - Service account JSON should never be committed

2. ✅ **Rotate keys periodically**
   - Generate new Firebase service account key every 6-12 months
   - Update GitHub secret when rotated

3. ✅ **Limit permissions**
   - Firebase service account has minimum required permissions
   - API keys are scoped to specific services only

4. ✅ **Monitor usage**
   - Check Firebase Console for unexpected API calls
   - Review GitHub Actions workflow runs regularly

---

## Quick Command Reference

```bash
# View Firebase service account key (DO NOT share output!)
cat babynames-app-9fa2a-firebase-adminsdk-xxxxx.json

# Single-line JSON (optional)
cat babynames-app-9fa2a-firebase-adminsdk-xxxxx.json | jq -c

# Verify Gemini API key from .env
grep GEMINI_API_KEY .env

# Check GitHub secrets (via CLI - requires gh CLI)
gh secret list

# Manually trigger workflow (requires gh CLI)
gh workflow run "🤖 Name Enrichment Agent" -f max_names=5
```

---

## Next Steps After Setup

1. ✅ Verify both secrets added to GitHub
2. ✅ Trigger manual test run with 5 names
3. ✅ Monitor workflow in Actions tab
4. ✅ Check Firestore for `enrichedNames` collection
5. ✅ Verify JSON files in `public/data/enriched/`
6. ✅ Let automatic schedule handle remaining 995 names

---

**Last Updated:** 2025-10-22
**Status:** Ready for secret configuration

See **ENRICHMENT_AGENT_DEPLOYMENT.md** for complete deployment guide.
