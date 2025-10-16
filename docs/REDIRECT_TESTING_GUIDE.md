# 🧪 301 Redirect Testing Guide - SoulSeed

**Date**: 2025-10-16
**Deployment**: https://soulseed-8y4qx72or-ss-9666de73.vercel.app
**Primary Domain**: soulseedbaby.com

---

## 📋 Quick Testing Checklist

Once your domains are fully configured in Vercel and DNS has propagated, test the following:

### ✅ Redirects to Test

- [ ] `https://soulseed.baby` → `https://soulseedbaby.com` (301)
- [ ] `https://soulseed.baby/names` → `https://soulseedbaby.com/names` (301)
- [ ] `https://soulseedapp.com` → `https://soulseedbaby.com` (301)
- [ ] `https://soulseedapp.com/swipe` → `https://soulseedbaby.com/swipe` (301)
- [ ] `https://www.soulseedbaby.com` → `https://soulseedbaby.com` (301)
- [ ] `https://soulseedbaby.com` → Loads correctly (200)
- [ ] `https://soulseedbaby.com/sitemap.xml` → XML file (200)
- [ ] `https://soulseedbaby.com/robots.txt` → Text file (200)

---

## 🔍 Testing Methods

### Method 1: Browser Testing (Quick Visual Check)

**Steps**:
1. Open browser (Chrome/Firefox/Safari)
2. Type `https://soulseed.baby` in address bar
3. Press Enter
4. **Expected**: Browser redirects to `https://soulseedbaby.com`
5. **Check**: URL bar shows `soulseedbaby.com`

**Test all domains**:
- `https://soulseed.baby` → Should redirect
- `https://soulseedapp.com` → Should redirect
- `https://www.soulseedbaby.com` → Should redirect
- `https://soulseedbaby.com` → Should load (NOT redirect)

---

### Method 2: Chrome DevTools (Verify 301 Status)

**Steps**:
1. Open Chrome
2. Press `F12` (opens DevTools)
3. Click **Network** tab
4. Check "Preserve log" checkbox
5. Type `https://soulseed.baby` in address bar
6. Press Enter
7. Look for first request in Network tab

**Expected Result**:
```
Status Code: 301 Moved Permanently
Location: https://soulseedbaby.com/
```

**NOT 302**: If you see 302, it's temporary redirect (wrong!)

---

### Method 3: Online Tools (No Browser Needed)

#### Option A: HTTP Status Code Checker
**URL**: https://httpstatus.io/

**Steps**:
1. Go to httpstatus.io
2. Enter: `https://soulseed.baby`
3. Click "Check Status"

**Expected**:
```
HTTP/1.1 301 Moved Permanently
Location: https://soulseedbaby.com/
```

#### Option B: Redirect Checker
**URL**: https://www.redirect-checker.org/

**Steps**:
1. Go to redirect-checker.org
2. Enter: `https://soulseed.baby`
3. Click "Check Redirect"

**Expected**:
- Status: 301
- Redirect URL: https://soulseedbaby.com/
- Final destination: https://soulseedbaby.com/ (200 OK)

---

### Method 4: Command Line (curl)

**For Terminal Users**:

```bash
# Test soulseed.baby redirect
curl -I https://soulseed.baby

# Expected output:
HTTP/2 301
location: https://soulseedbaby.com/

# Test soulseedapp.com redirect
curl -I https://soulseedapp.com

# Expected output:
HTTP/2 301
location: https://soulseedbaby.com/

# Test www redirect
curl -I https://www.soulseedbaby.com

# Expected output:
HTTP/2 301
location: https://soulseedbaby.com/

# Test primary domain (should NOT redirect)
curl -I https://soulseedbaby.com

# Expected output:
HTTP/2 200
content-type: text/html
```

**What to Look For**:
- ✅ Status code: `301` (NOT 302)
- ✅ `location:` header points to soulseedbaby.com
- ✅ Primary domain returns `200` (NOT 301)

---

## 🚨 Common Issues & Fixes

### Issue 1: DNS Not Propagated Yet
**Symptom**: Domain doesn't resolve / "Site can't be reached"

**Fix**:
- Wait 24-48 hours for DNS propagation
- Check DNS status: https://www.whatsmydns.net/
- Enter your domain and check A/CNAME records globally

**Check if ready**:
```bash
# Check DNS for soulseed.baby
dig soulseed.baby

# Should show CNAME or A record pointing to Vercel
```

---

### Issue 2: Getting 404 Instead of 301
**Symptom**: Domain loads but shows 404 page

**Possible Causes**:
- Domain not added to Vercel project
- vercel.json not deployed correctly

**Fix**:
1. Verify domain is added in Vercel Dashboard → Settings → Domains
2. Check deployment includes updated vercel.json
3. Redeploy if needed: `vercel --prod`

---

### Issue 3: Redirect Works But Shows 302 (Temporary)
**Symptom**: Redirect happens but status is 302 instead of 301

**Fix**:
- Check vercel.json has `"permanent": true`
- Redeploy if needed
- Clear browser cache: Ctrl+Shift+Delete

---

### Issue 4: www.soulseedbaby.com Doesn't Redirect
**Symptom**: www subdomain doesn't redirect to non-www

**Fix**:
- Add www.soulseedbaby.com to Vercel Domains
- Verify redirect rule in vercel.json includes www
- Wait for DNS propagation

---

### Issue 5: Redirect Loop (Infinite Redirects)
**Symptom**: Browser shows "Too many redirects" error

**Fix**:
- Check vercel.json doesn't have conflicting rules
- Ensure redirect destination is NOT also redirecting
- Clear browser cache and cookies

---

## ✅ Success Criteria

Your redirects are working correctly if:

1. **All secondary domains redirect**:
   - ✅ soulseed.baby → soulseedbaby.com (301)
   - ✅ soulseedapp.com → soulseedbaby.com (301)
   - ✅ www.soulseedbaby.com → soulseedbaby.com (301)

2. **Status codes are correct**:
   - ✅ All redirects return 301 (NOT 302)
   - ✅ Primary domain returns 200

3. **HTTPS everywhere**:
   - ✅ All domains force HTTPS
   - ✅ No mixed content warnings

4. **Paths preserved**:
   - ✅ soulseed.baby/names → soulseedbaby.com/names
   - ✅ soulseedapp.com/swipe → soulseedbaby.com/swipe

5. **Static files accessible**:
   - ✅ /sitemap.xml returns XML (200)
   - ✅ /robots.txt returns text (200)

---

## 📊 Monitoring After Going Live

### Week 1-2: Watch for Issues

**Google Search Console**:
1. Go to https://search.google.com/search-console
2. Add soulseedbaby.com as new property
3. Verify ownership (HTML tag method)
4. Submit sitemap: `https://soulseedbaby.com/sitemap.xml`

**Monitor**:
- Coverage report (indexed pages)
- URL inspection tool (check redirects)
- Performance report (clicks/impressions)

**Expected**:
- Old domain pages gradually removed from index
- New domain pages added over 2-4 weeks
- Temporary traffic dip (5-10%) in first 2 weeks

---

### Vercel Analytics (If Enabled)

**Check**:
- All traffic arriving at soulseedbaby.com (not split)
- No 404 errors for redirected domains
- Page load speed remains fast

---

## 🔧 Troubleshooting Commands

```bash
# Check if domain resolves
ping soulseed.baby

# Check DNS records
nslookup soulseed.baby

# Check HTTPS certificate
openssl s_client -connect soulseed.baby:443 -servername soulseed.baby

# Test redirect with full headers
curl -v https://soulseed.baby

# Follow redirect chain
curl -L -v https://soulseed.baby
```

---

## 📞 When Everything Is Working

Once all tests pass:

1. **Update Google Search Console**:
   - Add soulseedbaby.com property
   - Submit updated sitemap
   - Set preferred domain (non-www)

2. **Update Social Media**:
   - Facebook: Update page URL
   - Twitter: Update profile URL
   - Instagram: Update bio link
   - LinkedIn: Update company page

3. **Update Marketing Materials**:
   - Email signatures
   - Business cards (if any)
   - Partner websites
   - Directory listings

4. **Test Social Sharing**:
   - Facebook Debugger: https://developers.facebook.com/tools/debug/
   - Twitter Card Validator: https://cards-dev.twitter.com/validator
   - LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

---

## 🎯 Next Steps After Redirects Work

Once redirects are confirmed working:

1. **Monitor traffic for 2 weeks** (expect temporary dip)
2. **Track keyword rankings** (should stabilize in 3-4 weeks)
3. **Proceed with Phase 1 SEO fixes**:
   - Install react-snap for prerendering
   - Add meta description tag
   - Create og-image.png
   - Add image alt tags

---

## 📝 Testing Notes Template

Use this to document your testing:

```
# Redirect Testing - [Date]

## Test 1: soulseed.baby
- Tested at: [Time]
- Method: [Browser/curl/Tool]
- Status Code: [301/302/other]
- Redirects to: [URL]
- ✅ PASS / ❌ FAIL

## Test 2: soulseedapp.com
- Tested at: [Time]
- Method: [Browser/curl/Tool]
- Status Code: [301/302/other]
- Redirects to: [URL]
- ✅ PASS / ❌ FAIL

## Test 3: www.soulseedbaby.com
- Tested at: [Time]
- Method: [Browser/curl/Tool]
- Status Code: [301/302/other]
- Redirects to: [URL]
- ✅ PASS / ❌ FAIL

## Test 4: Primary Domain (soulseedbaby.com)
- Tested at: [Time]
- Method: [Browser/curl/Tool]
- Status Code: [200/other]
- Page loads: ✅ YES / ❌ NO
- ✅ PASS / ❌ FAIL

## Issues Found:
[List any problems]

## Resolution:
[How you fixed them]
```

---

**Last Updated**: 2025-10-16
**Deployment URL**: https://soulseed-8y4qx72or-ss-9666de73.vercel.app
**Status**: ⏳ Awaiting DNS propagation and testing
