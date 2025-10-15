# USA 2024 Top 5000 Names Enrichment

This guide explains how to add the top 5,000 USA baby names for 2024 to the SoulSeed database using cloud-based processing.

## Overview

The enrichment process:
1. ✅ Fetches top 5,000 USA names from SSA (Social Security Administration) data for 2024
2. ✅ Checks for duplicates against existing 145K+ name database
3. ✅ Enriches each new name with:
   - **Rating** (1-10 popularity score)
   - **Gender** (male/female)
   - **Meaning** (maximum 4 words)
   - **Origin** (e.g., Hebrew, Latin, English, etc.)
4. ✅ Uses GPT-4o-mini for fast, affordable enrichment
5. ✅ Adds enriched names to the database with proper formatting

## Files Included

- **`addTop5000USA2024.js`** - Main enrichment script (orchestrates the entire process)
- **`fetchSSAData2024.js`** - SSA data fetcher (can run standalone)
- **`usa2024_enrichment_progress.json`** - Progress tracking (auto-generated)
- **`ssa_top5000_2024.json`** - SSA raw data cache (auto-generated)

## Requirements

### Environment Variables
Ensure your `.env` file contains:
```bash
OPENAI_API_KEY=sk-proj-...  # Your OpenAI API key
```

### Node.js Packages
Already installed in this project:
- `openai` - OpenAI API client
- `axios` - HTTP requests
- `dotenv` - Environment variables
- `fs` - File system operations

## Cloud Deployment Options

### Option 1: Run on VPS/Cloud Server (Recommended)

**DigitalOcean, AWS EC2, Google Cloud, etc.**

1. **Upload project to cloud server:**
   ```bash
   # On your local machine (Termux)
   cd /data/data/com.termux/files/home/proj/babyname2

   # Compress project (excluding node_modules)
   tar -czf babyname2-cloud.tar.gz \
     --exclude='node_modules' \
     --exclude='.git' \
     --exclude='build' \
     addTop5000USA2024.js \
     fetchSSAData2024.js \
     package.json \
     .env \
     public/data/names-chunk*.json

   # Upload to cloud (example with scp)
   scp babyname2-cloud.tar.gz user@your-server.com:~/
   ```

2. **On cloud server:**
   ```bash
   # Extract files
   tar -xzf babyname2-cloud.tar.gz

   # Install dependencies
   npm install openai axios dotenv

   # Run the enrichment script
   node addTop5000USA2024.js
   ```

3. **Monitor progress:**
   ```bash
   # Progress is saved to usa2024_enrichment_progress.json
   # You can stop and resume anytime

   tail -f usa2024_enrichment_progress.json
   ```

4. **Download enriched database back to local:**
   ```bash
   # On local machine
   scp user@your-server.com:~/public/data/names-chunk1.json ./public/data/
   ```

### Option 2: GitHub Actions (Free Cloud CI/CD)

Create `.github/workflows/enrich-names.yml`:

```yaml
name: Enrich USA 2024 Names

on:
  workflow_dispatch:  # Manual trigger only

jobs:
  enrich:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install openai axios dotenv

      - name: Run enrichment
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: node addTop5000USA2024.js

      - name: Commit enriched database
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/data/names-chunk1.json
          git commit -m "Add USA 2024 top 5000 enriched names"
          git push
```

**Setup:**
1. Add `OPENAI_API_KEY` to GitHub Secrets (Settings → Secrets → Actions)
2. Go to Actions tab → "Enrich USA 2024 Names" → Run workflow
3. Monitor progress in Actions logs

### Option 3: Firebase Cloud Functions

Create `functions/enrichNames.js`:

```javascript
const functions = require('firebase-functions');
const { processTop5000Names } = require('./addTop5000USA2024');

exports.enrichUSA2024Names = functions
  .runWith({
    timeoutSeconds: 540,  // 9 minutes max
    memory: '2GB'
  })
  .https.onRequest(async (req, res) => {
    try {
      await processTop5000Names();
      res.send('✅ Enrichment complete!');
    } catch (error) {
      res.status(500).send(`❌ Error: ${error.message}`);
    }
  });
```

**Deploy:**
```bash
firebase deploy --only functions
```

## Running Locally (Quick Test)

⚠️ **Note:** This will run on your phone. For production, use cloud options above.

```bash
# Test SSA data fetch only
node fetchSSAData2024.js

# Run full enrichment (this will take time and use API credits)
node addTop5000USA2024.js
```

## Cost Estimation

**GPT-4o-mini Pricing:**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Estimated cost for 5,000 names:**
- ~10 names per batch = 500 API calls
- ~$0.25 total (extremely affordable!)

**Actual cost tracking:**
The script tracks real-time costs in `usa2024_enrichment_progress.json`

## Progress Tracking & Resume

The script automatically saves progress after each batch:

```json
{
  "lastBatchIndex": 230,
  "totalProcessed": 2300,
  "totalAdded": 2100,
  "totalDuplicates": 200,
  "totalErrors": 0,
  "estimatedCost": 0.12,
  "startTime": "2025-10-14T...",
  "lastUpdate": "2025-10-14T..."
}
```

**To resume interrupted processing:**
Simply run the script again - it will continue from where it left off!

## Expected Results

**Before enrichment:**
- Database: 145,575 names

**After enrichment:**
- Database: ~147,000 - 150,000 names (depending on duplicates)
- New names have:
  - ✅ Accurate gender classification
  - ✅ Concise meanings (≤4 words)
  - ✅ Origin information
  - ✅ Rating scores (1-10)
  - ✅ Year 2024 tag
  - ✅ Source: USA_SSA_2024

## Verification

After enrichment completes, verify the results:

```bash
# Check how many names were added
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data/names-chunk1.json'));
const usa2024 = data.names.filter(n => n.source === 'USA_SSA_2024');
console.log('✅ Added', usa2024.length, 'USA 2024 names');
"
```

## Troubleshooting

### API Rate Limits
The script includes automatic 2-second delays between batches and retry logic.

### Out of Memory
If running locally on phone, process in smaller batches by modifying `BATCH_SIZE` constant.

### Duplicate Detection Not Working
Ensure all chunk files exist in `public/data/` before running.

## Database Backup

**CRITICAL:** Always backup before running enrichment!

```bash
cd /data/data/com.termux/files/home/proj/babyname2

# Backup all chunks
cp public/data/names-chunk1.json public/data/names-chunk1.backup-$(date +%Y%m%d).json
cp public/data/names-chunk2.json public/data/names-chunk2.backup-$(date +%Y%m%d).json
cp public/data/names-chunk3.json public/data/names-chunk3.backup-$(date +%Y%m%d).json
cp public/data/names-chunk4.json public/data/names-chunk4.backup-$(date +%Y%m%d).json
```

## Next Steps

1. ✅ Backup database
2. ✅ Choose cloud deployment option
3. ✅ Run enrichment script
4. ✅ Verify results
5. ✅ Deploy to production
6. ✅ Monitor user feedback

## Support

For issues or questions:
- Check `usa2024_enrichment_progress.json` for progress
- Review logs for error messages
- Ensure OpenAI API key is valid and has credits

---

**Last Updated:** 2025-10-14
**Script Version:** 1.0.0
**Estimated Runtime:** 20-30 minutes (cloud), 60-90 minutes (local)
