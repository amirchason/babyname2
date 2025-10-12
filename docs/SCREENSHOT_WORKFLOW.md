# Admin Screenshot Feature - Workflow Diagram

## 🔄 User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
└─────────────────────────────────────────────────────────────────┘

1. Admin logs in with Google OAuth
         │
         ▼
2. isAdmin flag set (email in adminConfig.ts whitelist)
         │
         ▼
3. AdminMenu appears in AppHeader
         │
         ▼
4. User clicks "Admin" dropdown button
         │
         ▼
5. Menu opens with options
         │
         ▼
6. User clicks "Take Screenshot" (camera icon)


┌─────────────────────────────────────────────────────────────────┐
│                     SCREENSHOT PROCESS                           │
└─────────────────────────────────────────────────────────────────┘

7. handleScreenshot() async function starts
         │
         ▼
8. isCapturingScreenshot = true (loading state)
         │
         ▼
9. Menu closes (150ms delay for animation)
         │
         ▼
10. captureScreenshotWithFeedback() called
         │
         ▼
11. White flash overlay created
         │
         ▼
12. Flash animation triggered (0.7 opacity → 0)
         │
         ▼
13. html2canvas captures current page
    - 2x scale for high quality
    - Full page width/height
    - CORS enabled
    - White background
         │
         ▼
14. Canvas converted to blob (PNG format)
         │
         ▼
15. Filename generated
    Format: SoulSeed_{PageName}_{YYYYMMDD_HHMMSS}.png
    Example: SoulSeed_Home_20251010_042530.png
         │
         ▼
16. Blob converted to Object URL
         │
         ▼
17. Temporary <a> element created with download attribute
         │
         ▼
18. Download triggered programmatically
         │
         ▼
19. Flash overlay removed (300ms after start)
         │
         ▼
20. isCapturingScreenshot = false


┌─────────────────────────────────────────────────────────────────┐
│                     USER FEEDBACK                                │
└─────────────────────────────────────────────────────────────────┘

SUCCESS PATH:
21. Toast notification: "Screenshot saved: {filename}"
         │
         ▼
22. File downloads to browser's download folder
         │
         ▼
23. User can view/share screenshot

ERROR PATH (if failure):
21. Toast notification: "Screenshot failed: {error message}"
         │
         ▼
22. Console error logged for debugging
         │
         ▼
23. isCapturingScreenshot = false (reset state)
```

## 🎨 Visual States

### 1. Menu Closed (Initial)
```
┌──────────────────────┐
│  [Shield] Admin  [▼] │  ← Yellow/orange gradient button
└──────────────────────┘
```

### 2. Menu Open
```
┌──────────────────────────────────────┐
│  Admin Panel                         │
│  earthiaone@gmail.com                │
├──────────────────────────────────────┤
│  ⚠️ Admin actions are logged...      │
├──────────────────────────────────────┤
│  📷 Take Screenshot                  │  ← First option
│     Capture current page             │
├──────────────────────────────────────┤
│  💾 Data Management                  │
│     Manage names database            │
├──────────────────────────────────────┤
│  👥 User Analytics                   │
│     View user statistics             │
├──────────────────────────────────────┤
│  ... more options ...                │
└──────────────────────────────────────┘
```

### 3. Capturing State
```
┌──────────────────────────────────────┐
│  Admin Panel                         │
│  earthiaone@gmail.com                │
├──────────────────────────────────────┤
│  ⚠️ Admin actions are logged...      │
├──────────────────────────────────────┤
│  📷 Capturing...         ← Pulsing   │
│     Capture current page             │
│     [disabled, opacity 70%]          │
├──────────────────────────────────────┤
│  ... (other items disabled) ...      │
└──────────────────────────────────────┘
```

### 4. Flash Animation
```
    Full-screen white overlay
    ┌─────────────────────────┐
    │                         │
    │                         │
    │   (opacity: 0 → 0.7)    │  ← 150ms fade in
    │   (opacity: 0.7 → 0)    │  ← 100ms fade out
    │                         │
    │                         │
    └─────────────────────────┘
    Removed after 300ms total
```

### 5. Success Notification
```
┌────────────────────────────────────────────┐
│  ✓ Screenshot saved:                       │
│    SoulSeed_Home_20251010_042530.png       │
└────────────────────────────────────────────┘
          Auto-dismiss after 3s
```

## 🔒 Security Check Flow

```
User Authentication
         │
         ▼
    Is logged in?  ──NO──→  No AdminMenu shown
         │
        YES
         ▼
    Get user email
         │
         ▼
    Check against ADMIN_EMAILS array
    (src/config/adminConfig.ts)
         │
         ▼
    Email matches?  ──NO──→  isAdmin = false  ──→  No AdminMenu
         │
        YES
         ▼
    isAdmin = true
         │
         ▼
    AdminMenu component renders
         │
         ▼
    Screenshot feature available
```

## 📊 Data Flow

```
┌──────────────┐
│   User       │
│   Clicks     │
│ Screenshot   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│   AdminMenu.tsx          │
│   handleScreenshot()     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   screenshotUtils.ts             │
│   captureScreenshotWithFeedback()│
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────┐
│   html2canvas            │
│   (npm package)          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Canvas → Blob          │
│   (PNG format)           │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   downloadBlob()         │
│   (triggers browser DL)  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   ToastContext           │
│   (success message)      │
└──────────────────────────┘
```

## 🎯 Key Functions

### AdminMenu.tsx
```typescript
handleScreenshot() {
  1. Set loading state
  2. Close menu
  3. Wait 150ms
  4. Call capture function
  5. Show toast (success/error)
  6. Reset loading state
}
```

### screenshotUtils.ts
```typescript
captureScreenshotWithFeedback() {
  1. Create flash overlay
  2. Animate flash (white fade in/out)
  3. Call captureScreenshot()
  4. Remove flash overlay
  5. Return result
}

captureScreenshot() {
  1. Call html2canvas with config
  2. Convert canvas to blob
  3. Generate filename
  4. Download blob
  5. Return success/error
}

generateScreenshotFilename() {
  1. Get current page name
  2. Get current timestamp
  3. Format: SoulSeed_{Page}_{YYYYMMDD_HHMMSS}.png
  4. Return filename
}
```

## 📱 Component Hierarchy

```
App.tsx
  │
  ├── AuthProvider
  │     │
  │     └── isAdmin flag set here
  │
  ├── ToastProvider
  │     │
  │     └── showToast() available
  │
  └── Router
        │
        └── All Pages
              │
              └── AppHeader
                    │
                    └── AdminMenu (if isAdmin)
                          │
                          ├── Menu Button
                          │
                          └── Dropdown
                                │
                                └── Screenshot Item
                                      │
                                      └── handleScreenshot()
                                            │
                                            └── screenshotUtils
                                                  │
                                                  └── html2canvas
```

## ⚙️ Configuration

### html2canvas Options
```typescript
{
  useCORS: true,              // Allow cross-origin images
  allowTaint: true,           // Allow tainted canvas
  backgroundColor: '#ffffff', // White background
  scale: 2,                   // 2x resolution (Retina)
  logging: false,             // Disable console logs
  imageTimeout: 15000,        // 15s timeout for images
  removeContainer: true,      // Clean up after capture
  windowWidth: scrollWidth,   // Full page width
  windowHeight: scrollHeight  // Full page height
}
```

### Admin Whitelist
```typescript
// src/config/adminConfig.ts
export const ADMIN_EMAILS = [
  'earthiaone@gmail.com'
];
```

## 🐛 Error Handling

```
Try {
  Capture screenshot
} Catch (error) {
  │
  ├── Canvas creation failed
  ├── Blob conversion failed
  ├── Download failed
  └── Timeout exceeded
  │
  All errors:
    1. Logged to console
    2. Shown in toast
    3. State reset
}
```

---

**Last Updated**: 2025-10-10
**Feature Version**: 1.0
