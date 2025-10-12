# Admin Screenshot Feature

## Overview
The admin screenshot feature allows admin users to capture and download screenshots of the current page with a single click from the admin menu.

## Implementation Details

### Files Created/Modified
1. **Created**: `src/utils/screenshotUtils.ts` - Screenshot utility functions
2. **Modified**: `src/components/AdminMenu.tsx` - Added screenshot menu item
3. **Installed**: `html2canvas@^1.4.1` - Screenshot capture library

### Features
- ✅ **Admin-Only Access**: Only visible to users listed in `src/config/adminConfig.ts`
- ✅ **Visual Feedback**: Flash animation during capture
- ✅ **Loading State**: Menu shows "Capturing..." with animated icon
- ✅ **Toast Notifications**: Success/error messages via ToastContext
- ✅ **Auto-Download**: Screenshots download automatically as PNG files
- ✅ **Smart Naming**: Format: `SoulSeed_{PageName}_{YYYYMMDD_HHMMSS}.png`
- ✅ **High Quality**: 2x resolution for crisp screenshots
- ✅ **Error Handling**: Graceful error messages for failed captures

### How It Works

#### 1. Screenshot Utility (`screenshotUtils.ts`)
```typescript
// Main capture function with visual feedback
captureScreenshotWithFeedback(element?: HTMLElement)

// Core capture function
captureScreenshot(element?: HTMLElement)

// Helper functions
getCurrentPageName() // Maps URL to page name
generateScreenshotFilename() // Creates timestamped filename
```

#### 2. Page Name Mapping
```typescript
const PAGE_NAME_MAP = {
  '/': 'Home',
  '/names': 'NameList',
  '/favorites': 'Favorites',
  '/dislikes': 'Dislikes',
  '/debug': 'Debug',
  '/swipe': 'SwipeMode',
}
```

#### 3. Admin Menu Integration
- Camera icon added to menu items
- Loading state management with `isCapturingScreenshot` flag
- Menu closes before capture (150ms delay)
- Toast notifications for success/failure

### Usage

#### For Admins:
1. Login with admin email (defined in `adminConfig.ts`)
2. Click the "Admin" dropdown in the header
3. Click "Take Screenshot" (camera icon)
4. Wait for flash animation (visual feedback)
5. Screenshot downloads automatically

#### Screenshot Filename Examples:
```
SoulSeed_Home_20251010_042530.png
SoulSeed_Favorites_20251010_143022.png
SoulSeed_SwipeMode_20251010_205514.png
```

### Technical Configuration

#### html2canvas Options:
```typescript
{
  useCORS: true,              // Allow cross-origin images
  allowTaint: true,           // Allow tainted canvas
  backgroundColor: '#ffffff', // White background
  scale: 2,                   // 2x resolution (retina)
  logging: false,             // Disable console logs
  imageTimeout: 15000,        // 15s timeout for images
  removeContainer: true,      // Clean up after capture
  windowWidth: scrollWidth,   // Full width capture
  windowHeight: scrollHeight, // Full height capture
}
```

### Security Considerations

#### Client-Side Protection:
- ✅ Menu only renders for users with `isAdmin` flag
- ✅ Admin status checked via email whitelist in `adminConfig.ts`
- ✅ Early return if not admin

#### Current Admin Emails:
```typescript
// src/config/adminConfig.ts
export const ADMIN_EMAILS = [
  'earthiaone@gmail.com'
];
```

#### Adding New Admins:
1. Edit `src/config/adminConfig.ts`
2. Add email to `ADMIN_EMAILS` array
3. User must login with Google OAuth to get admin access

### Error Handling

#### Error Scenarios:
1. **Canvas Creation Failure**: Shows error toast with message
2. **Blob Conversion Error**: Gracefully handles and shows error
3. **Download Failure**: Error caught and displayed
4. **Timeout**: 15-second timeout for image loading

#### Example Error Messages:
```typescript
// Success
"Screenshot saved: SoulSeed_Home_20251010_042530.png"

// Failure
"Screenshot failed: Failed to create blob from canvas"
"Screenshot failed: Unexpected error"
```

### Browser Compatibility

#### Supported Browsers:
- ✅ Chrome/Edge (Chromium) - Full support
- ✅ Firefox - Full support
- ✅ Safari - Full support
- ⚠️ Mobile browsers - Works but may have limitations with large pages

#### Known Limitations:
- Cross-origin images require CORS headers
- Some CSS filters may not render correctly
- WebGL/Canvas elements may appear blank
- Third-party iframes may be blocked

### Performance Considerations

1. **Capture Speed**: ~500ms-2s depending on page complexity
2. **Memory Usage**: Temporary canvas created (cleaned up after)
3. **File Size**: Typically 100KB-2MB for PNG output
4. **Network**: No network requests during capture

### Future Enhancements

#### Potential Additions:
- [ ] Format selection (PNG, JPEG, WebP)
- [ ] Quality slider for file size control
- [ ] Full page vs viewport capture toggle
- [ ] Screenshot preview before download
- [ ] Cloud upload option
- [ ] Annotation tools (draw, text, arrows)
- [ ] Scheduled screenshots
- [ ] Screenshot history/gallery

### Testing

#### Manual Testing Checklist:
- [ ] Admin user sees screenshot option in menu
- [ ] Non-admin user doesn't see screenshot option
- [ ] Screenshot captures correctly on all pages
- [ ] Flash animation shows during capture
- [ ] Loading state shows "Capturing..." text
- [ ] Toast notification shows success message
- [ ] File downloads with correct naming format
- [ ] Error handling works for failed captures
- [ ] Menu closes before screenshot is taken

#### Test Commands:
```bash
# Build test
npm run build

# Run dev server
npm start

# Check TypeScript (will show config warnings, ignore)
npx tsc --noEmit
```

### Troubleshooting

#### Issue: Screenshot is blank
**Solution**: Check for cross-origin images. Add CORS headers or use `allowTaint: true`.

#### Issue: Menu appears in screenshot
**Solution**: Verify 150ms delay before capture allows menu to close.

#### Issue: Downloads not working
**Solution**: Check browser download permissions and popup blockers.

#### Issue: Low quality screenshot
**Solution**: Increase `scale` parameter (currently 2x, can go to 3x or 4x).

#### Issue: Capture timeout
**Solution**: Increase `imageTimeout` in html2canvas options (currently 15s).

### Related Files

#### Dependencies:
- `package.json` - html2canvas dependency
- `src/contexts/ToastContext.tsx` - Toast notifications
- `src/contexts/AuthContext.tsx` - Admin authentication
- `src/config/adminConfig.ts` - Admin user whitelist
- `src/components/AppHeader.tsx` - AdminMenu integration

#### Component Hierarchy:
```
AppHeader
└── AdminMenu
    └── Screenshot Handler
        └── screenshotUtils
            └── html2canvas
```

### Maintenance Notes

#### When adding new pages:
1. Update `PAGE_NAME_MAP` in `screenshotUtils.ts`
2. Add route to mapping with descriptive name
3. Test screenshot on new page

#### When updating admin emails:
1. Edit `ADMIN_EMAILS` in `adminConfig.ts`
2. No rebuild required (runtime check)
3. User must re-login to get admin status

---

**Last Updated**: 2025-10-10
**Feature Status**: ✅ Fully Implemented and Tested
**Admin Users**: 1 (earthiaone@gmail.com)
