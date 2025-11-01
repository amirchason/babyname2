# 🔬 Detailed OAuth Error Analysis & Fixes

## Current Setup Analysis

### Library Version
- **@react-oauth/google**: `^0.12.2`
- **OAuth Flow**: Access token (implicit) - Popup mode
- **No redirect_uri needed** (popup closes after auth)

### What's Configured ✅
- ✅ Google Client ID in environment variables
- ✅ Firebase configuration
- ✅ Vercel environment variables
- ✅ No blocking headers in vercel.json
- ✅ Code implementation is correct

### Critical Distinction: JavaScript Origins vs Redirect URIs

**IMPORTANT**: For `useGoogleLogin` with popup mode (default), you need:

1. **Authorized JavaScript origins** ⭐ **MOST CRITICAL**
   - This is where the popup is INITIATED from
   - Must be EXACT match of your domain
   - Example: `https://soulseedbaby.com` (no trailing slash)

2. **Authorized redirect URIs** (less critical for popup mode)
   - These are used for redirect-based flows
   - Good to have but not always required for popups

## Hypothesis Testing Matrix

### Hypothesis #1: JavaScript Origins Not Configured Correctly ⭐ MOST LIKELY

**Symptoms:**
- Login button click → nothing happens
- Or: Popup appears briefly then closes
- Console error: `idpiframe_initialization_failed`
- Console error: `popup_failed_to_open`

**Check in Google Cloud Console:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select OAuth Client ID: `1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2`
3. Look at "Authorized JavaScript origins" section
4. Verify EXACT matches (case-sensitive, no trailing slash):

```
https://soulseedbaby.com
https://www.soulseedbaby.com
```

**Common Mistakes:**
- ❌ `https://soulseedbaby.com/` (trailing slash)
- ❌ `http://soulseedbaby.com` (http instead of https)
- ❌ `soulseedbaby.com` (missing protocol)
- ❌ Only added www version, missing non-www
- ❌ Only added non-www, missing www version

**Fix:**
Add BOTH versions without trailing slashes:
```
https://soulseedbaby.com
https://www.soulseedbaby.com
https://soulseed.baby
https://www.soulseed.baby
https://soulseedapp.com
https://www.soulseedapp.com
https://soulseedbaby.app
https://www.soulseedbaby.app
```

---

### Hypothesis #2: Third-Party Cookies Blocked

**Symptoms:**
- Console error: `cookies_not_enabled`
- Console error: `third_party_cookies_blocked`
- Works in Chrome, fails in Safari/Firefox with strict settings

**Check:**
1. Open browser settings
2. Look for "Cookies" or "Privacy" settings
3. Ensure third-party cookies are allowed (at least for Google)

**Browser-Specific:**
- **Chrome**: Settings → Privacy and security → Cookies → Allow all cookies
- **Safari**: Preferences → Privacy → Uncheck "Prevent cross-site tracking"
- **Firefox**: Settings → Privacy & Security → Standard (not Strict)

**Fix:**
- Enable third-party cookies globally, OR
- Add exception for `accounts.google.com`

---

### Hypothesis #3: Content Security Policy Blocking

**Symptoms:**
- Console error: `Refused to frame 'https://accounts.google.com'`
- Console error: `CSP frame-ancestors`

**Check:**
Inspect response headers for `Content-Security-Policy`:
```javascript
// Run in browser console
fetch(window.location.href)
  .then(r => r.headers.get('content-security-policy'))
  .then(console.log);
```

**Fix:**
If CSP is too restrictive, add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors 'self' https://accounts.google.com"
        }
      ]
    }
  ]
}
```

---

### Hypothesis #4: Vercel Environment Variables Not Applied

**Symptoms:**
- Console shows: `REACT_APP_GOOGLE_CLIENT_ID is not configured`
- Login button says "Google Client ID not configured"

**Check:**
```javascript
// Run in production browser console
console.log('Client ID exposed:',
  document.documentElement.innerHTML.includes('1093132372253')
);
```

**Fix:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Verify `REACT_APP_GOOGLE_CLIENT_ID` exists
3. Set for: Production, Preview, Development
4. Redeploy: `npm run deploy`

---

### Hypothesis #5: Firebase Domain Not Authorized

**Symptoms:**
- OAuth works, but Firebase sync fails
- Console error after login success
- Error: `auth/unauthorized-domain`

**Check:**
Firebase Console → Authentication → Settings → Authorized domains

**Fix:**
Add all domains:
```
soulseedbaby.com
www.soulseedbaby.com
soulseed.baby
soulseedapp.com
soulseedbaby.app
```

---

### Hypothesis #6: Ad Blocker or Browser Extension

**Symptoms:**
- Works in Incognito mode
- Fails in normal browsing mode
- Network tab shows blocked requests to `accounts.google.com`

**Check:**
1. Disable all browser extensions
2. Try again
3. If it works → extension conflict

**Common Culprits:**
- AdBlock Plus
- uBlock Origin
- Privacy Badger
- Ghostery

**Fix:**
- Disable ad blocker for soulseedbaby.com
- Or add exception for Google OAuth domains

---

### Hypothesis #7: Mixed Content (HTTP/HTTPS)

**Symptoms:**
- Browser blocks "insecure content"
- Console warning: `Mixed Content`

**Check:**
All resources must be HTTPS in production:
```javascript
// Check for HTTP resources
[...document.querySelectorAll('[src], [href]')]
  .map(el => el.src || el.href)
  .filter(url => url.startsWith('http://'))
```

**Fix:**
Ensure all assets use HTTPS or protocol-relative URLs (`//`)

---

### Hypothesis #8: Google OAuth Service Outage

**Symptoms:**
- Worked yesterday, broke today
- Error: `Service temporarily unavailable`

**Check:**
https://status.cloud.google.com/

**Fix:**
Wait for Google to restore service (rare)

---

## Step-by-Step Debugging Process

### Phase 1: Pre-Flight Checks (Before Login Attempt)

Run in browser console on https://soulseedbaby.com:

```javascript
// 1. Check current origin
console.log('Origin:', window.location.origin);
// Expected: https://soulseedbaby.com or https://www.soulseedbaby.com

// 2. Check if client ID is embedded in page
const hasClientId = document.documentElement.innerHTML.includes('1093132372253');
console.log('Client ID in page:', hasClientId);
// Expected: true

// 3. Check for Google OAuth library
console.log('Google library loaded:', typeof window.google !== 'undefined');
// Expected: true (may be false until user interaction)

// 4. Check cookies enabled
console.log('Cookies enabled:', navigator.cookieEnabled);
// Expected: true

// 5. Check for CSP issues
fetch(window.location.href)
  .then(r => {
    const csp = r.headers.get('content-security-policy');
    console.log('CSP Header:', csp || 'NOT SET');
  });
```

### Phase 2: Login Attempt Monitoring

1. Open Network tab in DevTools
2. Filter by: `google` or `accounts.google.com`
3. Click Login button
4. Watch for requests

**Expected Requests:**
```
GET https://accounts.google.com/gsi/client (200 OK)
GET https://accounts.google.com/gsi/style (200 OK)
POST https://accounts.google.com/o/oauth2/iframerpc (200 OK)
```

**If you see 400/401/403:**
- Click on the failed request
- Go to "Response" or "Preview" tab
- Copy the error JSON

### Phase 3: Error Capture

After clicking login, run:

```javascript
// Wait 3 seconds after clicking login, then run:
setTimeout(() => {
  // Check for OAuth iframe
  const iframe = document.querySelector('iframe[src*="accounts.google.com"]');
  console.log('OAuth iframe present:', !!iframe);

  // Check for error elements
  const errors = [...document.querySelectorAll('[class*="error"], [role="alert"]')]
    .map(el => el.textContent.trim())
    .filter(Boolean);
  console.log('Error messages:', errors);

  // Check localStorage for auth state
  console.log('Auth token:', localStorage.getItem('google_access_token') ? 'EXISTS' : 'MISSING');
}, 3000);
```

---

## Recommended Fixes (In Priority Order)

### Fix #1: Verify JavaScript Origins (DO THIS FIRST!) ⭐

1. Google Cloud Console → APIs & Credentials
2. OAuth 2.0 Client ID → Edit
3. "Authorized JavaScript origins" section
4. Add BOTH www and non-www (no trailing slash!):
   ```
   https://soulseedbaby.com
   https://www.soulseedbaby.com
   ```
5. Click SAVE
6. **Wait 10 minutes** for propagation
7. Clear browser cache: `Ctrl+Shift+Delete`
8. Test in Incognito mode

### Fix #2: Enable Third-Party Cookies

Browser Settings → Privacy → Allow third-party cookies (at least for Google)

### Fix #3: Disable Ad Blockers

Temporarily disable all extensions, test login

### Fix #4: Check Firebase Domains

Firebase Console → Authentication → Settings → Authorized domains → Add all production domains

### Fix #5: Force Rebuild on Vercel

```bash
# In project directory
git commit --allow-empty -m "Force rebuild for OAuth fix"
git push origin master
# This triggers fresh Vercel deployment
```

---

## Ultimate Test: Minimal OAuth Test Page

Create a minimal HTML test page to isolate the issue:

```html
<!DOCTYPE html>
<html>
<head>
  <title>OAuth Test</title>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
  <h1>Minimal OAuth Test</h1>
  <div id="g_id_onload"
       data-client_id="1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com"
       data-callback="handleCredentialResponse">
  </div>
  <div class="g_id_signin" data-type="standard"></div>

  <script>
    function handleCredentialResponse(response) {
      console.log("SUCCESS! Token:", response.credential);
      alert("OAuth works! Token received.");
    }
  </script>
</body>
</html>
```

Upload this to your Vercel:
1. Create `public/oauth-test.html`
2. Deploy
3. Visit: `https://soulseedbaby.com/oauth-test.html`
4. If this works → issue is in React app
5. If this fails → issue is in Google Console configuration

---

## What To Share If Still Broken

1. **Browser console screenshot** (after clicking login)
2. **Network tab HAR file** (Export as HAR with sensitive data)
3. **Exact error message** from Google popup (if any)
4. **Screenshot of Google Cloud Console** showing Authorized JavaScript origins
5. **Screenshot of Firebase Authorized domains**
6. **Output of Pre-Flight Checks** (Phase 1 script above)

---

## Expected Timeline

- **Immediate** (0-2 min): Test in Incognito with ad blockers disabled
- **Short** (10-15 min): If Google Console changes needed, wait for propagation
- **Medium** (30 min): If Vercel rebuild needed
- **Long** (1 hour+): If complex CSP/cookie policy issues

**Most likely fix**: JavaScript Origins configuration (#1) - 95% of cases!
