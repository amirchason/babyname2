# 🚀 Add Production URLs to Google Cloud Console

## 📱 MOBILE INSTRUCTIONS (EASY MODE)

### Step 1: Open Google Cloud Console
**URL:** https://console.cloud.google.com/apis/credentials

**Enable Desktop Mode first!** (Chrome: ⋮ menu → Desktop site)

---

### Step 2: Find Your OAuth Client
Look for a row that says:
```
Web client (auto created by Google Service)
or
OAuth 2.0 Client ID
```

**Client ID ends in:** `...eicgi4o2.apps.googleusercontent.com`

**Tap the PENCIL icon (✏️) to edit**

---

### Step 3: Add to "Authorized JavaScript origins"

Scroll down to section: **Authorized JavaScript origins**

**Tap "+ ADD URI" button**

**Copy-paste these 3 URLs (one at a time):**

```
https://soulseedbaby.com
```
Tap "Add URI" again:
```
https://www.soulseedbaby.com
```
Tap "Add URI" again:
```
https://babyname2-votingsystem.vercel.app
```

**Result: You should now have 4 URLs total:**
- http://localhost:3000 (already there)
- https://soulseedbaby.com (NEW)
- https://www.soulseedbaby.com (NEW)
- https://babyname2-votingsystem.vercel.app (NEW)

---

### Step 4: Add to "Authorized redirect URIs"

**SCROLL DOWN** to section: **Authorized redirect URIs**

**Tap "+ ADD URI" button**

**Copy-paste the SAME 3 URLs again:**

```
https://soulseedbaby.com
```
Tap "Add URI" again:
```
https://www.soulseedbaby.com
```
Tap "Add URI" again:
```
https://babyname2-votingsystem.vercel.app
```

**Result: You should now have 4 URLs total here too:**
- http://localhost:3000 (already there)
- https://soulseedbaby.com (NEW)
- https://www.soulseedbaby.com (NEW)
- https://babyname2-votingsystem.vercel.app (NEW)

---

### Step 5: SAVE (CRITICAL!)

**Scroll to bottom of page**

**Tap the blue "SAVE" button**

**Wait for confirmation message** ("OAuth client updated" or similar)

---

## ✅ Verification

After saving, you should see:

**Authorized JavaScript origins (4 total):**
```
http://localhost:3000
https://soulseedbaby.com
https://www.soulseedbaby.com
https://babyname2-votingsystem.vercel.app
```

**Authorized redirect URIs (4 total):**
```
http://localhost:3000
https://soulseedbaby.com
https://www.soulseedbaby.com
https://babyname2-votingsystem.vercel.app
```

---

## 🚨 IMPORTANT NOTES

✅ **Include `https://`** - Don't just add `soulseedbaby.com`
✅ **Add to BOTH sections** - JavaScript origins AND redirect URIs
✅ **Click SAVE at the end** - Changes won't apply until you save!
✅ **Wait 1-2 minutes** - Google needs time to process the changes

---

## 📞 Tell me when you're done!

Type: "added" when you've added all 3 URLs and clicked SAVE
