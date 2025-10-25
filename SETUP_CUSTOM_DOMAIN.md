# 🌐 Set Up soulseedbaby.com as Production Domain

## Issue
Your app is deploying to `https://babyname2-xxx.vercel.app` instead of `https://soulseedbaby.com`

## Solution: Configure Domain in Vercel Dashboard

### **Step 1: Go to Vercel Dashboard**
👉 https://vercel.com/ss-9666de73/babyname2/settings/domains

### **Step 2: Add Custom Domain**

1. Click **"Domains"** tab in project settings
2. Click **"Add Domain"** button
3. Enter: `soulseedbaby.com`
4. Click **"Add"**

### **Step 3: Verify Domain**

Vercel will show you DNS records to add. You have 2 options:

**Option A: A Record** (if you control DNS)
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option B: CNAME** (easier)
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### **Step 4: Add Additional Domains** (Optional)

Repeat for your other domains:
- `soulseed.baby`
- `soulseedapp.com`
- `soulseedbaby.app`

All can redirect to `soulseedbaby.com` as primary.

### **Step 5: Set Production Domain**

1. In the Domains list, find `soulseedbaby.com`
2. Click the **"⋮" menu** next to it
3. Select **"Set as Production Domain"**
4. Click **"Save"**

Now all future deployments will use `soulseedbaby.com`!

---

## Quick Verification

After setup, test:
```bash
curl -I https://soulseedbaby.com
```

Should return: `HTTP/2 200` with your app!

---

## Alternative: CLI Method

If you prefer CLI:

```bash
# Add domain
export VERCEL_TOKEN="AjtiZq6gyZc9lbAXwpTx2c7b"
vercel domains add soulseedbaby.com --token=$VERCEL_TOKEN

# List domains
vercel domains ls --token=$VERCEL_TOKEN

# Set as production
vercel alias set babyname2-xxx.vercel.app soulseedbaby.com --token=$VERCEL_TOKEN
```

---

## DNS Configuration

If you manage DNS at your domain registrar:

1. Go to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare)
2. Find DNS settings
3. Add the A record or CNAME (from Vercel dashboard)
4. Wait 5-10 minutes for propagation

---

## Current Status

✅ **Deployed to**: https://babyname2-jt8p12hgb-ss-9666de73.vercel.app
⏳ **Pending**: https://soulseedbaby.com (needs domain configuration)

**Once configured, all future `npm run deploy` will use soulseedbaby.com!**
