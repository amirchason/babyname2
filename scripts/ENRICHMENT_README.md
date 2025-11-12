# V13 Cloud Enrichment Script

## Overview

This script enriches baby names with comprehensive v13 data using OpenAI's GPT-4o model.

## Features

✅ **Best GPT Model**: Uses GPT-4o (latest and most capable)
✅ **Resumable**: Checkpoints after each name - safe to stop/restart
✅ **Error Handling**: Exponential backoff for rate limits
✅ **Retry Logic**: Up to 3 attempts for failed names
✅ **Progress Logging**: Real-time progress and statistics
✅ **Auto-Recovery**: Continues from last checkpoint on restart

## Setup

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key (or use existing)
3. Copy the key (starts with `sk-proj-...`)

### 2. Add Key to .env File

Edit `.env` file in project root:

```bash
# Change this line:
OPENAI_API_KEY=process.env.OPENAI_API_KEY

# To your actual key:
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
```

**Important**: The key must be set as `OPENAI_API_KEY` (NOT `REACT_APP_OPENAI_API_KEY`)

### 3. Verify Setup

```bash
# Check that the key is set correctly
grep "^OPENAI_API_KEY=" .env

# Should show your actual key, not "process.env.OPENAI_API_KEY"
```

## Usage

### Run Full Enrichment (Top 1000 Names)

```bash
node scripts/enrichV13Cloud.js
```

### Run in Background (Recommended)

```bash
# Run in background with logging
nohup node scripts/enrichV13Cloud.js > enrichment.log 2>&1 &

# Monitor progress
tail -f enrichment.log

# Check background process
ps aux | grep enrichV13Cloud
```

### Resume After Interruption

The script automatically resumes from the last checkpoint:

```bash
# Just run again - it will continue where it left off
node scripts/enrichV13Cloud.js
```

## Cost Estimate

- **Model**: GPT-4o
- **Tokens per name**: ~4,000 (1,500 input + 2,500 output)
- **Top 1000 names**: ~4M total tokens
- **Estimated cost**: ~$29 USD
  - Input: ~$3.75 (1.5M tokens × $2.50/1M)
  - Output: ~$25 (2.5M tokens × $10/1M)

**Already enriched**: 103 names
**Remaining**: ~897 names ≈ $26

## Progress Files

The script creates these files:

- `scripts/v13Checkpoint.json` - Resume point (last processed name)
- `scripts/v13Failed.json` - Names that failed after 3 retries
- `public/data/enriched/v13-manifest.json` - List of enriched names
- `public/data/enriched/{name}-v13.json` - Individual enriched files

## Monitoring Progress

### Real-time Progress

```bash
# If running in background
tail -f enrichment.log

# Look for lines like:
# [2025-01-12T...] ⏳ Enriching: Emma (Rank #1)
# [2025-01-12T...] ✅ Saved: emma-v13.json
# [2025-01-12T...] 📝 Progress: 150/897 (16.7%) - 150 success, 0 errors
```

### Check Checkpoint

```bash
cat scripts/v13Checkpoint.json
```

### Check Manifest

```bash
cat public/data/enriched/v13-manifest.json | jq '.totalEnriched'
```

### List Enriched Files

```bash
ls -lh public/data/enriched/*-v13.json | wc -l
```

## Stopping the Script

### Graceful Stop (Recommended)

```bash
# Press Ctrl+C if running in foreground
# The checkpoint will be saved automatically
```

### Kill Background Process

```bash
# Find process ID
ps aux | grep enrichV13Cloud

# Kill process (replace PID)
kill PID

# Checkpoint is saved after each name, so safe to kill
```

## Error Handling

### Rate Limit Errors (429)

The script automatically:
1. Waits with exponential backoff (2s, 4s, 8s)
2. Retries up to 3 times
3. Logs failed names to `v13Failed.json`

### Failed Names

After the main run, the script automatically retries failed names. If they still fail:

```bash
# Check failed names
cat scripts/v13Failed.json

# They'll be retried in the next run
# Or manually investigate individual failures
```

### Invalid API Key

```
Error: Invalid API key provided
```

**Solution**: Check `.env` file has correct `OPENAI_API_KEY=sk-proj-...`

### Network Issues

The script will retry automatically. If persistent:

```bash
# Wait a few minutes
# Then run again - it resumes from checkpoint
node scripts/enrichV13Cloud.js
```

## After Enrichment

### 1. Verify Results

```bash
# Check how many were enriched
cat public/data/enriched/v13-manifest.json | jq '.totalEnriched'

# Spot check a few files
cat public/data/enriched/emma-v13.json | jq '.name, .origin, .meaning'
```

### 2. Test in UI

```bash
# Build and test locally
npm start

# Click on enriched names like Emma, Noah, Olivia
# Should see v13 SUPER ENRICHED profile
```

### 3. Deploy to Production

```bash
# Commit enriched files
git add public/data/enriched/*.json scripts/v13*.json
git commit -m "feat: Enrich top 1000 names with v13 data"
git push origin master

# Vercel will auto-deploy
# Or manually: npm run deploy
```

## Troubleshooting

### Script exits immediately

**Cause**: Missing dependencies or syntax error

```bash
# Reinstall dependencies
npm install

# Check for errors
node scripts/enrichV13Cloud.js
```

### OpenAI module not found

```bash
# Install OpenAI SDK
npm install openai
```

### Out of memory

The script processes one name at a time, so memory should be fine. If issues:

```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" node scripts/enrichV13Cloud.js
```

### Too slow / want to speed up

Current: 2 seconds per name = ~30 minutes for 897 names

To speed up (risky - may hit rate limits):

Edit `scripts/enrichV13Cloud.js` line 17:
```javascript
// Change from:
DELAY_MS: 2000,
// To:
DELAY_MS: 1000,  // 1 second = ~15 minutes total
```

## Files Generated

Each name gets a comprehensive JSON file with:

- ✅ Basic info (origin, meaning, gender, pronunciation)
- ✅ Cultural significance & modern context
- ✅ 2-3 historic figures (if notable)
- ✅ 2-3 famous modern people (actors, musicians, etc.)
- ✅ 1-2 famous athletes (if notable)
- ✅ 2-3 movies/shows with characters
- ✅ 1-2 character quotes
- ✅ 2-3 songs featuring the name
- ✅ 6 translations (Spanish, Greek, Arabic, Chinese, Russian, Hebrew)
- ✅ Celestial/numerology data (lucky numbers, colors, gemstones)
- ✅ Religious significance (if applicable)
- ✅ 1-2 notable books
- ✅ Category tags (Classic, Timeless, Royal, Biblical, etc.)
- ✅ Blog-style article by one of 3 writer personas

## Support

Questions or issues? Check:

1. `enrichment.log` for detailed output
2. `scripts/v13Failed.json` for failed names
3. `scripts/v13Checkpoint.json` for last position
4. Console output for real-time errors

## Next Steps

Once enrichment is complete:

1. ✅ Test locally: `npm start`
2. ✅ Click enriched names to see v13 profiles
3. ✅ Commit to git
4. ✅ Deploy: `npm run deploy`
5. 🎉 Enjoy rich name profiles on soulseedbaby.com!
