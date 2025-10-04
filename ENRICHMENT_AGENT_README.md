# 🤖 Enrichment Agent - Automated Name Processing

## Quick Start

The enrichment agent handles everything automatically. Just run:

```bash
./enrich
```

Or if you prefer:
```bash
node enrichmentAgent.js
```

This will:
- ✅ Check if enrichment is already running
- ✅ Resume from last checkpoint if stopped
- ✅ Start fresh if never run before
- ✅ Monitor progress automatically
- ✅ Generate reports every 5 minutes

## Simple Commands

### For Claude Code Users

Just tell Claude:
- **"resume enriching"** - Continues from where it stopped
- **"check enrichment"** - Shows current progress
- **"stop enriching"** - Stops the process gracefully

### Command Line Usage

```bash
# AUTO MODE (Recommended - handles everything)
./enrich

# Check current status
./enrich status

# Resume from last checkpoint
./enrich resume

# Stop enrichment
./enrich stop

# Monitor live progress
./enrich monitor

# Generate detailed report
./enrich report
```

## What It Does

The enrichment agent processes all baby names with AI to add:
- **Meanings** - What the name means
- **Origins** - Cultural/language origins (Hebrew, Latin, etc.)
- **Multiple meanings** - If applicable

### Current Settings:
- **Model**: GPT-4o-mini (cheap & fast)
- **Cost**: ~$0.05 per 1000 names
- **Speed**: ~400 names per minute
- **Batch Size**: 10 names per API call

## Progress Tracking

The system automatically:
- 📁 Saves progress after every batch
- 📊 Generates reports every 5 minutes
- 💾 Fully resumable - safe to stop anytime
- 📈 Tracks costs and error rates

### Files Created:
```
enrichment_logs/
├── master_state.json        # Main tracking file
├── errors.json             # Error tracking
├── session_*.log           # Detailed logs
└── progress_reports/       # 5-minute reports
    └── report_*.txt
```

## Status Information

When you run `./enrich status`, you'll see:

```
📊 ENRICHMENT STATUS
═══════════════════════════════════
Status: ready (RUNNING)

📈 Progress:
   Total processed: 12,162 names
   Total errors: 1,453
   Current chunk: 1/4
   Cost so far: $0.729

📦 Chunks:
   ⏳ Chunk 1: 11200/29012 (38.6%)
   ⏸️ Chunk 2: 0/? (?%)
   ⏸️ Chunk 3: 0/? (?%)
   ⏸️ Chunk 4: 0/? (?%)

⏰ Estimated time remaining: 15.2 hours
```

## Auto Mode Features

The default `auto` mode is intelligent:

1. **If nothing running** → Starts/resumes automatically
2. **If already running** → Shows status and monitors
3. **If completed** → Shows completion report
4. **If errors occur** → Retries automatically (up to 3 times)

## Monitoring Progress

### Live Monitoring
```bash
./enrich monitor
```
Shows real-time updates every 5 minutes

### Check Logs
```bash
# Latest session log
tail -f enrichment_logs/session_*.log

# Latest report
ls -lt enrichment_logs/progress_reports/ | head -2
```

## Emergency Commands

If something goes wrong:

```bash
# Force stop all enrichment
pkill -f masterEnrichment

# Check what's running
ps aux | grep enrichment

# Clear and restart
rm -rf enrichment_logs
./enrich start
```

## Error Handling

The system automatically:
- Retries failed batches (up to 3 times)
- Logs all errors to `enrichment_logs/errors.json`
- Continues with next batch if one fails
- Tracks error names for manual review

## Cost Tracking

Current rates with GPT-4o-mini:
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens
- Average: ~$0.05 per 1000 names

## Requirements

✅ OpenAI API key in `.env` file
✅ Node.js installed
✅ ~100MB free disk space for logs

## FAQ

**Q: Can I stop it anytime?**
A: Yes! Progress saves after each batch (10 names)

**Q: Will it resume exactly where it stopped?**
A: Yes! Down to the exact name index

**Q: What if my API quota runs out?**
A: It will pause and wait. Just add credits and resume

**Q: How do I know it's working?**
A: Check `./enrich status` or monitor the logs

**Q: Is it safe to close terminal?**
A: Yes! It runs in background with `nohup`

---

**Pro Tip**: Just run `./enrich` and forget about it. The agent handles everything automatically! 🎉