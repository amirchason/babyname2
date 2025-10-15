# USA 2024 Names Enrichment - Quick Start Guide

## What This Does

Adds **top 5,000 USA baby names for 2024** to your database with:
- ✅ Gender (male/female)
- ✅ Meaning (max 4 words)
- ✅ Origin (e.g., Hebrew, Latin, English)
- ✅ Rating (1-10 popularity score)
- ✅ Automatic duplicate checking
- ✅ Uses GPT-4o-mini ($0.25 total cost)

## Files Created

| File | Purpose |
|------|---------|
| `addTop5000USA2024.js` | Main enrichment script |
| `fetchSSAData2024.js` | Fetches SSA (Social Security) data |
| `deployToCloud.sh` | Package for cloud deployment |
| `USA_2024_ENRICHMENT_README.md` | Full documentation |

## Run in Cloud (Recommended) ☁️

### Quick Deploy to Cloud Server

```bash
# 1. Package everything
./deployToCloud.sh

# 2. Upload to cloud (example with scp)
scp /storage/emulated/0/Download/clouddeployment/usa2024-enrichment-*.tar.gz user@server.com:~/

# 3. On cloud server
ssh user@server.com
tar -xzf usa2024-enrichment-*.tar.gz
npm install openai axios dotenv
node addTop5000USA2024.js

# 4. Download enriched database back
scp user@server.com:~/public/data/names-chunk1.json ./public/data/
```

### GitHub Actions (Free Cloud CI/CD)

1. Add `OPENAI_API_KEY` to GitHub Secrets
2. Create `.github/workflows/enrich-names.yml` (see README)
3. Go to Actions tab → Run workflow
4. Wait 20-30 minutes

## Run Locally (Not Recommended) 📱

⚠️ **Warning:** This will use your phone's resources and battery.

```bash
cd /data/data/com.termux/files/home/proj/babyname2

# Test SSA fetch only
node fetchSSAData2024.js

# Full enrichment (takes 60-90 mins)
node addTop5000USA2024.js
```

## What Happens

1. **Fetch** top 5,000 USA names from SSA data
2. **Check** for duplicates in existing 145K database
3. **Enrich** each new name with GPT-4o-mini
   - Process 10 names per batch
   - 2 second delay between batches
   - Auto-resume on interruption
4. **Add** to database with proper metadata
5. **Save** progress to `usa2024_enrichment_progress.json`

## Expected Results

- **Before:** 145,575 names
- **After:** ~147,000-150,000 names (depending on duplicates)
- **Cost:** ~$0.25 (GPT-4o-mini is very cheap!)
- **Time:** 20-30 mins (cloud) or 60-90 mins (local)

## Progress Tracking

```bash
# View progress anytime
cat usa2024_enrichment_progress.json

# Output example:
{
  "totalProcessed": 2300,
  "totalAdded": 2100,
  "totalDuplicates": 200,
  "estimatedCost": 0.12
}
```

## Verify Results

```bash
# Count how many USA 2024 names were added
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/names-chunk1.json'));
const usa2024 = data.names.filter(n => n.source === 'USA_SSA_2024');
console.log('Added', usa2024.length, 'USA 2024 names');
"
```

## Backup First! ⚠️

**CRITICAL:** Always backup before enrichment:

```bash
# Quick backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
cp public/data/names-chunk1.json public/data/names-chunk1.backup-${TIMESTAMP}.json
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API rate limit | Script auto-retries with delays |
| Out of memory | Use cloud instead of local |
| Script stops | Just re-run - it resumes automatically |
| No duplicates found | Ensure chunk files exist in `public/data/` |

## Full Documentation

See `USA_2024_ENRICHMENT_README.md` for:
- Detailed deployment instructions
- Cost breakdown
- Firebase Cloud Functions setup
- Advanced configuration

## Questions?

- Check `usa2024_enrichment_progress.json` for progress
- Review logs for errors
- Ensure OpenAI API key has credits

---

**Last Updated:** 2025-10-14
**Estimated Runtime:** 20-30 minutes (cloud)
**Estimated Cost:** $0.25 USD
