# 🤖 Name Enrichment Agent - Deployment Guide

## Overview
This guide explains how to deploy the cloud-based name enrichment agent that runs on GitHub Actions. The agent enriches the top 1000 names from the sitemap with detailed historical, cultural, and modern context.

## Architecture

**Agent Location:** `scripts/enrichment-agent.js`
**Workflow:** `.github/workflows/enrich-names.yml`
**Output:** `public/data/enriched/*.json` + Firestore `enrichedNames` collection
**Resume Capability:** ✅ Uses 'enriched' flag to avoid reprocessing
**Cloud-Only:** ✅ Runs on GitHub Actions - local server can be shut down

## What Gets Enriched

For each of the top 1000 names, the agent generates:

1. **Full Origin** (300-400 words)
   - Etymology and linguistic roots
   - Geographical spread and cultural significance
   - Historical period and evolution

2. **Nicknames** (5-10 variations)
   - Common shortened forms
   - Regional variations

3. **Historical Figures** (up to 3)
   - Name and fame description
   - Wikipedia URL for reference

4. **Modern Celebrities** (up to 5)
   - Last 10 years, Western culture only
   - Top famous figures with IMDB/Wikipedia URLs

5. **Songs** (up to 5)
   - Songs about or with the name in title
   - YouTube Music URLs

## Prerequisites

- ✅ Node.js script created (`scripts/enrichment-agent.js`)
- ✅ GitHub Actions workflow created (`.github/workflows/enrich-names.yml`)
- ✅ Dependencies installed (`@google/generative-ai`, `firebase-admin`)
- ✅ Enriched data directory created (`public/data/enriched/`)
- 🔲 Firebase service account key (see setup below)
- 🔲 GitHub repository secrets configured (see setup below)

## Step 1: Create Firebase Service Account Key

### Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **babynames-app-9fa2a**
3. Click ⚙️ **Settings** → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file (e.g., `babynames-app-9fa2a-firebase-adminsdk.json`)

### Key Format
The downloaded JSON should look like:
```json
{
  "type": "service_account",
  "project_id": "babynames-app-9fa2a",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@babynames-app-9fa2a.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**IMPORTANT:** Keep this file secure! Don't commit it to git.

## Step 2: Configure GitHub Secrets

### Add Secrets to Repository

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/babyname2`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Secret 1: GEMINI_API_KEY

- **Name:** `GEMINI_API_KEY`
- **Value:** Copy from your `.env` file (the value of `REACT_APP_GEMINI_API_KEY`)
- Example: `AIzaSy...` (39 characters)

### Secret 2: FIREBASE_ADMIN_KEY

- **Name:** `FIREBASE_ADMIN_KEY`
- **Value:** Paste the ENTIRE JSON content from the service account key file
- **Format:** Single-line JSON (copy entire file content)

**Pro Tip:** Use this command to get single-line JSON:
```bash
cat babynames-app-9fa2a-firebase-adminsdk.json | jq -c
```

Or just copy-paste the entire multi-line JSON - GitHub handles it correctly.

## Step 3: Commit and Push to GitHub

```bash
# Add all new files
git add .github/workflows/enrich-names.yml
git add scripts/enrichment-agent.js
git add public/data/enriched/.gitkeep
git add NAME_ENRICHMENT_AGENT_SPEC.md
git add ENRICHMENT_AGENT_DEPLOYMENT.md

# Create commit
git commit -m "🤖 Add cloud-based name enrichment agent

- GitHub Actions workflow for daily enrichment runs
- Resume capability with 'enriched' flag
- AI-powered content generation (origins, nicknames, figures, celebrities, songs)
- Firestore integration for cloud storage
- Automatic git commits of enriched data"

# Push to GitHub
git push origin master
```

## Step 4: Trigger First Run (Manual Test)

### Via GitHub UI

1. Go to **Actions** tab in your repository
2. Click **🤖 Name Enrichment Agent** workflow
3. Click **Run workflow** button (right side)
4. (Optional) Set `max_names` parameter to test with fewer names (e.g., 5)
5. Click **Run workflow** (green button)

### Via GitHub CLI (if installed)

```bash
gh workflow run "🤖 Name Enrichment Agent" \
  --ref master \
  -f max_names=5
```

## Step 5: Monitor Progress

### View Workflow Run

1. Go to **Actions** tab
2. Click on the running workflow
3. Click **Enrich Baby Names** job
4. Expand steps to see logs

### Key Log Outputs

The agent logs detailed progress:

```
🚀 Starting name enrichment agent...
📊 Processing up to 1000 names from sitemap
✅ Found 0 already enriched names (resume check)

📝 Processing name 1/1000: Emma
  🔍 Gender: Female
  🧠 Calling AI for enrichment...
  ✅ Generated quality score: 95
  💾 Saved to Firestore: emma
  💾 Saved to file: public/data/enriched/emma.json

📝 Processing name 2/1000: Liam
...
```

### GitHub Summary Report

Each run generates a summary showing:
- Timestamp
- Files created count
- Total names count
- Progress percentage
- Recent enrichments list

View in: **Actions** → **Workflow Run** → **Summary** tab

## Step 6: Verify Results

### Check Firestore

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Firestore Database**
3. Look for `enrichedNames` collection
4. Each document should have:
   - `enriched: true`
   - `origin.fullHistory` (300-400 words)
   - `nicknames` array
   - `historicalFigures` array
   - `modernCelebrities` array
   - `songs` array

### Check Local Files (after sync)

```bash
# List enriched files
ls -lh public/data/enriched/

# View sample enriched data
cat public/data/enriched/emma.json | jq
```

### Test Resume Capability

1. Trigger workflow again (same names)
2. Check logs - should see: "✅ Found X already enriched names (resume check)"
3. Agent should skip already processed names

## Automatic Schedule

The agent runs automatically:
- **Schedule:** Daily at 2 AM UTC
- **Duration:** Up to 6 hours max
- **Rate Limit:** Sleeps 2 seconds between API calls

**Progress Tracking:**
- Run 1: ~100 names enriched
- Run 2: ~200 more names
- Run 10: All 1000 names complete

## Troubleshooting

### Error: "Firebase Admin initialization failed"

**Cause:** Invalid FIREBASE_ADMIN_KEY secret

**Fix:**
1. Verify JSON format in GitHub secret
2. Ensure entire JSON is copied (including `{}`)
3. Check for extra whitespace or quotes

### Error: "Gemini API rate limit exceeded"

**Cause:** Free tier API quota reached

**Fix:**
1. Wait 60 seconds (exponential backoff handles this)
2. Upgrade to paid Gemini API tier
3. Reduce processing speed in script

### Error: "Failed to read sitemap-names.xml"

**Cause:** Sitemap file not accessible

**Fix:**
1. Verify `public/sitemap-names.xml` exists in repo
2. Check file is committed to git
3. Ensure GitHub Actions can access `public/` directory

### No Enriched Data Appearing

**Checks:**
1. Verify workflow completed successfully (green checkmark)
2. Check Firestore for `enrichedNames` collection
3. Look for commit from "Enrichment Bot" in git history
4. Review workflow logs for error messages

## Integration with App

### Access Enriched Data

The enriched data is accessible via:

1. **Firestore Query:**
```javascript
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';

async function getEnrichedName(slug) {
  const docRef = doc(db, 'enrichedNames', slug);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists() && docSnap.data().enriched === true) {
    return docSnap.data();
  }
  return null;
}
```

2. **Static JSON Files:**
```javascript
async function getEnrichedNameFromFile(slug) {
  try {
    const response = await fetch(`/data/enriched/${slug}.json`);
    const data = await response.json();

    if (data.enriched === true) {
      return data;
    }
  } catch (error) {
    console.error('Enriched data not found:', error);
  }
  return null;
}
```

### Display in Name Profile

Example component integration:

```tsx
import { useState, useEffect } from 'react';

function EnrichedNameProfile({ nameSlug }) {
  const [enriched, setEnriched] = useState(null);

  useEffect(() => {
    async function loadEnrichedData() {
      const data = await getEnrichedName(nameSlug);
      setEnriched(data);
    }
    loadEnrichedData();
  }, [nameSlug]);

  if (!enriched) {
    return <p>Loading enriched content...</p>;
  }

  return (
    <div className="enriched-profile">
      <section>
        <h3>Full Origin</h3>
        <p>{enriched.origin.fullHistory}</p>
      </section>

      <section>
        <h3>Nicknames</h3>
        <ul>
          {enriched.nicknames.map((nick, i) => (
            <li key={i}>{nick}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Historical Figures</h3>
        {enriched.historicalFigures.map((fig, i) => (
          <div key={i}>
            <p>{fig.name} - {fig.famousFor}</p>
            <a href={fig.url} target="_blank">Learn more</a>
          </div>
        ))}
      </section>

      {/* Modern celebrities and songs sections... */}
    </div>
  );
}
```

## Data Guarantees

### No Breaking Changes

The enrichment agent:
- ✅ **Does NOT modify** existing database collections
- ✅ **Only creates NEW files** in `public/data/enriched/`
- ✅ **Only creates NEW collection** `enrichedNames` in Firestore
- ✅ **Does NOT touch** existing app functionality
- ✅ **Progressive enhancement** - app works with or without enriched data

### Resume Safety

The 'enriched' flag ensures:
- ✅ No duplicate API calls (expensive)
- ✅ No overwriting of existing enriched data
- ✅ Can stop and restart anytime without data loss
- ✅ Each name processed exactly once

## Cost Considerations

### Gemini API Costs (gemini-1.5-flash)

**Estimated costs for 1000 names:**
- Input tokens: ~20,000 per name (prompt + context)
- Output tokens: ~1,500 per name (generated content)
- Total per name: ~21,500 tokens
- **Total for 1000 names:** ~21.5 million tokens

**Pricing (as of 2024):**
- Free tier: 15 requests/minute, 1 million tokens/day
- Paid tier: $0.075 per 1M input tokens, $0.30 per 1M output tokens

**Cost Estimate:**
- Input cost: 20M × $0.075 = $1.50
- Output cost: 1.5M × $0.30 = $0.45
- **Total:** ~$2 for all 1000 names

**Timeline with Free Tier:**
- Rate limit: ~100 names/day
- Duration: ~10 days to complete 1000 names

### Firebase Costs

**Firestore:**
- Document writes: 1000 writes (free tier: 20k/day)
- Document reads: Minimal (only for resume checks)
- Storage: ~5MB for 1000 enriched documents
- **Cost:** FREE (well within free tier)

## Security Best Practices

1. ✅ **Never commit** Firebase service account key to git
2. ✅ **Use GitHub Secrets** for all API keys
3. ✅ **Limit Firestore rules** to authenticated writes only
4. ✅ **Monitor API usage** to prevent unexpected costs
5. ✅ **Review workflow logs** regularly for anomalies

## Next Steps

1. ✅ Complete Steps 1-2 (Firebase key + GitHub secrets)
2. ✅ Commit and push to GitHub (Step 3)
3. ✅ Trigger manual test run with 5 names (Step 4)
4. ✅ Verify results in Firestore and files (Step 6)
5. ✅ Let automatic schedule handle remaining names
6. 🚀 Integrate enriched data into NameProfile component
7. 🚀 Add UI toggle for "Show enriched details"
8. 🚀 Deploy updated app to Vercel

## Support

**Issues?** Check troubleshooting section above or review:
- `NAME_ENRICHMENT_AGENT_SPEC.md` - Technical specification
- `scripts/enrichment-agent.js` - Agent source code
- `.github/workflows/enrich-names.yml` - Workflow configuration

**Success Indicators:**
- ✅ Green checkmark on workflow runs
- ✅ Commits from "Enrichment Bot" appear in git history
- ✅ `enrichedNames` collection populated in Firestore
- ✅ JSON files appearing in `public/data/enriched/`
- ✅ Workflow summary shows progress percentage increasing

---

**Last Updated:** 2025-10-22
**Agent Version:** 1.0
**Status:** Ready for deployment
