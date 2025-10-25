# 🎵 Genius API - Legal Implementation Guide

**Date**: 2025-10-25
**Status**: ✅ Legal & Compliant

---

## ⚠️ **CRITICAL: Genius API Terms of Service**

### ❌ **What You CANNOT Do**:
1. **Display song lyrics** (even snippets) - Copyright violation
2. **Scrape lyrics** from Genius website - Terms of Service violation
3. **Quote lyrics** without proper licensing - Copyright infringement

### ✅ **What You CAN Do**:
1. **Search for songs** using Genius API
2. **Get song metadata** (title, artist, year, URL)
3. **Link to Genius pages** where users can view lyrics legally
4. **Provide your own descriptions** of songs (not actual lyrics)

---

## 🎯 **Our Legal Solution**

Instead of showing lyrics, we display:

### **Song Cards with**:
1. ✅ **Song Title** (factual information - legal)
2. ✅ **Artist Name** (factual information - legal)
3. ✅ **Year & Genre** (metadata - legal)
4. ✅ **Link to Genius page** (encouraged by Genius!)
5. ✅ **YouTube search link** (legal)
6. ✅ **Our own description** of how the name appears (not lyrics!)
7. ✅ **Theme/vibe** (our analysis, not copyrighted content)

---

## 📊 **Song Data Format (V10)**

```json
{
  "title": "George",
  "artist": "Headlights",
  "year": 2008,
  "genre": "Indie Pop",
  "nameContext": "The name is repeated in the chorus",
  "description": "An upbeat indie pop song celebrating friendship and connection",
  "theme": "friendship",
  "positiveVibeScore": 8,
  "youtubeSearchUrl": "https://youtube.com/results?search_query=George%20played%20by%20Headlights",
  "geniusUrl": "https://genius.com/Headlights-george-lyrics",
  "verified": true
}
```

**Note**: `description` is our own summary, NOT actual lyrics!

---

## 🔧 **Genius API Setup (Correct)**

### **1. Registration URL**:
https://genius.com/api-clients

### **2. Fill in Application Form**:

**App Name**:
```
SoulSeed Baby Names
```

**App Website URL** (⚠️ EXACT FORMAT REQUIRED):
```
https://soulseedbaby.com
```
**IMPORTANT**: No `www.`, no trailing slash, must start with `https://`

**Redirect URI** (for simple API access):
```
https://soulseedbaby.com
```
**OR leave empty** - we only need the Access Token, not full OAuth!

**App Icon URL**:
```
https://soulseedbaby.com/favicon.ico
```
**OR** any direct image URL (192x192 PNG recommended)

**App Description**:
```
SoulSeed helps parents discover baby names through comprehensive profiles.
We use Genius API to find songs featuring baby names (metadata only - we
link to Genius for lyrics). All songs are filtered for positive themes.
```

### **3. Get Your Access Token**:

After creating the app, Genius will provide:
- Client ID
- Client Secret
- **Access Token** ← This is what you need!

### **4. Add to `.env`**:

```bash
# Genius API (for song metadata - NO lyrics scraping!)
GENIUS_API_TOKEN=your_access_token_here
```

---

## 🧪 **Testing**

### Test the legal implementation:
```bash
node scripts/utils/geniusApiLegal.js George
```

**Expected Output**:
```
🎵 Finding songs with "George" (legal method - no lyrics)...
🔍 Searching Genius API for songs with "George"...
   ✅ Found 10 songs on Genius

🤖 Using GPT-4 to analyze and verify songs...
   ✅ "George" by Headlights (friendship) - VERIFIED
   ✅ "King George Street" by Squeeze (celebration) - VERIFIED

📋 2 Positive Songs Found:

   1. "George" by Headlights
      Theme: friendship | Vibe: 8/10
      View on Genius: https://genius.com/Headlights-george-lyrics
      YouTube: https://youtube.com/results?search_query=George%20played%20by%20Headlights
```

### Test full V10 enrichment:
```bash
node scripts/enrich-v10-complete.js George male Greek Farmer
```

---

## 📱 **User Experience**

### **What Users See**:

**Song Card Display**:
```
🎵 Songs Featuring "George"

1. "George" by Headlights (2008, Indie Pop)

   An upbeat indie pop song celebrating friendship and connection.
   The name is repeated throughout the song, creating a personal feel.

   Theme: Friendship | Vibe: 😊 8/10

   [🎧 Listen on YouTube] [📖 View Lyrics on Genius]

2. "King George Street" by Squeeze (1985, Rock)

   A lively rock song celebrating a place full of positive memories.
   The name appears in the title and chorus.

   Theme: Celebration | Vibe: 😊 9/10

   [🎧 Listen on YouTube] [📖 View Lyrics on Genius]
```

**Users click "View Lyrics on Genius"** → Redirects to official Genius page where they can read lyrics legally!

---

## ⚖️ **Legal Compliance**

### ✅ **Copyright Safe**:
- We do NOT display any copyrighted lyrics
- We provide our own descriptions (not copyrighted)
- We link to Genius for users to view lyrics there

### ✅ **Terms of Service Compliant**:
- We use official Genius API (not web scraping)
- We only request song metadata (title, artist, URL)
- We drive traffic TO Genius (they benefit!)

### ✅ **Fair Use**:
- Song titles and artist names are factual information (not copyrighted)
- Our descriptions are original content
- Links to source material are encouraged

---

## 🚀 **Benefits of This Approach**

### **1. Legal Protection**:
- No copyright infringement
- No TOS violations
- Safe for commercial use

### **2. Better User Experience**:
- Professional presentation
- Direct links to full lyrics
- YouTube listening links
- Positive filtering still works

### **3. SEO Friendly**:
- Links to Genius help our SEO
- Outbound links to authoritative sources
- Original content (our descriptions)

### **4. Genius Approval**:
- They WANT you to link to their pages
- They provide API specifically for this use case
- Drives traffic to their platform

---

## 🎨 **Profile Display Example**

Here's how songs appear in V10 profiles:

```html
<div class="song-card">
  <h3>🎵 "George" by Headlights</h3>
  <p class="song-meta">2008 • Indie Pop • Friendship Theme</p>

  <p class="song-description">
    An upbeat indie pop song celebrating friendship and connection.
    The name "George" is repeated throughout, creating a warm,
    personal feel to the track.
  </p>

  <div class="song-links">
    <a href="https://youtube.com/results?search_query=George+played+by+Headlights"
       target="_blank" class="btn-youtube">
      🎧 Listen on YouTube
    </a>
    <a href="https://genius.com/Headlights-george-lyrics"
       target="_blank" class="btn-genius">
      📖 Read Lyrics on Genius
    </a>
  </div>

  <div class="vibe-score">
    Positive Vibe: 😊😊😊😊😊😊😊😊 8/10
  </div>
</div>
```

**No lyrics shown** - just links to where users can find them legally!

---

## 📝 **Summary**

### **What We Do**:
1. ✅ Search Genius API for song metadata
2. ✅ Use GPT-4 to verify and describe songs (our own words!)
3. ✅ Apply positive filtering (no sad/dark songs)
4. ✅ Link to Genius pages for lyrics viewing
5. ✅ Link to YouTube for listening

### **What We DON'T Do**:
1. ❌ Display copyrighted lyrics
2. ❌ Scrape lyrics from websites
3. ❌ Quote lyrics without licensing

### **Result**:
- 100% legal implementation ✅
- Better user experience ✅
- Genius API compliant ✅
- Copyright safe ✅
- Positive filtering intact ✅

---

**Implementation Complete**: 2025-10-25
**Status**: ✅ Legal & Ready for Production
