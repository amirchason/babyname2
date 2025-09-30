# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
BabyNames App v2 - A comprehensive React TypeScript app with 174k+ baby names, AI-powered suggestions, Tinder-style swiping, and cloud sync.

## Essential Commands

### Development
```bash
npm start              # Start dev server (http://localhost:3000)
npm run build          # Production build
npm test               # Run test suite
npm run lint           # ESLint check
```

### Deployment
```bash
npm run deploy         # Deploy to GitHub Pages (amirchason.github.io/babyname2)
```

## Architecture & Key Concepts

### Data Layer Architecture
The app uses a **dual-database system** with progressive loading:

1. **Full Database Import** (`src/data/fullDatabase.ts`):
   - 174,000+ names imported directly from `src/data/fullNames_cache.json`
   - Loaded synchronously at module initialization for instant availability
   - Used by `nameService` as the primary data source

2. **Optimized Service** (`src/services/optimizedNameService.ts`):
   - Progressive chunk loading system for 228k names
   - Compressed JSON chunks in `public/data/names-*.json.gz`
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

**Favorites System**:
- Stored in localStorage: `favorites`, `dislikes`
- Cloud sync via `userDataService` when authenticated
- Automatic merge strategy on login

### Component Structure

**Pages** (all in `src/pages/`):
- `HomePage.tsx` - Main interface with search, filters, pagination
- `NameListPage.tsx` - Full browsable list with advanced filtering
- `FavoritesPage.tsx` - User's liked names
- `DislikesPage.tsx` - User's disliked names

**Key Components** (`src/components/`):
- `NameCard.tsx` - Individual name display with favorite/dislike actions
- `NameDetailModal.tsx` - Detailed view with origin, meaning, stats
- `SwipingQuestionnaire.tsx` - Onboarding flow for swipe mode
- `CommandHandler.tsx` - CLI-style command interface
- `Pagination.tsx` - Infinite scroll & page navigation

### Routing
- Uses React Router v6 with basename `/babyname2`
- Same basename for both dev and production
- All routes wrapped in `<AuthProvider>`

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
3. **Search**: Prioritizes names starting with search term (see `src/pages/HomePage.tsx:309`)
4. **Memory**: Node max-old-space-size set to 1024MB in `package.json`
5. **Caching**: Service worker enabled, 1-hour cache duration

## Key Files to Understand First

1. `src/services/nameService.ts` - Central data API
2. `src/contexts/AuthContext.tsx` - Auth + sync logic
3. `src/pages/HomePage.tsx` - Main UI + interactions
4. `src/data/fullDatabase.ts` - Database import mechanism
5. `.env` - Configuration

## Tech Stack
- React 19.1 + TypeScript 4.9
- React Router v7.9
- Tailwind CSS 3.4
- Google Gemini AI (@google/generative-ai)
- Framer Motion (animations)
- @react-oauth/google (auth)
- Lucide React (icons)

## Known Issues / Important Notes

- Database files in `public/data/` have many duplicates/variants (consolidated vs ultimate vs unified)
- The "secondary 230k database" mentioned in notes is in `public/data/ultimateNamesDatabase.json`
- Swipe deck feature is implemented but questionnaire integration is in progress
- Background enrichment may hit API rate limits with free tier Gemini key
- GitHub Pages deployment requires `PUBLIC_URL=/babyname2` and `homepage` in package.json

---
*Last updated: 2025-09-29*