# Cloud Enrichment Setup Guide

This guide explains how to run name enrichment automatically in the cloud using GitHub Actions, so you don't need to keep a terminal open.

## 🎯 Overview

The enrichment system processes ~146k baby names using OpenAI's GPT-4-mini API to add meanings and origins. Running in the cloud via GitHub Actions:

- ✅ **No open terminal needed** - Runs on GitHub's servers
- ✅ **Automatic resumption** - Continues from checkpoint every 6 hours
- ✅ **Progress tracking** - All updates committed to repo
- ✅ **Cost efficient** - Free GitHub Actions, ~$5-6 OpenAI API cost
- ✅ **Safe** - Auto-saves progress, handles errors gracefully

## 📋 Setup Instructions

### Step 1: Add OpenAI API Key to GitHub Secrets

1. Go to your repository on GitHub:
   ```
   https://github.com/amirchason/babyname2
   ```

2. Navigate to **Settings** → **Secrets and variables** → **Actions**

3. Click **"New repository secret"**

4. Create the secret:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-proj-...`)

5. Click **"Add secret"**

### Step 2: Commit and Push Workflow File

The workflow file has already been created at `.github/workflows/enrichment.yml`. You just need to commit and push it:

```bash
git add .github/workflows/enrichment.yml
git add masterEnrichment.js
git commit -m "feat: Add cloud enrichment via GitHub Actions"
git push
```

### Step 3: Trigger the Enrichment

You have two options to start enrichment:

#### Option A: Manual Trigger (Recommended for first run)

```bash
# Using GitHub CLI
gh workflow run enrichment.yml

# Or via web UI:
# 1. Go to https://github.com/amirchason/babyname2/actions
# 2. Click "Name Enrichment (Cloud)" workflow
# 3. Click "Run workflow" button
# 4. Click green "Run workflow" button
```

#### Option B: Automatic Schedule

The workflow is configured to run automatically every 6 hours. Once you push the workflow file, it will start running on schedule:

- **Schedule**: Every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- **First run**: Within 6 hours of pushing
- **Auto-stops**: When all 146k names are processed

## 📊 Monitoring Progress

### View Workflow Runs

```bash
# List recent runs
gh run list --workflow=enrichment.yml

# View specific run with logs
gh run view <run-id> --log

# Watch live (updates every 3 seconds)
gh run watch
```

### Check Progress in Repo

The workflow commits progress after each run. To see latest status:

```bash
# Pull latest changes
git pull

# Check master state
cat enrichment_logs/master_state.json

# Or use the status script
node checkEnrichmentStatus.js
```

### Web UI Monitoring

1. Go to: https://github.com/amirchason/babyname2/actions
2. Click on "Name Enrichment (Cloud)" workflow
3. View real-time logs and status
4. Download logs as artifacts (kept for 7 days)

## ⚙️ How It Works

### Workflow Behavior

1. **Runs every 6 hours** or on manual trigger
2. **Checks completion status** - Skips if already done
3. **Processes for 5.5 hours** - Leaves 30min buffer before GitHub's 6hr limit
4. **Saves checkpoint** - Records exact position (chunk + index)
5. **Commits results** - Pushes updated data chunks and logs
6. **Exits gracefully** - Next run continues from checkpoint

### Time Management

- **Max runtime**: 5.5 hours per run
- **Processing rate**: ~200-300 names/hour
- **Total estimate**: 2-3 runs (12-18 hours elapsed time)
- **GitHub limit**: 2000 minutes/month (free tier)

### Cost Breakdown

- **GitHub Actions**: FREE (public repo)
- **OpenAI API**:
  - Already spent: $2.25 (42,604 names)
  - Remaining: ~$5-6 (103,000 names)
  - **Total**: ~$7-8 for all 146k names

## 🔧 Configuration

### Adjust Schedule

Edit `.github/workflows/enrichment.yml`:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 */3 * * *'  # Every 3 hours
  # - cron: '0 0 * * *'    # Once per day at midnight
```

### Adjust Max Duration

Trigger manually with custom duration:

```bash
# Run for 2 hours
gh workflow run enrichment.yml -f max_duration_hours=2

# Run for full 5.5 hours (default)
gh workflow run enrichment.yml
```

### Pause/Disable Enrichment

To stop scheduled runs:

```bash
# Disable the workflow
gh workflow disable enrichment.yml

# Re-enable later
gh workflow enable enrichment.yml
```

## 📁 Files Modified/Created

- ✅ `.github/workflows/enrichment.yml` - GitHub Actions workflow
- ✅ `masterEnrichment.js` - Added 5.5hr timeout logic
- ✅ `CLOUD_ENRICHMENT.md` - This documentation
- ⚠️ Requires: GitHub Secret `OPENAI_API_KEY`

## 🐛 Troubleshooting

### Workflow Fails: "Missing OPENAI_API_KEY"

**Solution**: Add the secret in GitHub Settings → Secrets → Actions

### Workflow Not Running Automatically

**Causes**:
- Workflow file not in `master` or `main` branch
- Workflow is disabled
- Repository is private (needs billing)

**Solution**:
```bash
# Check workflow status
gh workflow view enrichment.yml

# Enable if disabled
gh workflow enable enrichment.yml

# Ensure pushed to correct branch
git branch
git push origin master
```

### Progress Not Updating

**Check**:
```bash
# View recent run logs
gh run view --log

# Look for commit step
# Should see: "✅ Changes committed and pushed"
```

### API Rate Limit Errors

**Solution**: The script already has 1.5s delay between batches. If you hit limits:
- Reduce schedule frequency (e.g., once per day)
- Check OpenAI dashboard for quota

## 📈 Expected Timeline

Based on current progress:

```
Current Status:
├─ Chunk 1: 29,001 / 29,012 (100%) ✅
├─ Chunk 2:  9,971 / 39,011 ( 26%) 🟡
├─ Chunk 3:  2,670 / 39,011 (  7%) 🔴
└─ Chunk 4:      0 / 39,011 (  0%) ⚪

Remaining: ~103,000 names
Estimated Time: 2-3 runs × 5.5 hours = 11-16.5 hours processing
Elapsed Time: 24-48 hours (with 6hr spacing)
Total Cost: ~$5-6 more in API fees
```

## ✅ Completion

When enrichment is complete:

1. Workflow will log: **"🎉 ENRICHMENT COMPLETED!"**
2. `master_state.json` will show: `"status": "completed"`
3. Scheduled runs will skip automatically
4. All 146k names will have meanings/origins

You can then:
```bash
# Pull final results
git pull

# Deploy updated data
npm run deploy

# Verify completion
node checkEnrichmentStatus.js
```

## 🆘 Support

If you encounter issues:

1. Check workflow logs: `gh run view <run-id> --log`
2. Check master state: `cat enrichment_logs/master_state.json`
3. View errors: `cat enrichment_logs/errors.json`
4. Manual run: `node masterEnrichment.js` (local test)

---

**Last Updated**: 2025-10-05
**Status**: Ready to deploy
**Next Step**: Add GitHub Secret and trigger first run
