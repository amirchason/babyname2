# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
BabyNames App v2 - A comprehensive React TypeScript app with 174k+ baby names, AI-powered suggestions, Tinder-style swiping, and Firebase cloud sync. Features animated UI with UnicornStudio background animations and minimalist design.

## Essential Commands

### Development
```bash
npm start              # Start dev server at http://localhost:3000/babyname2 (NODE_OPTIONS='--max-old-space-size=1024')
npm run build          # Production build for GitHub Pages deployment
npm test               # Run test suite (Note: No tests currently written)
npm run lint           # ESLint check with react-app rules
npm run eject          # Eject from react-scripts (NOT RECOMMENDED - breaks CRA benefits)
```

### Deployment
```bash
npm run deploy         # Deploy to GitHub Pages (amirchason.github.io/babyname2)
```

### Continuous Deployment
Auto-deployment via GitHub Actions (`.github/workflows/deploy.yml`):
- **Trigger**: Push to `master` or `main` branch
- **Deploy Action**: JamesIves/github-pages-deploy-action@v4
- **CI**: false (ignores build warnings)

## Architecture & Key Concepts

### Data Layer Architecture
The app uses a **multi-tier database system** with progressive loading:

1. **Initial Fallback** (`src/data/largeFallbackNames.ts`):
   - Hardcoded array of popular names for instant display
   - Loaded synchronously at module initialization

2. **Full Database** (`src/data/fullDatabase.ts`):
   - Imports `largeFallbackNames` as initial data
   - **NOTE**: Does NOT load from `fullNames_cache.json` (file doesn't exist)
   - Used by `nameService` as the primary data source

3. **Optimized Service** (`src/services/optimizedNameService.ts`):
   - Progressive chunk loading from `public/data/names-chunk[1-4].json`
   - Chunk 1: ~23MB, Chunks 2-4: variable sizes
   - Three-tier cache: memory → chunks → disk
   - Used for advanced features (swipe decks, search indexing)

**Critical**: `nameService.ts` wraps `optimizedNameService` for backward compatibility. Most components use `nameService` as the main interface.

### Service Architecture

**Core Services**:
- `nameService.ts` - Main API for name data (wraps optimizedNameService)
- `optimizedNameService.ts` - Chunk-based loading, search indexing
- `swipeService.ts` - Tinder-style card stack management
- `favoritesService.ts` - Local storage for likes/dislikes
- `userDataService.ts` - Cloud sync with Google OAuth
- `enrichmentService.ts` - Background AI enrichment (meanings, origins)
- `claudeApiService.ts` - Google Gemini AI integration

**Data Flow**:
```
Component → nameService → optimizedNameService → chunks
                       ↘ fullDatabase (direct import)
```

### State Management

**Authentication** (`contexts/AuthContext.tsx`):
- Google OAuth 2.0 integration via `@react-oauth/google`
- Automatic cloud sync on login/logout
- Guest mode when GOOGLE_CLIENT_ID not configured
- User data merged between local storage and cloud
- JWT decode for token validation

**Favorites System**:
- Stored in localStorage: `favorites`, `dislikes`
- Cloud sync via `userDataService` when authenticated
- Automatic merge strategy on login
- Custom 'favoriteAdded' event dispatched for heart animations
- Dislikes filtered out from all views except DislikesPage

**Toast Notifications** (`contexts/ToastContext.tsx`):
- Global toast provider for user feedback
- Auto-dismiss after 3 seconds

### Firebase Configuration

The app uses **Firebase** for cloud sync and authentication:
- **Project ID**: `babynames-app-9fa2a`
- **Config File**: `src/config/firebase.ts`
- **Features**: Google Authentication, Firestore with offline persistence (IndexedDB)
- **Important**: Only one browser tab can have active persistence at a time

### Component Structure

**Pages** (all in `src/pages/`):
- `HomePage.tsx` - Main interface with hero section, search in header, filters, pagination
- `NameListPage.tsx` - Full browsable list with advanced filtering
- `FavoritesPage.tsx` - User's liked names with remove functionality
- `DislikesPage.tsx` - User's disliked names with restore functionality
- `SwipeModePage.tsx` - Tinder-style swipe interface
- `DebugPage.tsx` - Debug interface for development

**Key Components** (`src/components/`):
- `NameCard.tsx` - Individual name display with favorite/dislike actions, fly animations
- `NameDetailModal.tsx` - Detailed view with origin, meaning, stats
- `SwipingQuestionnaire.tsx` - Onboarding flow for swipe mode preferences
- `SwipeableNameCard.tsx` & `SwipeableNameProfile.tsx` - Tinder-style card components
- `CommandHandler.tsx` - CLI-style command interface
- `Pagination.tsx` - Infinite scroll & page navigation
- `Toast.tsx` - Toast notifications component
- `EnrichmentProcessor.tsx` & `MeaningProcessor.tsx` - Background data enrichment
- `ui/open-ai-codex-animated-background.tsx` - UnicornStudio floating names animation

### Routing
- Uses React Router v7.9 (latest version, not v6) with basename `/babyname2`
- Same basename for both dev and production
- All routes wrapped in `<AuthProvider>` and `<ToastProvider>`
- Routes defined in `App.tsx`

### AI Features

**Google Gemini Integration**:
- API key from `REACT_APP_GEMINI_API_KEY` in `.env`
- Background enrichment of name meanings and origins
- Batch processing to avoid rate limits
- Cached results stored with name entries

**Enrichment Pipeline**:
1. Initialize with popular names
2. Process in background (10 names/batch, 5s delay)
3. Update callback triggers UI refresh
4. Results persisted in name entries

### Database Scripts
33 Python scripts in `scripts/` for data processing:
- `consolidate_*.py` - Merge datasets
- `clean_*.py` - Data sanitization
- `split_*.py` - Chunk generation
- `optimize_*.py` - Performance tuning

**Note**: Most scripts are one-off tools. Core data is already processed in `public/data/`.

## Environment Variables

Required (see `.env` for full config):
```bash
REACT_APP_GOOGLE_API_KEY          # Google services
REACT_APP_GEMINI_API_KEY          # AI features
REACT_APP_GOOGLE_CLIENT_ID        # OAuth login
REACT_APP_GOOGLE_CLIENT_SECRET    # OAuth secret
```

Feature Flags:
```bash
REACT_APP_ENABLE_AI_CHAT=true
REACT_APP_ENABLE_FAVORITES=true
REACT_APP_ENABLE_SCRAPING=true    # Not actively used
REACT_APP_ENABLE_BLOG=false       # Disabled
```

Theme Colors:
```bash
REACT_APP_PRIMARY_COLOR=#D8B2F2   # Light purple
REACT_APP_SECONDARY_COLOR=#FFB3D9 # Light pink
REACT_APP_ACCENT_COLOR=#B3D9FF    # Light blue
```

## Performance Considerations

1. **Initial Load**: 1000 popular names shown immediately, full database loads in background
2. **Pagination**: 100 names per page to keep DOM manageable
3. **Search Priority**: Three-tier system (exact → starts-with → contains) at `src/pages/HomePage.tsx:309-371`
4. **Memory**: Node max-old-space-size set to 1024MB to handle large dataset builds
5. **Caching**: Service worker enabled, 1-hour cache duration
6. **Animations**: Hardware-accelerated CSS transforms for card fly effects
7. **Chunk Loading**: Progressive loading of 4 data chunks to reduce initial bundle

## Key Files to Understand First

1. `src/services/nameService.ts` - Central data API
2. `src/contexts/AuthContext.tsx` - Auth + sync logic
3. `src/pages/HomePage.tsx` - Main UI + interactions
4. `src/data/fullDatabase.ts` - Database import mechanism
5. `.env` - Configuration

## Tech Stack
- React 19.1 + TypeScript 4.9
- React Router v7.9 (not v6!)
- Tailwind CSS 3.4 with custom pastel colors & animations
- Firebase 12.3.0 (auth & cloud sync)
- Google Gemini AI (@google/generative-ai)
- Framer Motion (animations)
- @react-oauth/google (auth)
- Lucide React (icons)

## Testing

**Current State**: No tests written yet!
- Uses default `react-scripts test` configuration (Jest + React Testing Library)
- No custom `jest.config.js` or `setupTests.ts` files
- Testing libraries are installed and ready

**To add tests**:
1. Create `*.test.tsx` files in `src/` directory
2. Run with `npm test`
3. Tests will auto-detect and run via Jest

## Additional Documentation

**Important**: Always check `SESSION_LOG.md` FIRST for recent changes and context!

Other key docs in the repository:
- **SESSION_LOG.md** - Detailed recent session notes and changes
- **GOOGLE_AUTH_SETUP.md** - OAuth configuration guide
- **todos.md** - Project roadmap and task list
- **DATABASE_FIX_REPORT.md** - Database maintenance history
- **README.md** - Public-facing project description

## Recent UI Enhancements

1. **Hero Section**: Animated floating baby names background with minimalist design
2. **Unisex Filter**: AI-powered detection with 35% threshold (35-65% gender ratio)
3. **Heart Animations**: Pink color and heartbeat effect when favorites > 0
4. **Search Redesign**: Moved to expandable header icon from hero section
5. **Card Animations**: Fly-away effects on like/dislike actions

## Known Issues / Warnings

### TypeScript Warnings
- **Framer Motion Variants**: Type mismatch in `NameCard.tsx:163` (ease property string type)
- **Filter Context**: Unisex filter type mismatch in `HomePage.tsx:833`
- **Implicit Any**: Missing type in `chunkedDatabaseService.ts:132`

### Architectural Notes
- Database files in `public/data/` have duplicates (consolidated vs ultimate vs unified)
- The "secondary 230k database" is in `public/data/ultimateNamesDatabase.json`
- Background enrichment may hit API rate limits with free tier Gemini key
- GitHub Pages deployment requires `PUBLIC_URL=/babyname2` and `homepage` in package.json
- TypeScript path alias `@/*` configured but has module resolution issues (use relative imports)
- `scripts/` contains 47 Python data processing scripts (mostly one-off utilities, data already processed)

---
*Last updated: 2025-10-03*