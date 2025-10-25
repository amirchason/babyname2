# DataPipeline Webhook Setup Guide

**Service**: DataPipeline LLM-ready data scraping
**Status**: ✅ Ready to configure
**Security**: ✅ Full protection enabled

---

## 📋 Quick Setup Checklist

- [ ] 1. Deploy webhook endpoints to Vercel
- [ ] 2. Copy webhook URLs to DataPipeline
- [ ] 3. Generate and save API keys
- [ ] 4. Test webhook connectivity
- [ ] 5. Run first scraping job

---

## 🔗 Webhook URLs (Copy These to DataPipeline)

### Input Webhook URL
```
https://soulseedbaby.com/api/scraper-input
```

**What it does**: DataPipeline fetches the list of URLs to scrape from this endpoint

**Method**: GET
**Authentication**: API key in header or query parameter

### Output Webhook URL
```
https://soulseedbaby.com/api/scraper-output
```

**What it does**: DataPipeline sends scraped results to this endpoint

**Method**: POST
**Authentication**: HMAC signature (optional but recommended)

---

## 🚀 Step-by-Step Setup

### Step 1: Deploy Webhooks to Vercel

```bash
cd /data/data/com.termux/files/home/proj/babyname2
npm run deploy
```

This deploys:
- ✅ `/api/scraper-input.js` - Input webhook
- ✅ `/api/scraper-output.js` - Output webhook
- ✅ Updated `robots.txt` - Blocks `/api/` from crawling
- ✅ Updated `vercel.json` - Adds `X-Robots-Tag: noindex` headers

**Wait time**: 10-30 seconds

**Verify deployment**:
```bash
# Should return 405 Method Not Allowed (POST only)
curl https://soulseedbaby.com/api/scraper-output

# Should return 401 Unauthorized (missing API key)
curl https://soulseedbaby.com/api/scraper-input
```

---

### Step 2: Generate Secure API Keys

#### Generate DataPipeline API Key

```bash
# Generate random 32-character API key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

**Example output**: `a3f5e8d2c4b9f7e1d6a8c5b2e9f4d7a3`

Copy this and save it:
```bash
# Add to .env
DATAPIPELINE_API_KEY=a3f5e8d2c4b9f7e1d6a8c5b2e9f4d7a3
```

#### Generate Webhook Secret (for HMAC)

```bash
# Generate random 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output**: `7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8`

Copy this and save it:
```bash
# Add to .env
WEBHOOK_SECRET=7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8
```

#### Deploy Environment Variables to Vercel

```bash
# Add API key
vercel env add DATAPIPELINE_API_KEY production
# Paste: a3f5e8d2c4b9f7e1d6a8c5b2e9f4d7a3

# Add webhook secret
vercel env add WEBHOOK_SECRET production
# Paste: 7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8

# Redeploy to apply env vars
npm run deploy
```

---

### Step 3: Configure DataPipeline

Go to DataPipeline → New Project → LLM-ready data

#### Section 1: Input Settings

**Input from**: `Webhook input`

**Webhook URL**:
```
https://soulseedbaby.com/api/scraper-input?key=a3f5e8d2c4b9f7e1d6a8c5b2e9f4d7a3
```

*(Replace `a3f5e8d2c4b9f7e1d6a8c5b2e9f4d7a3` with your actual `DATAPIPELINE_API_KEY`)*

**Additional options** (optional):
- ✅ Enable JavaScript rendering
- ✅ Wait for page load (3-5 seconds)
- ✅ Extract text/markdown format

#### Section 2: Output Settings

**Output to**: `Webhook`

**Webhook URL**:
```
https://soulseedbaby.com/api/scraper-output
```

**Send format**: `Send as a raw file` (default)
- Alternative: `Send as Multipart-form-data` (if you need file attachments)

**Scraping frequency**: `Just scrape once`
- For testing, start with one-time scrape
- Later: Set to `Daily` or `Weekly` for automatic updates

**Notification preferences**: `Never`
- You'll get results via webhook, no email needed

---

### Step 4: Test Webhook Connectivity

#### Test Input Webhook

```bash
# Manually fetch URLs list (should see JSON response)
curl "https://soulseedbaby.com/api/scraper-input?key=YOUR_API_KEY_HERE"
```

**Expected response**:
```json
{
  "urls": [
    "https://nameberry.com/celebrity-baby-names/k",
    "https://nameberry.com/celebrity-baby-names/a",
    "https://nameberry.com/celebrity-baby-names/b"
  ],
  "timestamp": "2025-10-25T..."
}
```

#### Test Output Webhook

```bash
# Send test data (simulate DataPipeline)
curl -X POST https://soulseedbaby.com/api/scraper-output \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://nameberry.com/celebrity-baby-names/k",
    "content": "<html>Test content</html>",
    "markdown": "# Test",
    "text": "Test content"
  }'
```

**Expected response**:
```json
{
  "received": true,
  "timestamp": "2025-10-25T...",
  "processed": true
}
```

---

### Step 5: Monitor Webhook Logs

Check Vercel deployment logs to see webhook activity:

```bash
# View real-time logs
vercel logs --follow

# Or visit Vercel dashboard:
# https://vercel.com/your-project/logs
```

**Expected log output**:
```
📥 Received webhook from DataPipeline
   IP: 54.243.47.243
   Timestamp: 2025-10-25T10:30:00Z
📄 Processing: https://nameberry.com/celebrity-baby-names/k
   Letter: k
   ✅ Found 82 celebrity babies
   💾 Saved to: scripts/celebrity-cache/nameberry-k.json
```

---

## 🔒 Security Features Enabled

### 1. X-Robots-Tag: noindex
- ✅ Prevents Google from indexing webhook URLs
- ✅ Applied to all `/api/*` routes
- ✅ Configured in `vercel.json`

### 2. robots.txt Blocking
- ✅ `Disallow: /api/` added to robots.txt
- ✅ Belt-and-suspenders approach with X-Robots-Tag

### 3. Method Restrictions
- ✅ Input webhook: GET only (405 for POST)
- ✅ Output webhook: POST only (405 for GET)
- ✅ Prevents accidental crawling by bots

### 4. API Key Authentication
- ✅ Input webhook requires `?key=` parameter or `X-API-Key` header
- ✅ 401 Unauthorized if key missing or invalid

### 5. HMAC Signature Verification (Optional)
- ✅ Output webhook verifies `X-Webhook-Signature` header
- ✅ Uses `WEBHOOK_SECRET` to validate sender
- ✅ Prevents webhook spoofing

### 6. Rate Limiting (Future)
- ⏳ Can add Upstash Redis rate limiting if needed
- ⏳ Limit: 10 requests/hour per IP

---

## 📊 Expected Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. DataPipeline Fetches Input List                        │
│     GET https://soulseedbaby.com/api/scraper-input?key=XXX │
│     ← Returns: ["https://nameberry.com/...", ...]          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. DataPipeline Scrapes Each URL                          │
│     - Renders JavaScript (Next.js pages)                   │
│     - Extracts text/markdown/HTML                          │
│     - Waits 3-5 seconds for page load                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. DataPipeline Sends Results to Output Webhook           │
│     POST https://soulseedbaby.com/api/scraper-output       │
│     Body: { url, content, markdown, text }                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Output Webhook Processes Data                          │
│     - Extracts Next.js __NEXT_DATA__ JSON                  │
│     - Parses celebrity baby entries                        │
│     - Saves to scripts/celebrity-cache/nameberry-X.json    │
│     - Returns 200 OK acknowledgment                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Use Cases

### Use Case 1: Scrape All A-Z Celebrity Baby Names

**Edit**: `api/scraper-input.js` lines 21-25
```javascript
const urlsToScrape = [
  'https://nameberry.com/celebrity-baby-names/a',
  'https://nameberry.com/celebrity-baby-names/b',
  // ... add all 26 letters
  'https://nameberry.com/celebrity-baby-names/z'
];
```

**Deploy**: `npm run deploy`

**Run in DataPipeline**: Click "Review & start scraping"

**Result**: 26 JSON files saved to `scripts/celebrity-cache/`

---

### Use Case 2: Scrape Specific Letters On-Demand

**Option A**: Update input webhook and redeploy
**Option B**: Use DataPipeline's "List" input instead:

1. Input from: `List`
2. Enter URLs:
   ```
   https://nameberry.com/celebrity-baby-names/k
   https://nameberry.com/celebrity-baby-names/m
   https://nameberry.com/celebrity-baby-names/s
   ```
3. Output to: `Webhook`
4. Webhook URL: `https://soulseedbaby.com/api/scraper-output`

---

### Use Case 3: Daily Auto-Update

**Settings**:
- Scraping frequency: `Daily`
- Next runs: `Every day at 3:00 AM UTC`

**Benefit**: Celebrity baby database stays up-to-date automatically

---

## 🧪 Testing Checklist

- [ ] Input webhook returns URL list
- [ ] Output webhook receives POST data
- [ ] API key authentication works
- [ ] Webhook logs show in Vercel dashboard
- [ ] Celebrity baby JSON files created in `scripts/celebrity-cache/`
- [ ] No errors in webhook responses
- [ ] Scraped data contains expected Next.js JSON

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized on Input Webhook

**Cause**: Missing or invalid API key

**Fix**:
```bash
# Check .env has correct key
cat .env | grep DATAPIPELINE_API_KEY

# Verify Vercel has env var
vercel env ls

# Use correct URL format
https://soulseedbaby.com/api/scraper-input?key=YOUR_KEY_HERE
```

---

### Issue: 405 Method Not Allowed

**Cause**: Using wrong HTTP method

**Fix**:
- Input webhook: Use GET (not POST)
- Output webhook: Use POST (not GET)

---

### Issue: No Data Received in Output Webhook

**Cause**: DataPipeline couldn't scrape the URLs

**Check**:
1. DataPipeline job status (check dashboard)
2. Vercel logs (`vercel logs --follow`)
3. Input webhook returned valid URLs

---

### Issue: JSON Extraction Failed

**Cause**: Nameberry changed their HTML structure

**Fix**: Update extraction logic in `api/scraper-output.js`:
```javascript
// Current extraction (line 51)
const scriptMatch = content?.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.+?)<\/script>/s);

// If Nameberry changes, update regex or use different approach
```

---

## 📈 Performance & Costs

### DataPipeline Credits
- **Free tier**: 5,000 credits
- **Cost per scrape**: Varies by site (usually 1-5 credits)
- **Nameberry (Next.js)**: ~3 credits per page (needs JavaScript rendering)

**Example**:
- 26 letters × 3 credits = 78 credits
- With 5,000 credits, you can scrape all letters ~64 times

### Vercel Limits
- **Function execution**: 10 seconds max (hobby plan)
- **Bandwidth**: 100 GB/month (hobby plan)
- **Webhook payload**: 4.5 MB max

**Expected usage**:
- Webhook hits: ~26/month (one-time A-Z scrape)
- Bandwidth: <1 MB per scrape
- Well within free tier limits

---

## ✅ Post-Setup Integration

### Integrate with V8 Enrichment

Once you have cached data in `scripts/celebrity-cache/`, the existing V8 enrichment automatically uses it!

**How it works**:
1. `enrich-v8-complete.js` runs Phase 4: Celebrity Babies
2. Calls `enrichCelebrityBabies(firstName)`
3. Fetches from `scripts/celebrity-cache/nameberry-{letter}.json`
4. If cache exists: Uses cached data (instant!)
5. If cache missing: Falls back to live Nameberry fetch (~1.5s)

**No code changes needed!** ✅

---

## 🎓 Next Steps

1. **Deploy webhooks**: `npm run deploy`
2. **Test input webhook**: Visit `https://soulseedbaby.com/api/scraper-input?key=YOUR_KEY`
3. **Configure DataPipeline**: Paste webhook URLs
4. **Run first scrape**: Click "Review & start scraping"
5. **Verify results**: Check `scripts/celebrity-cache/` for JSON files

---

## 📚 Additional Resources

- **DataPipeline Docs**: https://datapipeline.com/docs
- **Vercel Serverless Functions**: https://vercel.com/docs/functions
- **Webhook Security Best Practices**: See `docs/WEBHOOK_SEO_IMPACT_RESEARCH.md`
- **Celebrity Baby Integration**: See `CELEBRITY_BABIES_IMPLEMENTATION.md`

---

**Setup Guide Version**: 1.0
**Last Updated**: 2025-10-25
**Status**: ✅ Ready for production
