# Google OAuth Domain Authorization Fix

## The Problem
All OAuth authentication methods are failing with "login error try again" because the **Google Cloud Console OAuth client is NOT configured for the production domains**.

## Root Cause
Client ID: `1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com`

This OAuth client is likely only authorized for:
- ✅ `http://localhost:3000` (development)
- ❌ `https://soulseedbaby.com` (production) - **MISSING!**

When a user tries to authenticate from an unauthorized domain, Google Identity Services returns a `nonOAuthError` immediately, before even showing the login popup.

## The Fix

### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select project: `babynames-app-9fa2a`

### Step 2: Edit OAuth 2.0 Client
1. Find OAuth client: `1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2`
2. Click to edit

### Step 3: Add Authorized JavaScript Origins
Add these domains (INCLUDING www. variants):
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

**⚠️ IMPORTANT**: Add BOTH www and non-www versions! OAuth checks exact match.

### Step 4: Add Authorized Redirect URIs
Add the SAME domains as redirect URIs:
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

**Optional - For Vercel Preview Deployments**:
```
https://*.vercel.app
```
(Only if you want OAuth on preview URLs)

### Step 5: Save and Wait
- Click **SAVE**
- Changes take **5-10 minutes** to propagate globally
- Clear browser cache after 10 minutes
- Test authentication

## Why This Fixes It

Google Identity Services performs **origin validation** before allowing OAuth:

1. User clicks "Login with Google"
2. Browser sends request from `https://soulseedbaby.com`
3. Google checks: "Is this origin authorized for client ID xyz?"
4. If NO: Returns `nonOAuthError` immediately
5. If YES: Shows Google login popup

**ALL THREE AUTH METHODS FAILED FOR THE SAME REASON**: Unauthorized origin!

## Verification

After adding domains, test with browser console:
```javascript
console.log('Current origin:', window.location.origin);
// Should be: https://soulseedbaby.com
```

If authentication still fails after 10 minutes:
1. Check if domains were saved correctly in Google Cloud Console
2. Verify client ID matches in .env: `REACT_APP_GOOGLE_CLIENT_ID`
3. Clear browser cache and cookies
4. Try incognito mode

## Firebase Authorized Domains (ALSO REQUIRED!)

Since you're using Firebase for data sync, you ALSO need to authorize domains there:

1. Go to: https://console.firebase.google.com/project/babynames-app-9fa2a/authentication/settings
2. Scroll to **Authorized domains** section
3. Add all production domains:
   ```
   soulseedbaby.com
   soulseed.baby
   soulseedapp.com
   soulseedbaby.app
   ```
4. Click **Add domain** for each
5. Save changes

## Debugging After Fix

If authentication still fails after configuring domains, check browser console for these logs:

### Success Flow:
```
[AUTH] ===== INITIATING GOOGLE LOGIN =====
[AUTH] ===== GOOGLE LOGIN SUCCESSFUL =====
[AUTH] Access token received
[AUTH] Fetching user info from Google...
[AUTH] User info received: user@example.com
[AUTH] Saving user data...
[AUTH] ===== LOGIN COMPLETE =====
```

### Error Flow:
```
[AUTH] ===== OAUTH ERROR =====
[AUTH] Error type: object
[AUTH] Error details: {...}
```

**Common Error Codes**:
- `idpiframe_initialization_failed`: Origin not authorized
- `popup_closed_by_user`: User closed popup
- `access_denied`: User denied permission

## Environment Variable Verification

### Verify Vercel has correct env vars:
1. Go to: https://vercel.com/dashboard
2. Select project: `soulseedbaby`
3. Settings → Environment Variables
4. Verify `REACT_APP_GOOGLE_CLIENT_ID` is set to:
   ```
   1093132372253-a725n8gpe624usli0hnj3re1eicgi4o2.apps.googleusercontent.com
   ```

### Verify in browser console:
Open production site, run:
```javascript
console.log('Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
// Should NOT be undefined
```

If undefined: Rebuild and redeploy with `npm run deploy`

## Alternative: Create New OAuth Client for Production

If the existing client can't be modified:

1. Create NEW OAuth 2.0 Client ID in Google Cloud Console
2. Configure with production domains from the start
3. Update `.env` with new `REACT_APP_GOOGLE_CLIENT_ID`
4. Update `vercel.json` env section
5. Push to GitHub to trigger Vercel rebuild
6. Test after deployment

## Quick Test Script

After configuring domains, test OAuth manually in browser console:

```javascript
// Test 1: Check origin
console.log('Current origin:', window.location.origin);
// Should be: https://soulseedbaby.com (or one of your domains)

// Test 2: Check Google client ID loaded
console.log('Has Google OAuth:', typeof useGoogleLogin !== 'undefined');

// Test 3: Try login and watch console
// Click login button and check for [AUTH] logs
```

---

**Status**: Awaiting Google Cloud Console configuration update
**Checklist**:
- [ ] Add domains to Google OAuth Client (JavaScript Origins)
- [ ] Add domains to Google OAuth Client (Redirect URIs)
- [ ] Add domains to Firebase Authorized Domains
- [ ] Wait 10 minutes for propagation
- [ ] Clear browser cache
- [ ] Test login on https://soulseedbaby.com
- [ ] Test login on https://www.soulseedbaby.com

**Expected Fix Time**: 10 minutes after domains are added + cache clear
