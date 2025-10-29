# 📱 Firebase Authorized Domains - Mobile Guide

## 🎯 Direct Link (Tap to Open)

```
https://console.firebase.google.com/project/babynames-app-9fa2a/authentication/settings
```

---

## 📍 **Exact Navigation Path**

### **Method 1: Direct Settings Link** (Recommended)

1. **Open this URL:**
   ```
   https://console.firebase.google.com/project/babynames-app-9fa2a/authentication/settings
   ```

2. **You should land directly on "Settings" tab**

3. **Scroll down** until you see:
   ```
   Authorized domains
   ├─ localhost (already there)
   ├─ babynames-app-9fa2a.firebaseapp.com (already there)
   └─ [Add domain button]
   ```

4. **Tap "Add domain"**

5. **Enter:** `soulseedbaby.com` → Tap "Add"

6. **Tap "Add domain" again**

7. **Enter:** `www.soulseedbaby.com` → Tap "Add"

8. **Tap "Add domain" again**

9. **Enter:** `babyname2-votingsystem.vercel.app` → Tap "Add"

---

### **Method 2: If Link Doesn't Work**

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com
   ```

2. **Tap your project:** `babynames-app-9fa2a`

3. **Tap ☰ menu** (top left, 3 horizontal lines)

4. **Scroll down in menu**

5. **Find and tap:** `Authentication`

6. **Look for tabs at top:**
   - Users
   - Sign-in method
   - **Settings** ← TAP THIS
   - Templates
   - Usage

7. **On Settings tab, scroll down**

8. **Find section:** "Authorized domains"

9. **Follow steps 4-9 from Method 1 above**

---

## 🔍 **What "Authorized Domains" Section Looks Like**

```
┌─────────────────────────────────────┐
│ Authorized domains                  │
│                                     │
│ localhost                      [x]  │
│ babynames-app-9fa2a...app.com [x]  │
│                                     │
│ [+ Add domain]                      │
└─────────────────────────────────────┘
```

---

## 📝 **Domains to Add (Copy These)**

```
soulseedbaby.com
```

```
www.soulseedbaby.com
```

```
babyname2-votingsystem.vercel.app
```

**IMPORTANT:**
- ✅ NO `https://` prefix
- ✅ Just the plain domain
- ✅ Add each one separately

---

## 🆘 **Still Can't Find It?**

### **Enable Desktop Mode:**

**Chrome:**
1. Tap ⋮ (3 dots top right)
2. Tap "Desktop site" checkbox
3. Page reloads in desktop view
4. Much easier to navigate!

**Firefox:**
1. Tap ⋮ (3 dots top right)
2. Tap "Desktop site"
3. Page reloads

---

## ✅ **How to Verify It Worked**

After adding domains, you should see:

```
Authorized domains
├─ localhost
├─ babynames-app-9fa2a.firebaseapp.com
├─ soulseedbaby.com                    ← NEW
├─ www.soulseedbaby.com                ← NEW
└─ babyname2-votingsystem.vercel.app   ← NEW
```

---

## 🚨 **Common Issues on Mobile**

1. **Can't find "Settings" tab**
   - Swipe left on the tabs (Users, Sign-in method, Settings...)
   - Settings might be hidden off-screen

2. **Page loads slowly**
   - Firebase console is heavy on mobile
   - Be patient, wait 5-10 seconds

3. **"Add domain" button not visible**
   - Scroll all the way down
   - It's at the bottom of "Authorized domains" section

4. **Desktop mode recommended**
   - Seriously, it's 10x easier
   - Enable it via browser menu

---

## 📞 **Tell Me When:**

✅ "found it" - You found Authorized domains section
✅ "added" - You added all 3 domains
✅ "stuck" - You need more help

---

**Current step:** Finding "Authorized domains" section on mobile
