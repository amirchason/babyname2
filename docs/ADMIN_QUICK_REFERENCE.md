# Admin Quick Reference Card

## 📸 Screenshot Feature

### How to Take a Screenshot
1. **Login** with your admin email (earthiaone@gmail.com)
2. **Click** the "Admin" button (yellow/orange badge) in the header
3. **Select** "Take Screenshot" (camera icon) from the dropdown
4. **Wait** for the white flash animation
5. **Check** your browser's Downloads folder

### Screenshot Filenames
Format: `SoulSeed_{PageName}_{YYYYMMDD_HHMMSS}.png`

**Examples:**
- `SoulSeed_Home_20251010_042530.png`
- `SoulSeed_Favorites_20251010_143022.png`
- `SoulSeed_SwipeMode_20251010_205514.png`

### Page Names
| URL Path      | Filename    |
|---------------|-------------|
| `/`           | Home        |
| `/names`      | NameList    |
| `/favorites`  | Favorites   |
| `/dislikes`   | Dislikes    |
| `/debug`      | Debug       |
| `/swipe`      | SwipeMode   |

## 🔐 Admin Access

### Current Admin Users
- earthiaone@gmail.com

### Adding New Admins
1. Edit `src/config/adminConfig.ts`
2. Add email to `ADMIN_EMAILS` array
3. User must login with Google OAuth

## 🎯 Visual Indicators

### Success
✅ White flash animation
✅ Toast: "Screenshot saved: {filename}"
✅ File downloaded to browser downloads

### Capturing
🔄 Menu shows "Capturing..." with pulsing camera icon
🔄 Menu items disabled during capture

### Error
❌ Toast: "Screenshot failed: {error message}"
❌ Check browser console for details

## 🐛 Troubleshooting

### Screenshot is Blank
- Some cross-origin images may not load
- Try different page or wait for all images to load

### Download Not Working
- Check browser download permissions
- Disable popup blockers for the site

### Low Quality
- Default is 2x resolution (Retina)
- File size typically 100KB-2MB

### Capture Timeout
- Default timeout is 15 seconds
- Large pages may take longer
- Try simpler pages first

## 📋 Feature Checklist

- [x] Admin login required
- [x] Camera icon in menu
- [x] Flash animation on capture
- [x] Auto-download as PNG
- [x] Smart filename with timestamp
- [x] Toast notifications
- [x] Loading state during capture
- [x] Error handling

## 🔧 Technical Details

### Library
- **html2canvas 1.4.1** - Canvas-based screenshot capture

### Quality Settings
- **Scale**: 2x (Retina quality)
- **Format**: PNG
- **Background**: White (#ffffff)
- **Timeout**: 15 seconds for images

### Files Location
- **Utility**: `src/utils/screenshotUtils.ts`
- **Component**: `src/components/AdminMenu.tsx`
- **Config**: `src/config/adminConfig.ts`
- **Docs**: `docs/ADMIN_SCREENSHOT_FEATURE.md`

## 📞 Support

### For Issues
1. Check browser console for errors
2. Try different browser (Chrome recommended)
3. Ensure latest build is deployed
4. Check `docs/ADMIN_SCREENSHOT_FEATURE.md` for details

### Documentation
- **Full Docs**: `docs/ADMIN_SCREENSHOT_FEATURE.md`
- **Workflow**: `docs/SCREENSHOT_WORKFLOW.md`
- **Summary**: `FEATURE_SUMMARY_SCREENSHOT.md`

---

**Last Updated**: 2025-10-10
**Feature Version**: 1.0
**Admin Count**: 1
