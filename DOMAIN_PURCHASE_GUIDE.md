# 🌐 Domain Purchase Quick Guide

**Quick reference for buying and setting up your custom domain**

---

## Best Domain Registrars (2025)

### 🥇 Recommended: Namecheap
**Why**: Cheapest reliable option, great support, free WHOIS privacy

- **Price**: $8-13/year (.com)
- **Website**: https://www.namecheap.com
- **Pros**:
  - Best value for money
  - Free privacy protection (hides your contact info)
  - Easy DNS management
  - 24/7 support
  - Works perfectly with Vercel

**How to Buy**:
1. Go to namecheap.com
2. Search: "soulseed" (or your preferred name)
3. Select: Click "Add to Cart" on your preferred extension (.com, .app, etc.)
4. Checkout:
   - Enable "WhoisGuard" (FREE - IMPORTANT for privacy)
   - Enable auto-renew (recommended)
   - Skip hosting/email offers
5. Pay: $8-15 total
6. Verify email: Check inbox for verification link
7. Done!

---

### 🥈 Alternative: Vercel Domains
**Why**: Easiest setup (zero-config DNS)

- **Price**: $15/year (.com), $20/year (.io)
- **Website**: Buy through Vercel Dashboard
- **Pros**:
  - Automatic DNS configuration
  - Instant SSL certificate
  - No manual setup needed
  - Managed in same dashboard as app
- **Cons**:
  - Slightly more expensive
  - Locked to Vercel

**How to Buy**:
1. Deploy app to Vercel first
2. Go to Vercel Dashboard → Domains tab
3. Click "Register Domain"
4. Search your domain name
5. Complete purchase (~$15/year)
6. Done! Auto-connects to your app ✅

---

### 🥉 Budget Option: Cloudflare Registrar
**Why**: Cheapest (at-cost pricing)

- **Price**: $9.77/year (.com) - exact wholesale price
- **Website**: https://www.cloudflare.com/products/registrar/
- **Pros**:
  - Cheapest option (no markup)
  - Free WHOIS privacy
  - Built-in CDN and security
  - Great DNS management
- **Cons**:
  - Requires Cloudflare account first
  - Slightly more complex setup

**How to Buy**:
1. Sign up for free Cloudflare account
2. Go to Domain Registration
3. Search domain name
4. Complete purchase
5. Configure DNS (see below)

---

## Domain Name Ideas for SoulSeed

### Premium Choices (.com is best!)
- ✅ `soulseed.com` - Best choice (check first!)
- ✅ `soulseedapp.com` - Great backup
- ✅ `soulseed.app` - Modern, perfect for apps

### Creative Alternatives
- `soulseed.io` - Tech-friendly
- `soulseed.baby` - Perfect match!
- `getsoulseed.com` - Startup style
- `mysoulseed.com` - Personal touch
- `soulseednames.com` - Descriptive
- `find-soulseed.com` - Action-oriented

### Budget Options (if .com is expensive)
- `soulseed.co` - Shorter than .com
- `soulseed.xyz` - Modern, cheap ($1-5/year)
- `soulseed.online` - Affordable

---

## How to Check Availability

### Method 1: Quick Check (Free)
1. Go to: https://tld-list.com
2. Enter: "soulseed"
3. See all available extensions

### Method 2: Bulk Check
Go to any registrar and search - they'll show all options:
- https://www.namecheap.com/domains/domain-name-search/
- https://domains.google.com
- https://www.cloudflare.com/products/registrar/

### Method 3: Command Line (if you have whois)
```bash
whois soulseed.com
# If available, you'll see "No match for domain"
```

---

## DNS Setup After Purchase

### If You Bought from Namecheap/Cloudflare:

#### Step 1: Get DNS Records from Vercel
```bash
vercel domains add soulseed.com
```

Vercel will show:
```
Add these DNS records to your domain:

Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

#### Step 2: Add to Namecheap
1. Login to Namecheap
2. Domain List → Click "Manage"
3. Advanced DNS tab
4. Add Record:
   - **Type**: A Record
   - **Host**: @
   - **Value**: 76.76.21.21
   - **TTL**: Automatic
5. Add Record:
   - **Type**: CNAME Record
   - **Host**: www
   - **Value**: cname.vercel-dns.com
   - **TTL**: Automatic
6. Save Changes
7. Wait 5-60 minutes

#### Step 3: Verify
```bash
# Check DNS propagation
dig soulseed.com
# Should show: 76.76.21.21

# Verify in Vercel
vercel domains verify soulseed.com
# Should show: ✅ Domain verified
```

### If You Bought from Vercel:
**No setup needed!** ✅ Domain automatically connects.

---

## After Domain is Connected

### 1. Update Google OAuth
**IMPORTANT**: Add new domain to OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Add Authorized Redirect URIs:
   ```
   https://soulseed.com
   https://soulseed.com/auth/callback
   https://www.soulseed.com
   https://www.soulseed.com/auth/callback
   ```
4. Save

### 2. Update Firebase
**IMPORTANT**: Authorize domain in Firebase

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Authentication → Settings → Authorized domains
4. Add domain:
   ```
   soulseed.com
   www.soulseed.com
   ```

### 3. Update Environment Variable
```bash
vercel env add REACT_APP_OAUTH_REDIRECT_URI_PROD production
# Enter: https://soulseed.com
```

### 4. Test Everything
- [ ] Visit https://soulseed.com
- [ ] Test Google login
- [ ] Test Firebase sync
- [ ] Test all features

---

## Domain Extension Recommendations

### Best for SoulSeed:

| Extension | Price/Year | Best For | Pros |
|-----------|-----------|----------|------|
| `.com` | $9-13 | Everyone | Most trusted, universal |
| `.app` | $15-20 | Apps | Modern, secure (requires HTTPS) |
| `.baby` | $20-40 | Baby products | Perfect match for niche |
| `.io` | $30-50 | Tech | Developer-friendly |
| `.co` | $10-20 | Startups | Short, memorable |

### Avoid:
- ❌ `.biz` - Looks spammy
- ❌ `.info` - Low trust
- ❌ `.tk`, `.ga` - Free but blocked by many services

**Recommendation**: Go with `.com` if available, otherwise `.app` or `.baby`

---

## Pricing Breakdown

### Total First Year Cost:

**Option A: Namecheap + Vercel**
- Domain: $9-13 (.com)
- Vercel: $0 (free tier)
- SSL: $0 (included)
- **Total: $9-13/year**

**Option B: Vercel Domains**
- Domain: $15 (.com)
- Vercel: $0 (free tier)
- SSL: $0 (included)
- **Total: $15/year**

**Option C: Cloudflare + Vercel**
- Domain: $9.77 (.com)
- Vercel: $0 (free tier)
- SSL: $0 (included)
- **Total: $9.77/year**

### Renewal Costs:
- Same as first year (if auto-renew enabled)
- Namecheap: May increase by $1-2 after first year
- Vercel: Same price
- Cloudflare: Always at-cost (never increases)

---

## Quick Decision Guide

### Choose Vercel Domains if:
- ✅ You want easiest setup (zero-config)
- ✅ You don't mind paying $5 extra/year
- ✅ You want everything in one dashboard

### Choose Namecheap if:
- ✅ You want best value ($8-13/year)
- ✅ You're comfortable with DNS setup (5 min)
- ✅ You want portability (can move to any host)

### Choose Cloudflare if:
- ✅ You want absolute cheapest ($9.77/year)
- ✅ You already use Cloudflare
- ✅ You want advanced DNS/CDN features

**My Recommendation**:
- **First-timer?** → Vercel Domains (easiest)
- **Budget-conscious?** → Namecheap (best value)
- **Power user?** → Cloudflare (most control)

---

## Common Issues

### Issue: Domain already taken
**Solutions**:
1. Try different extension (.app, .baby, .co)
2. Add word: getsoulseed.com, mysoulseed.com
3. Use hyphen: soul-seed.com (not recommended)
4. Get creative: soulseedapp.com, findsoulseed.com

### Issue: Domain not connecting
**Solutions**:
1. Wait longer (up to 48 hours, usually < 1 hour)
2. Check DNS records are correct
3. Clear DNS cache: `sudo systemd-resolve --flush-caches`
4. Use DNS checker: https://www.whatsmydns.net/

### Issue: SSL certificate error
**Solutions**:
1. Wait 5-10 minutes (Vercel auto-issues SSL)
2. Force renewal: `vercel domains verify soulseed.com`
3. Check domain is verified: `vercel domains ls`

---

## Next Steps After Purchase

1. ✅ Buy domain
2. ✅ Configure DNS (if not Vercel)
3. ✅ Verify domain in Vercel
4. ✅ Update OAuth redirect URIs
5. ✅ Update Firebase authorized domains
6. ✅ Test deployment
7. ✅ Celebrate! 🎉

---

## Support Resources

**Namecheap Support**:
- Live Chat: https://www.namecheap.com/support/live-chat/
- Help Center: https://www.namecheap.com/support/

**Vercel Support**:
- Docs: https://vercel.com/docs/concepts/projects/domains
- Community: https://github.com/vercel/vercel/discussions

**Cloudflare Support**:
- Docs: https://developers.cloudflare.com/registrar/
- Community: https://community.cloudflare.com/

---

**Last Updated**: 2025-10-15
**Estimated Time**: 10-15 minutes
**Difficulty**: Easy ✅
