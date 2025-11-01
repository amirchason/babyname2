# 🔍 Browser Console Debugging Script for OAuth

Since automated browser testing isn't available, follow these steps to manually debug the OAuth error:

## Step 1: Open Production Site in Browser

1. Navigate to: **https://soulseedbaby.com**
2. Open browser Developer Tools:
   - **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox**: Press `F12` or `Ctrl+Shift+K`
   - **Safari**: Enable Developer Menu first, then `Cmd+Option+C`

## Step 2: Enable Verbose Logging

In the Console tab, paste and run this script:

```javascript
// Enhanced logging for OAuth debugging
(function() {
  console.log('🔍 OAuth Debug Mode Activated');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);

  // Check if Google OAuth client ID is loaded
  const clientId = document.querySelector('meta[name="google-signin-client_id"]')?.content;
  console.log('Google Client ID (meta tag):', clientId || 'NOT FOUND');

  // Check if React app env vars are exposed (they shouldn't be in production)
  console.log('Checking environment...');

  // Listen for all console messages
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  window.oauthDebugLogs = {
    logs: [],
    errors: [],
    warnings: []
  };

  console.log = function(...args) {
    window.oauthDebugLogs.logs.push(args.join(' '));
    originalLog.apply(console, args);
  };

  console.error = function(...args) {
    window.oauthDebugLogs.errors.push(args.join(' '));
    originalError.apply(console, args);
  };

  console.warn = function(...args) {
    window.oauthDebugLogs.warnings.push(args.join(' '));
    originalWarn.apply(console, args);
  };

  console.log('✅ Enhanced logging enabled');
  console.log('Now click the Login button and watch for [AUTH] logs');
})();
```

## Step 3: Attempt Login

1. Click the **Login** or **Sign in with Google** button
2. Watch the console for messages
3. Note any error messages that appear

## Step 4: Capture Error Details

After attempting login, run this in console:

```javascript
// Capture all OAuth-related logs
(function() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 OAUTH DEBUG REPORT');
  console.log('='.repeat(80) + '\n');

  // Show AUTH logs
  const authLogs = window.oauthDebugLogs.logs.filter(log => log.includes('[AUTH]'));
  console.log('AUTH LOGS (' + authLogs.length + '):');
  authLogs.forEach((log, i) => console.log(`${i+1}. ${log}`));

  // Show errors
  console.log('\nERRORS (' + window.oauthDebugLogs.errors.length + '):');
  window.oauthDebugLogs.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));

  // Check for OAuth iframe
  const oauthIframe = document.querySelector('iframe[src*="accounts.google.com"]');
  console.log('\nGoogle OAuth iframe:', oauthIframe ? 'FOUND' : 'NOT FOUND');

  if (oauthIframe) {
    console.log('iframe src:', oauthIframe.src);
  }

  // Check for error elements in DOM
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"], .toast, [role="alert"]');
  console.log('\nError elements in DOM:', errorElements.length);
  errorElements.forEach((el, i) => {
    const text = el.textContent.trim();
    if (text) console.log(`${i+1}. ${text}`);
  });

  // Check third-party cookies
  console.log('\nThird-party cookies enabled:', navigator.cookieEnabled);

  // Check localStorage
  console.log('\nLocalStorage keys:', Object.keys(localStorage).join(', '));

  // Export report
  const report = {
    url: window.location.href,
    origin: window.location.origin,
    authLogs: authLogs,
    errors: window.oauthDebugLogs.errors,
    warnings: window.oauthDebugLogs.warnings,
    hasOAuthIframe: !!oauthIframe,
    cookiesEnabled: navigator.cookieEnabled,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };

  console.log('\n📋 Report ready to copy:');
  console.log(JSON.stringify(report, null, 2));

  // Copy to clipboard
  navigator.clipboard.writeText(JSON.stringify(report, null, 2))
    .then(() => console.log('\n✅ Report copied to clipboard!'))
    .catch(() => console.log('\n⚠️ Could not copy to clipboard automatically'));

  return report;
})();
```

## Step 5: Common Error Patterns

Look for these specific error messages:

### Pattern 1: Origin Mismatch
```
Error: origin_mismatch
Error: redirect_uri_mismatch
```
**Fix**: Domain not properly authorized in Google Cloud Console

### Pattern 2: Popup Blocked
```
Error: popup_closed_by_user
Error: access_denied_popup_closed
```
**Fix**: Enable popups for soulseedbaby.com

### Pattern 3: Third-Party Cookies
```
Error: idpiframe_initialization_failed
Error: cookies_not_enabled
```
**Fix**: Enable third-party cookies in browser settings

### Pattern 4: Client ID Issues
```
Error: invalid_client
Error: unauthorized_client
```
**Fix**: Client ID mismatch or not configured properly

### Pattern 5: Network Errors
```
Error: network_error
Failed to fetch
```
**Fix**: Check if Google APIs are accessible, check ad blockers

## Step 6: Additional Checks

Run these individual checks:

### Check 1: Verify Client ID is Loaded
```javascript
// Should print the client ID
console.log('REACT_APP_GOOGLE_CLIENT_ID:',
  document.documentElement.innerHTML.match(/1093132372253-[a-z0-9]+\.apps\.googleusercontent\.com/)?.[0]
  || 'NOT FOUND IN PAGE SOURCE'
);
```

### Check 2: Check Google OAuth Library Loaded
```javascript
console.log('Google OAuth library loaded:',
  typeof window.google !== 'undefined' &&
  typeof window.google.accounts !== 'undefined'
);
```

### Check 3: Network Tab Analysis
1. Go to **Network** tab in DevTools
2. Filter by "google" or "oauth"
3. Attempt login again
4. Look for failed requests (red)
5. Click on failed request → Preview/Response tab
6. Copy error message

### Check 4: Check Redirect URI Being Used
```javascript
// Attempt to extract redirect_uri from OAuth request
// Watch Network tab for requests to accounts.google.com
// Look for redirect_uri parameter in query string
```

## Step 7: Report Your Findings

After running the debug scripts, provide:

1. **The JSON report** (copied to clipboard)
2. **Screenshot of console errors**
3. **Screenshot of Network tab showing failed OAuth request**
4. **Any error toast/modal that appeared on screen**

## Quick Fix Attempts

### Fix 1: Clear Cache and Cookies
```javascript
// Clear all site data
localStorage.clear();
sessionStorage.clear();
// Then hard refresh: Ctrl+Shift+R
```

### Fix 2: Try Incognito Mode
- Open production site in Incognito/Private mode
- This bypasses cache and some extensions
- If it works in incognito: likely a cache/cookie/extension issue

### Fix 3: Check Browser Compatibility
```javascript
console.log('Browser:', navigator.userAgent);
// Google OAuth requires modern browsers
// Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
```

## Expected Working Flow

If OAuth is working correctly, you should see:

```
[AUTH] ===== INITIATING GOOGLE LOGIN =====
[Network] GET https://accounts.google.com/gsi/client (200 OK)
[AUTH] ===== GOOGLE LOGIN SUCCESSFUL =====
[AUTH] Access token received
[AUTH] Fetching user info from Google...
[AUTH] User info received: your.email@example.com
[AUTH] Saving user data...
[AUTH] ===== LOGIN COMPLETE =====
✅ Toast: "Welcome back, YourName!"
```

## Need Help?

If you still can't identify the issue after running these scripts:

1. Save the console output
2. Take screenshots of errors
3. Export the Network tab as HAR file (right-click → Save all as HAR)
4. Share the debug report JSON
5. Provide exact error message from Google OAuth popup (if any)

---

**This script will help identify the EXACT issue with OAuth in production!**
