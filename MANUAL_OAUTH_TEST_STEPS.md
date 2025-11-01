# Manual OAuth Testing Steps (Phase 1)

## Test Current Broken State

### Step 1: Open Production Site
1. Open browser (Chrome recommended)
2. Open DevTools: `F12` or `Ctrl+Shift+I`
3. Go to **Console** tab
4. Visit: https://soulseedbaby.com

### Step 2: Attempt Login
1. Click "Login with Google" button
2. **Watch what happens**:
   - ❌ **If broken**: No popup appears, immediate error toast
   - ✅ **If working**: Google popup should open

### Step 3: Check Console Errors
Look for these error messages in console:

**Expected Error (if broken)**:
```
[AUTH] ===== INITIATING GOOGLE LOGIN =====
Error: origin_mismatch
OR
Error: idpiframe_initialization_failed
OR
[AUTH] Login failed: {nonOAuthError: true}
```

**Screenshot the console output!**

### Step 4: Check Network Tab
1. Go to **Network** tab in DevTools
2. Filter: `gsi`
3. Look for requests to `accounts.google.com/gsi/`
4. Check if any return errors

### What This Proves
- **No popup** = Authorized JavaScript Origins missing (our hypothesis)
- **Console shows origin_mismatch** = Confirms missing domains
- **idpiframe_initialization_failed** = Google can't initialize on this origin

## Save This Evidence
Take screenshots of:
1. The error toast message
2. Console errors
3. Network tab showing failed requests

Then proceed to Phase 2 (run the fix script).
