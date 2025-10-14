# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🤖 Default Workflow: Agent Orchestration
**CRITICAL**: Unless explicitly stated otherwise by the user, ALL user requests MUST be processed through the Task tool with the `general-purpose` agent orchestrator FIRST before taking any direct action.

**Workflow**:
1. User provides a request/command
2. Use Task tool with `general-purpose` subagent to analyze and plan the approach
3. Execute the plan based on agent's recommendations
4. Only skip agent orchestration if user explicitly says "without agents" or similar

**Reasoning**: Agent orchestration provides:
- Better problem analysis and planning
- More thorough debugging and root cause analysis
- Reduced errors from rushed implementations
- Multi-step coordination for complex tasks

## Project Overview
SoulSeed - Where your baby name blooms. A comprehensive React TypeScript app with 174k+ baby names, AI-powered suggestions, Tinder-style swiping, and Firebase cloud sync. Features animated UI with UnicornStudio background animations and minimalist design.

## 🚀 Future Feature Ideas
**IMPORTANT**: Check `future_ideas/viral_ideas.txt` each session for viral feature ideas and enhancements to consider.

## Essential Commands

### Development
```bash
npm start              # Start dev server at http://localhost:3000/babyname2
                       # (use --legacy-peer-deps if install issues with React 19)
                       # (NODE_OPTIONS='--max-old-space-size=1024' set in package.json)
npm run build          # Production build for GitHub Pages deployment
npm run lint           # Run ESLint on codebase
npm test               # Run test suite (Note: No tests currently written)
npm run deploy         # Deploy to GitHub Pages (amirchason.github.io/babyname2)
```

### 📦 Backup (Default Location)
**CRITICAL**: When the user says "backup" or "backup the app", ALWAYS backup to:
```
/storage/emulated/0/Download/backupapp/
```

**Backup command** (run from project root):
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S) && \
tar -czf /storage/emulated/0/Download/backupapp/babyname2-backup-${TIMESTAMP}.tar.gz \
  --exclude='node_modules' --exclude='.git' --exclude='build' \
  --exclude='*.log' --exclude='*.tar.gz' .
```

**Quick commands**:
```bash
# List backups:
ls -lh /storage/emulated/0/Download/backupapp/

# Restore from backup:
cd /data/data/com.termux/files/home/proj && \
tar -xzf /storage/emulated/0/Download/backupapp/babyname2-backup-YYYYMMDD_HHMMSS.tar.gz
```

**What gets backed up**: All source code, configs, data files
**What's excluded**: node_modules, .git, build, logs, old tarballs

### API Testing (Node Scripts)
```bash
node testAllAPIs.js              # Test all API connections (OpenAI, Gemini, GPT-4)
node testOpenAI.js               # Test OpenAI API connection specifically
node testGemini.js               # Test Gemini API connection
node testGPT4Demo.js             # Test GPT-4 demo functionality
```

### Data Processing Scripts
```bash
node processTop200.js            # Process top 200 names with AI enrichment
node processFirst10999.js        # Process first 10,999 names batch
node processNext90000.js         # Process next 90,000 names batch
node processNext90000WithMini.js # Process with GPT-4-mini model
node processNamesWithGPT4.js     # Enrich names with GPT-4 meanings/origins
node enrichWithGemini.js         # Enrich using Gemini API
node enrichWithMini.js           # Enrich using GPT-4-mini
node enrichUnknownOrigins.js     # Process names with unknown origins
node monitorAndContinue.js       # Resume interrupted processing
node miniMonitorAndContinue.js   # Resume mini model processing
node checkOpenAIStatus.js        # Check OpenAI API status
node compareModelQuality.js      # Compare AI model output quality
node cleanDatabase.js            # Clean and validate database entries
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
   - Attempts to fetch `/data/popularNames_cache.json` (10k names)
   - **NOTE**: Does NOT load from `fullNames_cache.json` (file doesn't exist)

3. **Chunked Database Service** (`src/services/chunkedDatabaseService.ts`):
   - Progressive loading from `public/data/names-chunk[1-4].json`
   - Core chunk: 1000 names (instant load)
   - Additional chunks: ~3.4MB each
   - Three-tier cache: memory → chunks → disk
   - **THIS IS THE ACTIVE SERVICE** used by nameService.ts

**Data Flow**:
```
Component → nameService → chunkedDatabaseService → chunks
```

**Critical**: `optimizedNameService.ts` exists but is UNUSED. `nameService.ts` uses `chunkedDatabaseService` as the actual data provider.

### Service Architecture

**Core Services**:
- `nameService.ts` - Main API for name data (uses chunkedDatabaseService)
- `chunkedDatabaseService.ts` - Progressive chunk loading (ACTIVE)
- `optimizedNameService.ts` - Alternative implementation (UNUSED)
- `swipeService.ts` - Tinder-style card stack management
- `favoritesService.ts` - Local storage for likes/dislikes
- `userDataService.ts` - Cloud sync with Google OAuth
- `enrichmentService.ts` - Background AI enrichment (meanings, origins)
- `claudeApiService.ts` - Google Gemini AI integration

### State Management

**Authentication** (`contexts/AuthContext.tsx`):
- Google OAuth 2.0 integration via `@react-oauth/google`
- **CRITICAL**: Uses Firebase UID (NOT Google OAuth ID) for Firestore - see lines 256-258
- Automatic cloud sync on login/logout
- Guest mode when GOOGLE_CLIENT_ID not configured
- User data merged between local storage and cloud
- JWT decode for token validation

**Favorites System**:
- Stored in localStorage: `favorites`, `dislikes`, `pinnedFavorites`
- Cloud sync via `userDataService` when authenticated
- Automatic merge strategy on login (union of local + cloud)
- Custom 'favoriteAdded' event dispatched for heart animations
- Dislikes filtered out from all views except DislikesPage
- Pinned favorites (max 20) shown at top of favorites page

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
  - **LIST1 MODE** (current default): Comprehensive filtering with 5-tab Smart Filters drawer
  - See `LIST1_MODE_REFERENCE.md` and `docs/LIST_MODES.md` for full documentation
  - Code sections marked with `LIST1 MODE` comments in HomePage.tsx
- `NameListPage.tsx` - Full browsable list with advanced filtering
- `FavoritesPage.tsx` - User's liked names with remove functionality
- `DislikesPage.tsx` - User's disliked names with restore functionality
- `SwipeModePage.tsx` - Tinder-style swipe interface
- `DebugPage.tsx` - Debug interface for development

**Key Components** (`src/components/`):
- `NameCard.tsx` - Individual name display with favorite/dislike actions, fly animations
- `NameDetailModal.tsx` - Detailed view with origin, meaning, stats (includes swipeable profile)
- `SwipingQuestionnaire.tsx` - Onboarding flow for swipe mode preferences
- `SwipeableNameCard.tsx` - Tinder-style swipe card for SwipeModePage
- `SwipeableNameProfile.tsx` - Swipeable profile component used in NameDetailModal
- `CommandHandler.tsx` - CLI-style command interface
- `Pagination.tsx` - Infinite scroll & page navigation
- `Toast.tsx` - Toast notifications component
- `EnrichmentProcessor.tsx` & `MeaningProcessor.tsx` - Background data enrichment
- `ui/open-ai-codex-animated-background.tsx` - UnicornStudio floating names animation
- `AdminMenu.tsx` - Admin-only dropdown menu with screenshot capture (requires admin email in adminConfig.ts)
- `AdminBadge.tsx` - Admin status badge display

### Routing
- **Uses React Router v7.9** (latest version, NOT v6 as README states!) with basename `/babyname2`
- Same basename for both dev and production
- All routes wrapped in `<AuthProvider>` and `<ToastProvider>`
- Routes defined in `App.tsx`

### AI Features

**OpenAI GPT-4 Mini Integration** (Active):
- API key from `REACT_APP_OPENAI_API_KEY` in `.env`
- Background enrichment of name meanings and origins using GPT-4o-mini
- Service: `src/services/openaiApiService.ts`
- Agent: `src/agents/NameEnrichmentAgent.ts`
- **FAST BATCH PROCESSING**: 10 names per API call (10x more efficient than individual requests)
- 1.5 second delay between batches = ~400 names/minute processing speed
- Exponential backoff retry logic for rate limit errors (429)
- Name-by-name validation to ensure accuracy of each result
- Cached results stored with name entries
- **STATUS**: ✅ ENABLED in HomePage.tsx (lines 70-111)
- **Auto-processing**: ✅ ENABLED (processes 100 names on load, then 20 at a time in background)

**Google Gemini** (Backup):
- API key from `REACT_APP_GEMINI_API_KEY` in `.env`
- Available via `src/services/claudeApiService.ts` (fallback mode)

**Unisex Detection Algorithm**:
- 35% threshold: Names with 35-65% gender ratio marked as unisex
- Background processing via `unisexService.ts`
- Results cached in localStorage
- Used for "Unisex" filter button in UI

**Search Priority System** (Three-tier):
1. Exact matches first
2. Names starting with search term (alphabetical)
3. Names containing term elsewhere (alphabetical)
- Located at `src/services/nameService.ts:173-204`

### Database Scripts
47 Python scripts in `scripts/` for data processing (13,128 lines total):
- `consolidate_*.py` - Merge datasets
- `clean_*.py` - Data sanitization
- `split_*.py` - Chunk generation
- `optimize_*.py` - Performance tuning

**Note**: Most scripts are one-off tools. Core data is already processed in `public/data/`.

## Environment Variables

Required (see `.env` for full config):
```bash
REACT_APP_GOOGLE_API_KEY          # Google services
REACT_APP_GEMINI_API_KEY          # AI features (React app)
REACT_APP_GOOGLE_CLIENT_ID        # OAuth login
REACT_APP_GOOGLE_CLIENT_SECRET    # OAuth secret
OPENAI_API_KEY                    # For Node.js enrichment scripts ONLY (not React app)
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
2. **Pagination**: 30 names per page to keep DOM manageable
3. **Search Priority**: Three-tier system with 100 result limit
4. **Memory**: Node max-old-space-size set to 1024MB to handle large dataset builds
5. **Caching**: Service worker enabled, 1-hour cache duration
6. **Animations**: Hardware-accelerated CSS transforms for card fly effects
7. **Chunk Loading**: Progressive loading of 4 data chunks to reduce initial bundle
8. **Firebase Persistence**: Only ONE browser tab can have active persistence at a time

## Key Files to Understand First

1. `src/services/nameService.ts` - Central data API (uses chunkedDatabaseService)
2. `src/services/chunkedDatabaseService.ts` - Active data loading service
3. `src/contexts/AuthContext.tsx` - Auth + sync logic (Firebase UID fix at line 256)
4. `src/pages/HomePage.tsx` - Main UI + interactions
5. `src/data/fullDatabase.ts` - Database import mechanism
6. `.env` - Configuration (includes OpenAI keys for Node scripts)

## Tech Stack
- React 19.1 + TypeScript 4.9 (Note: May need `npm install --legacy-peer-deps` for some packages)
- React Router v7.9 (NOT v6 as README incorrectly states!)
- Tailwind CSS 3.4 with custom pastel colors & animations
- Firebase 12.3.0 (auth & cloud sync)
- Google Gemini AI (@google/generative-ai)
- OpenAI API (for Node.js enrichment scripts)
- Framer Motion (animations)
- @react-oauth/google (auth)
- Lucide React (icons)
- jwt-decode (token validation)
- html2canvas 1.4.1 (admin screenshot capture)

## Testing

**Current State**: No tests written yet!
- Uses default `react-scripts test` configuration (Jest + React Testing Library)
- No custom `jest.config.js` or `setupTests.ts` files
- Testing libraries are installed and ready

**To add tests**:
1. Create `*.test.tsx` files in `src/` directory
2. Run with `npm test`
3. Tests will auto-detect and run via Jest

## MCP Server Integration

**Active MCP Servers** (Model Context Protocol):
- **filesystem**: File system operations (read/write, directories)
- **memory**: Knowledge graph for persistent memory across sessions
- **sequential-thinking**: Step-by-step reasoning and problem solving

See **MCP_SETUP.md** for complete setup guide, platform limitations, and how to add more servers.

**Platform Note**: Running on Termux/Android - only npm-based MCPs work (Python/Chrome-based MCPs incompatible).

## Additional Documentation

**Important**: Always check `SESSION_LOG.md` FIRST for recent changes and context!

Other key docs in the repository:
- **SESSION_LOG.md** - Detailed recent session notes and changes
- **LIST1_MODE_REFERENCE.md** - Quick reference for LIST1 MODE (homepage list/filter system)
- **docs/LIST_MODES.md** - Comprehensive LIST1 MODE documentation (for adding list2, list3, etc.)
- **docs/DATABASE_VIEWER_FEATURE.md** - Database viewer in admin menu with lazy loading
- **docs/ADMIN_SCREENSHOT_FEATURE.md** - Admin screenshot feature documentation
- **MCP_SETUP.md** - MCP server configuration and troubleshooting guide
- **GOOGLE_AUTH_SETUP.md** - OAuth configuration guide
- **todos.md** - Project roadmap and task list
- **DATABASE_FIX_REPORT.md** - Database maintenance history
- **README.md** - Public-facing project description

## Recent UI Enhancements

1. **Database Viewer in Admin Menu** (Latest): Admin users can view debug/storage info through lazy-loaded modal (see `docs/DATABASE_VIEWER_FEATURE.md`)
2. **Admin Screenshot Feature**: Admin users can capture and download screenshots of any page with visual feedback and auto-naming (see `docs/ADMIN_SCREENSHOT_FEATURE.md`)
3. **Swipeable Modal Profiles**: Tinder-style swipe gestures in NameDetailModal with animated like/dislike buttons
4. **Hero Section**: Animated floating baby names background with minimalist design
5. **Code Splitting**: 30% faster initial load via dynamic imports
6. **Unisex Filter**: AI-powered detection with 35% threshold (35-65% gender ratio)
7. **Heart Animations**: Pink color (15% bigger) and heartbeat effect when favorites > 0
8. **Search Redesign**: Moved to expandable header icon from hero section
9. **Card Animations**: Fly-away effects on like/dislike actions
10. **Pinned Favorites**: Max 20 pinned names shown at top of favorites
11. **Custom Events**: 'favoriteAdded' event for cross-component animations

## Known Issues / Warnings

### TypeScript Warnings
- **Framer Motion Variants**: Type mismatch in `NameCard.tsx:163` (ease property string type)
- **Filter Context**: Unisex filter type mismatch in `HomePage.tsx:833`
- **Implicit Any**: Missing type in `chunkedDatabaseService.ts:132`

### Architectural Notes
- Database files in `public/data/` have duplicates (53 JSON files total, many are backups)
- The "secondary 230k database" is in `public/data/ultimateNames_tier1.json`
- Background enrichment may hit API rate limits with free tier Gemini key
- GitHub Pages deployment requires `PUBLIC_URL=/babyname2` and `homepage` in package.json
- TypeScript path alias `@/*` configured but doesn't work without ejecting (use relative imports)
- Module resolution: Always use relative imports (e.g., `../lib/utils`), not `@/lib/utils`, as path aliases require ejecting
- `scripts/` contains 47 Python data processing scripts (mostly one-off utilities, data already processed)
- Firebase UID vs Google OAuth ID bug was fixed in AuthContext (line 256)
- optimizedNameService.ts exists but is NOT USED (nameService uses chunkedDatabaseService instead)

## Quick Development Tips

- **Data Service**: Always use `nameService.ts` (not optimizedNameService.ts)
- **Module Imports**: Use relative imports (`../lib/utils`), NOT path aliases (`@/lib/utils`)
- **React 19**: May need `npm install --legacy-peer-deps` for some packages
- **API Keys**: OPENAI_API_KEY is for Node scripts only; React app uses GEMINI_API_KEY
- **Firebase Tab Limit**: Only ONE browser tab can have active persistence at a time
- **Swipe Animations**: Both SwipeModePage and NameDetailModal support swipe gestures

---
*Last updated: 2025-10-05*