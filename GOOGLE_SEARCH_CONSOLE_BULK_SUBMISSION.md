# 🚨 URGENT: DELETE URI #7 NOW (Mobile Guide)

## Step-by-Step (Mobile Browser)

### 1. Open Google Cloud Console
**URL:** https://console.cloud.google.com/apis/credentials?project=babynames-app-9fa2a

**Tip:** If page looks cramped, tap **"Desktop site"** in your browser menu (Chrome: ⋮ menu → Desktop site)

### 2. Find Your OAuth Client
- Look for: **"Web client 1"** or similar name
- Or search for: `1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2`
- **Tap the pencil icon** ✏️ or tap the name to edit

### 3. Scroll to "Authorized redirect URIs"
- Scroll down past "Authorized JavaScript origins"
- Find section: **"Authorized redirect URIs"**
- You should see 15 URIs listed

### 4. Find URI #7
**Look for exactly:**
```
https://www.soulseedbaby.com/auth/callback
```

It should be around the 7th position in the list.

### 5. Delete It
- Tap the **[X]** or **[Delete]** button next to that URI
- **DO NOT delete the other URIs!** Only delete this one:
  - ❌ DELETE: `https://www.soulseedbaby.com/auth/callback`
  - ✅ KEEP: `https://www.soulseedbaby.com` (without /auth/callback)

### 6. SAVE
- Scroll to the bottom
- Tap **"SAVE"** button
- Wait for confirmation message

### 7. Wait 5 Minutes
Google needs time to propagate changes globally.

**Set a timer for 5 minutes!**

### 8. Test Again
After 5 minutes:
1. Go to https://soulseedbaby.com
2. **Hard refresh:** Pull down to refresh (mobile) or Ctrl+Shift+R (desktop)
3. Click "Sign in with Google"
4. Check Debug Overlay logs

## 🎯 Expected Outcome

**After 5 minutes, you should see:**
```
🎉 [AUTH DEBUG] ===== ON SUCCESS CALLBACK TRIGGERED! =====
[AUTH DEBUG] Using authorization code flow
[AUTH DEBUG] Auth code received: YES
[AUTH DEBUG] ===== LOGIN SUCCESSFUL =====
```

## 🆘 Can't Find URI #7?

**Option A:** Search the page (Ctrl+F or browser find)
- Search for: `auth/callback`
- Should highlight the URI to delete

**Option B:** Count manually
- Scroll to "Authorized redirect URIs"
- Count down to the 7th URI
- Look for one ending in `/auth/callback`

**Option C:** Screenshot and send
If you can't find it, take a screenshot of the "Authorized redirect URIs" section and send it to me.

## Why This Fixes It

The `/auth/callback` path is a **phantom redirect** that:
1. Google tries to use it first (before the base URL)
2. But your app doesn't handle `/auth/callback` route
3. So the popup closes before returning the auth code
4. Result: "Popup window closed" error

**After deleting:** Google uses the base URL instead → Login works! ✅

---

**Current Status:**
- ✅ Code deployed with auth-code flow
- ✅ Enhanced error logging working
- 🚨 **YOU NEED TO: Delete URI #7 + wait 5 mins**
- 🧪 Then test again

**Quick link:**
https://console.cloud.google.com/apis/credentials?project=babynames-app-9fa2a
