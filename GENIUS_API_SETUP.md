# 🎵 Genius API Setup Guide

**Date**: 2025-10-25
**Purpose**: Add Genius API to V10 song enrichment for better music data

---

## 📋 Quick Reference

### App Website URL (IMPORTANT - use exact format):
```
https://soulseedbaby.com
```
**Note**: Genius API is very strict about URL format. Use `https://` and NO trailing slash!

### App Icon URL:
```
https://soulseedbaby.com/favicon.ico
```
(Or any direct link to a 192x192 PNG image)

### Redirect URI:
**For simple API access (no OAuth)**: Leave this field EMPTY or use:
```
https://soulseedbaby.com
```
**Note**: We only need the Access Token for searching songs, not full OAuth!

---

## 🚀 Step-by-Step Setup

### 1. Register Your Application

1. Go to: https://genius.com/api-clients
2. Sign in or create a Genius account
3. Click **"New API Client"**

### 2. Fill in Application Details

**Required Fields**:
- **App Name**: `SoulSeed Baby Names`
- **App Website URL**: `https://soulseedbaby.com`
- **Redirect URI**: `https://soulseedbaby.com/api/genius/callback`
- **Icon URL**: `https://soulseedbaby.com/favicon.ico`

**App Description**:
```
SoulSeed is a comprehensive baby name discovery platform that helps parents find the perfect name.
We use the Genius API to enrich name profiles with positive, uplifting songs that feature baby names
in their titles or lyrics. All songs are verified and filtered for positive themes only (no sad,
negative, or dark content). Our goal is to create a joyful, inspiring experience for expecting parents
as they discover the cultural and musical significance of baby names.
```

### 3. Get Your API Credentials

After creating the application, you'll receive:

1. **Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
2. **Client Secret**: `yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`
3. **Access Token**: `zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz`

**⚠️ IMPORTANT**: The **Access Token** is what you need for the V10 enrichment!

### 4. Add to Environment Variables

Add these lines to your `.env` file:

```bash
# ==========================================
# GENIUS API (Music Lyrics & Song Data)
# ==========================================

# Genius API Access Token (main token for API requests)
GENIUS_API_TOKEN=your_access_token_here

# Genius OAuth Credentials (for future OAuth features)
GENIUS_CLIENT_ID=your_client_id_here
GENIUS_CLIENT_SECRET=your_client_secret_here
```

### 5. Test the Integration

Run this command to test:

```bash
node scripts/utils/geniusLyricsScraper.js George
```

**Expected Output**:
```
🎵 Searching for songs with "George" (Genius API + GPT-4)...
🔍 Searching Genius API for "George"...
   ✅ Found 10 songs on Genius

🤖 Using GPT-4 to verify songs with positive filtering...
   ✅ "George" by Headlights (friendship) - PASSED
   ✅ "King George Street" by Squeeze (celebration) - PASSED

🎵 Found 2 verified positive songs
```

---

## 🎯 Benefits of Genius API

### Without Genius Token (Current):
- ✅ Uses GPT-4 knowledge base only
- ✅ Still finds songs (2-3 per name)
- ✅ Positive filtering works
- ⚠️ Limited to GPT's training data (cutoff April 2024)

### With Genius Token (Enhanced):
- ✅ **Searches 2+ million songs** on Genius
- ✅ **More accurate song data** (real lyrics, years, artists)
- ✅ **Up-to-date database** (includes latest releases)
- ✅ **Better verification** (cross-reference Genius + GPT-4)
- ✅ **Still uses positive filtering** (same strict rules)

---

## 🔒 API Limits & Usage

### Free Tier:
- **Rate Limit**: 1,000 requests/day
- **No credit card required**
- **Perfect for name enrichment** (uses ~1 request per name)

### Usage in V10:
- Phase 5 makes **1 search request** per name
- Example: Enriching 100 names = 100 API calls
- Well within free tier limits!

---

## 🧪 Testing Checklist

After setup, test with these commands:

```bash
# Test Genius API directly
node scripts/utils/geniusLyricsScraper.js George
node scripts/utils/geniusLyricsScraper.js Emma
node scripts/utils/geniusLyricsScraper.js Michael

# Test full V10 enrichment
node scripts/enrich-v10-complete.js George male Greek Farmer

# Build and deploy profile
node scripts/build-george-v10-profile.js
npm run deploy
```

---

## 🐛 Troubleshooting

### Error: "No Genius API token configured"
- Check that `GENIUS_API_TOKEN` is in `.env`
- Make sure the token is not wrapped in quotes
- Restart your terminal after adding the token

### Error: "401 Unauthorized"
- Your access token may be invalid
- Regenerate a new token at https://genius.com/api-clients
- Make sure you copied the **Access Token**, not Client ID

### Error: "Rate limit exceeded"
- Free tier allows 1,000 requests/day
- Wait 24 hours or upgrade to paid tier
- V10 will automatically fall back to GPT-4 only

### Songs still not found
- Genius API works! But GPT-4 fallback is also excellent
- Both methods use the same positive filtering
- If no positive songs exist, system returns empty array (correct behavior)

---

## 📚 API Documentation

**Official Docs**: https://docs.genius.com/
**API Console**: https://genius.com/api-clients
**Rate Limits**: https://docs.genius.com/#/getting-started-h1

---

## ✅ Optional: Create API Callback Handler

If you want to add OAuth authentication later (not required for current setup), create:

`public/api/genius/callback.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Genius OAuth Callback</title>
</head>
<body>
  <h1>Genius Authentication Successful!</h1>
  <p>You can close this window.</p>
  <script>
    // Send auth code back to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'GENIUS_AUTH',
        code: new URLSearchParams(window.location.search).get('code')
      }, '*');
      window.close();
    }
  </script>
</body>
</html>
```

**But this is optional!** The Access Token method works perfectly for V10 enrichment.

---

## 🎉 Summary

1. ✅ Register app at https://genius.com/api-clients
2. ✅ Use redirect URI: `https://soulseedbaby.com/api/genius/callback`
3. ✅ Use icon URL: `https://soulseedbaby.com/favicon.ico`
4. ✅ Copy **Access Token** to `.env` as `GENIUS_API_TOKEN`
5. ✅ Test with `node scripts/utils/geniusLyricsScraper.js George`
6. ✅ Enjoy enhanced song data in V10 enrichment!

**Current Status**:
- V10 works WITHOUT Genius token (GPT-4 fallback)
- Adding Genius token = **enhanced song search**
- Positive filtering works **regardless of source**

---

**Setup Complete**: Ready to enhance V10 with Genius API! 🎵
