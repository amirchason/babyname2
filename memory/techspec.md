# SoulSeed Technical Specification

**Project**: SoulSeed Baby Name Application
**Version**: 0.1.0
**Last Updated**: 2025-10-19
**Production URL**: https://soulseedbaby.com

---

## Executive Summary

SoulSeed is a comprehensive React TypeScript application for baby name discovery, featuring 174,000+ names with AI-powered enrichment, Tinder-style swiping, Firebase cloud sync, and a voting system. The app uses progressive data loading, chunked databases, and Vercel edge deployment for optimal performance.

---

## Technology Stack

### Frontend Framework
- **React 19.1.1** - Latest version with concurrent features
- **TypeScript 4.9.5** - Static type checking
- **React Router 7.9.1** - Client-side routing (latest v7, NOT v6)
- **Create React App 5.0.1** - Build toolchain (ejected for customization)

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Framer Motion 12.23.19** - Animation library for card interactions
- **Lucide React 0.544.0** - Icon system
- **UnicornStudio React 1.4.31** - Animated background component
- **html2canvas 1.4.1** - Screenshot capture for admin features

### State Management
- **React Context API** - Global state (Auth, Toast, NameCache)
- **LocalStorage** - Client-side persistence (favorites, dislikes, pinned)
- **Firebase Firestore** - Cloud sync with offline persistence

### Backend & Services
- **Firebase 12.3.0** - Authentication + Firestore database
  - Google OAuth 2.0 via `@react-oauth/google 0.12.2`
  - Offline persistence with IndexedDB
  - Real-time cloud sync
- **Vercel Edge Network** - CDN + serverless hosting
- **Node.js** - Build toolchain and enrichment scripts

### AI/ML Integration
- **Google Gemini AI** (`@google/generative-ai 0.24.1`) - Primary AI for name suggestions
- **OpenAI API 6.1.0** - GPT-4o-mini for Node.js enrichment scripts
  - Batch processing: 10 names per API call
  - ~400 names/minute processing speed
  - Background enrichment of meanings/origins

### Data & Performance
- **Parse 3.5.1** - Data parsing and transformation
- **@tanstack/react-virtual 3.13.12** - Virtualized list rendering
- **Axios 1.12.2** - HTTP client
- **React Helmet Async 2.0.5** - SEO meta tag management

### Development Tools
- **TypeScript** - Static typing with strict mode
- **ESLint** - Code linting (react-app config)
- **Jest + React Testing Library** - Testing framework (no tests written yet)
- **Autoprefixer + PostCSS** - CSS processing
- **gh-pages 6.3.0** - Legacy GitHub Pages deployment

---

## Architecture

### Data Layer Architecture

#### Multi-Tier Database System
The app uses a sophisticated three-tier database loading strategy:

**Tier 1: Initial Fallback** (`src/data/largeFallbackNames.ts`)
- Hardcoded array of popular names (1000 names)
- Loaded synchronously at module initialization
- Instant display on first render
- Zero network latency

**Tier 2: Full Database** (`src/data/fullDatabase.ts`)
- Imports largeFallbackNames as initial data
- Attempts to fetch `/data/popularNames_cache.json` (10k names)
- **Note**: Does NOT load from `fullNames_cache.json` (file doesn't exist)
- Provides backup for chunk failures

**Tier 3: Chunked Database Service** (`src/services/chunkedDatabaseService.ts`) **[ACTIVE]**
- Progressive loading from `public/data/names-chunk[1-4].json`
- Core chunk: 1000 names (instant load)
- Additional chunks: ~3.4MB each (174k total names)
- Three-tier cache: memory → chunks → disk
- **THIS IS THE ACTIVE SERVICE** used by nameService.ts

**Data Flow**:
```
Component → nameService.ts → chunkedDatabaseService.ts → JSON chunks
```

**Critical Note**: `optimizedNameService.ts` exists but is **UNUSED**. Always use `nameService.ts`.

#### Database Structure

**Name Object Schema**:
```typescript
interface BabyName {
  name: string;                    // Name text
  gender: 'boy' | 'girl' | 'unisex'; // Gender classification
  origin: string[];                // Origins (e.g., ['Hebrew', 'Greek'])
  meaning: string;                 // Name meaning (AI-enriched)
  popularity?: number;             // SSA ranking (1-5000)
  syllables?: number;              // Syllable count (1-4+)

  // AI Enrichment (GPT-4o-mini batch processing)
  meaningEnriched?: boolean;       // Has AI-enriched meaning
  originEnriched?: boolean;        // Has AI-enriched origin

  // Analytics
  likeCount?: number;              // Total likes from all users

  // Themed List Tags
  themedLists?: string[];          // e.g., ['vintage', 'nature']
}
```

**Data Files**:
- `public/data/names-chunk1.json` - Core 1000 popular names
- `public/data/names-chunk[2-4].json` - Extended database (173k names)
- `public/data/popularNames_cache.json` - 10k most popular (backup)
- `public/data/ultimateNames_tier1.json` - Secondary 230k database (unused)

### Service Architecture

**Core Services** (`src/services/`):

1. **nameService.ts** - Central data API
   - Uses chunkedDatabaseService as data provider
   - Implements three-tier search priority system
   - Manages filtering and sorting
   - 100 result limit for performance

2. **chunkedDatabaseService.ts** - Progressive data loading
   - Loads chunks on-demand
   - Memory caching with LRU eviction
   - Chunk-level caching for network efficiency
   - Disk cache fallback

3. **favoritesService.ts** - Favorites management
   - LocalStorage persistence
   - Cloud sync via userDataService
   - Pinned favorites (max 20)
   - Custom 'favoriteAdded' event for animations

4. **swipeService.ts** - Tinder-style card stack
   - Pre-fetches next 10 cards
   - Filters by user preferences
   - Maintains swipe history
   - Integrates with questionnaire results

5. **voteService.ts** - Voting system
   - Create/manage voting sessions
   - Share voting links
   - Track votes per name
   - Sync to Firebase

6. **userDataService.ts** - Cloud sync
   - Firebase Firestore integration
   - Automatic merge strategy (union of local + cloud)
   - Real-time updates
   - Offline persistence

7. **enrichmentService.ts** - Background AI enrichment
   - Batch processing of name meanings
   - Origin consolidation
   - Quality validation
   - Rate limit handling

8. **listCrawlerManager.ts** - Themed list management
   - Background processing of themed lists
   - AI-powered name categorization
   - Progress tracking
   - Chunk-aware processing

### State Management

**Context Providers**:

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Google OAuth 2.0 integration
   - **CRITICAL**: Uses Firebase UID (NOT Google OAuth ID) - see line 256-258
   - Automatic cloud sync on login/logout
   - Guest mode when GOOGLE_CLIENT_ID not configured
   - JWT decode for token validation

2. **ToastContext** (`src/contexts/ToastContext.tsx`)
   - Global toast notifications
   - Auto-dismiss after 3 seconds
   - Queue system for multiple toasts

3. **NameCacheContext** (`src/contexts/NameCacheContext.tsx`)
   - In-memory cache for frequently accessed names
   - LRU eviction strategy
   - Reduces database queries

**LocalStorage Keys**:
```
favorites            - Array of liked name IDs
dislikes            - Array of disliked name IDs
pinnedFavorites     - Array of pinned name IDs (max 20)
swipeHistory        - Swipe session history
unisexCache         - AI-detected unisex names
enrichmentProgress  - Background enrichment state
```

### Component Architecture

**Page Components** (`src/pages/`):

1. **HomePage.tsx** - Main interface
   - Hero section with animated background
   - Smart Filters drawer (5-tab system - LIST1 MODE)
   - Search in expandable header
   - Pagination with infinite scroll
   - Background enrichment processor
   - See `LIST1_MODE_REFERENCE.md` for details

2. **SwipeModePage.tsx** - Tinder-style interface
   - Card stack with pre-fetching
   - Gesture-based controls
   - Questionnaire onboarding
   - Filter bar integration

3. **VotingPage.tsx** - Voting system
   - Create voting sessions
   - Share vote links
   - Interactive voting buttons
   - Animated rankings

4. **FavoritesPage.tsx** - Liked names
   - Pinned names at top (max 20)
   - Remove/unpin functionality
   - Cloud sync indicator
   - Export/share features

**Key Components** (`src/components/`):

1. **AppHeader.tsx** - Global header
   - Search input (expandable)
   - Favorites counter (heart animation when > 0)
   - Admin menu (for admin users only)
   - Login/logout button

2. **NameCard.tsx** - Name display card
   - Like/dislike buttons
   - Fly-away animation on action
   - Click to open detail modal
   - Compact variant (NameCardCompact.tsx)

3. **NameDetailModal.tsx** - Detailed view
   - Swipeable profile (Tinder gestures)
   - Origin, meaning, popularity stats
   - Like/dislike actions
   - Share functionality

4. **AdminMenu.tsx** - Admin features
   - Screenshot capture (html2canvas)
   - Database viewer (lazy-loaded)
   - Blog post editor
   - Debug tools

5. **CreateVoteModal.tsx** - Create voting session
   - Select names from favorites
   - Generate shareable link
   - Set vote parameters

### Routing Configuration

**React Router v7.9.1** (latest version):

```typescript
// App.tsx routing structure
<BrowserRouter basename="/">  {/* Vercel: root domain */}
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/list" element={<NameListPage />} />
    <Route path="/swipe" element={<SwipeModePage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/dislikes" element={<DislikesPage />} />
    <Route path="/voting" element={<VotingPage />} />
    <Route path="/votes/:voteId" element={<VotesListPage />} />
    <Route path="/create-vote" element={<CreateVotePage />} />
    <Route path="/blog" element={<BlogListPage />} />
    <Route path="/blog/:slug" element={<BlogPostPage />} />
    <Route path="/about" element={<AboutUsPage />} />
    <Route path="/contact" element={<ContactUsPage />} />
    <Route path="/sitemap" element={<SitemapPage />} />
    <Route path="/debug" element={<DebugPage />} />
  </Routes>
</BrowserRouter>
```

**Deployment-Specific**:
- **Vercel** (current): basename `/` - root domain deployment
- **GitHub Pages** (legacy): basename `/babyname2` - subpath deployment

---

## AI & Enrichment Features

### OpenAI GPT-4o-mini Integration

**Status**: ✅ ENABLED

**Batch Processing Strategy**:
- 10 names per API call (10x more efficient than individual requests)
- 1.5 second delay between batches
- Processing speed: ~400 names/minute
- Exponential backoff for rate limit errors (429)

**Enrichment Workflow**:
1. HomePage loads 100 names on mount
2. Background processor enriches 20 names at a time
3. Results cached in name objects
4. Quality validation per-name
5. Progress tracked in localStorage

**Files**:
- `src/services/openaiApiService.ts` - API wrapper
- `src/agents/NameEnrichmentAgent.ts` - Enrichment logic
- `src/components/EnrichmentProcessor.tsx` - React component
- `src/components/MeaningProcessor.tsx` - Meaning-specific processor

### Google Gemini Integration

**Status**: ✅ AVAILABLE (fallback/backup)

**Usage**:
- API key from `REACT_APP_GEMINI_API_KEY`
- Service: `src/services/claudeApiService.ts`
- Used for: AI chat agent, name suggestions

### Unisex Detection Algorithm

**Threshold**: 35% (names with 35-65% gender ratio)

**Process**:
1. Calculate male/female distribution from database
2. Mark names in 35-65% range as unisex
3. Cache results in localStorage
4. Update UI filter buttons

**Service**: `src/services/unisexService.ts`

### Search Priority System

**Three-tier ranking** (located in `nameService.ts:173-204`):

1. **Exact matches** - Full name match (highest priority)
2. **Starts with** - Name begins with search term (alphabetical)
3. **Contains** - Name contains term elsewhere (alphabetical)

**Limit**: 100 results max for performance

---

## Firebase Configuration

**Project ID**: `babynames-app-9fa2a`

**Features**:
- Google Authentication via OAuth 2.0
- Firestore database with offline persistence (IndexedDB)
- Real-time cloud sync
- Security rules (admin check via email)

**Important**: Only ONE browser tab can have active Firestore persistence at a time.

**Config File**: `src/config/firebase.ts`

**Collections**:
```
users/
  {userId}/
    favorites: string[]
    dislikes: string[]
    pinnedFavorites: string[]

votes/
  {voteId}/
    names: string[]
    createdBy: string
    createdAt: timestamp
    votes: { [nameId]: number }

blogPosts/
  {slug}/
    title: string
    content: string
    publishedAt: timestamp
```

---

## Deployment & CI/CD

### Vercel Deployment (CURRENT)

**Status**: ✅ PRODUCTION

**Deployment Speed**: 10-30 seconds

**Live Domains** (all redirect to primary):
- Primary: https://soulseedbaby.com
- soulseed.baby → soulseedbaby.com
- soulseedapp.com → soulseedbaby.com
- soulseedbaby.app → soulseedbaby.com

**Configuration** (`vercel.json`):
- Build command: `npm run build` (auto-detected)
- Output directory: `build/`
- Framework: Create React App (auto-detected)
- Redirects: 301 permanent redirects for all domains
- Headers: Security headers (X-Frame-Options, CSP, etc.)
- Rewrites: SPA fallback to index.html

**Deploy Commands**:
```bash
npm run deploy         # Production deploy
npm run ship           # Alias for deploy
npm run deploy:preview # Preview deploy (test URL)
```

**Features**:
- Edge Network: 100+ global CDN locations
- Automatic HTTPS: SSL certificates for all domains
- Preview Deployments: Every push gets preview URL
- Analytics: Built-in performance monitoring
- Instant Rollbacks: One-click revert

### GitHub Pages (LEGACY)

**URL**: https://amirchason.github.io/babyname2

**Status**: ⚠️ DEPRECATED (use Vercel)

**Deploy Command**: `npm run deploy:github`

**Speed**: 2-3 minutes (vs 10-30 seconds on Vercel)

**GitHub Actions** (`.github/workflows/deploy.yml`):
- Trigger: Push to `master` or `main` branch
- Action: JamesIves/github-pages-deploy-action@v4
- CI: false (ignores build warnings)

---

## Environment Variables

**Required** (see `.env`):

```bash
# Google Services
REACT_APP_GOOGLE_API_KEY          # Google services
REACT_APP_GEMINI_API_KEY          # Gemini AI (React app)
REACT_APP_GOOGLE_CLIENT_ID        # OAuth login
REACT_APP_GOOGLE_CLIENT_SECRET    # OAuth secret

# OpenAI (Node.js scripts ONLY)
OPENAI_API_KEY                    # For enrichment scripts

# Firebase
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID

# Feature Flags
REACT_APP_ENABLE_AI_CHAT=true
REACT_APP_ENABLE_FAVORITES=true
REACT_APP_ENABLE_SCRAPING=true    # Not actively used
REACT_APP_ENABLE_BLOG=false       # Disabled

# Theme Colors
REACT_APP_PRIMARY_COLOR=#D8B2F2   # Light purple
REACT_APP_SECONDARY_COLOR=#FFB3D9 # Light pink
REACT_APP_ACCENT_COLOR=#B3D9FF    # Light blue
```

---

## Performance Optimizations

### Initial Load Strategy
1. **1000 popular names** shown immediately (largeFallbackNames)
2. **Full database** loads in background (chunked)
3. **Code splitting** for lazy-loaded pages (30% faster initial load)
4. **Service worker** enabled with 1-hour cache duration

### Rendering Optimizations
- **Pagination**: 30 names per page (keeps DOM manageable)
- **Virtual scrolling**: `@tanstack/react-virtual` for long lists
- **Hardware-accelerated animations**: CSS transforms for fly effects
- **Lazy loading**: Dynamic imports for pages and heavy components

### Memory Management
- **Node max-old-space-size**: 2048MB (handles large dataset builds)
- **Chunk loading**: Progressive loading reduces initial bundle
- **LRU cache**: Evicts least recently used items
- **Firebase persistence**: One tab at a time to avoid conflicts

### Search & Filtering
- **100 result limit** to prevent DOM bloat
- **Three-tier priority** system (exact → starts → contains)
- **Debounced search** input (300ms delay)
- **Indexed fields** for faster filtering

---

## Known Issues & Technical Debt

### TypeScript Warnings
1. **Framer Motion Variants**: Type mismatch in `NameCard.tsx:163` (ease property)
2. **Filter Context**: Unisex filter type mismatch in `HomePage.tsx:833`
3. **Implicit Any**: Missing type in `chunkedDatabaseService.ts:132`

### Architectural Notes
1. **Database duplicates**: `public/data/` has 53 JSON files (many backups)
2. **Secondary 230k database**: `ultimateNames_tier1.json` is unused
3. **Path aliases broken**: `@/*` imports don't work (use relative imports)
4. **Module resolution**: Always use relative imports (e.g., `../lib/utils`)
5. **optimizedNameService.ts**: Exists but UNUSED (use nameService.ts)

### Firebase Issues
1. **UID vs OAuth ID bug**: Fixed in AuthContext (line 256) - uses Firebase UID
2. **One tab persistence**: Only one browser tab can have active persistence
3. **Rate limits**: Background enrichment may hit API limits with free tier

### GitHub Pages Legacy
- Requires `PUBLIC_URL=/babyname2` and `homepage` in package.json
- 2-3 minute deployment time (vs 10-30 seconds on Vercel)
- No preview deployments
- Limited CDN

---

## Testing

**Status**: ⚠️ NO TESTS WRITTEN

**Framework**: Jest + React Testing Library (installed, configured)

**Configuration**:
- Uses default `react-scripts test` setup
- No custom `jest.config.js` or `setupTests.ts`
- Testing libraries ready to use

**To Add Tests**:
1. Create `*.test.tsx` files in `src/` directory
2. Run with `npm test`
3. Tests auto-detect and run via Jest

---

## Development Tools

### Build Commands
```bash
npm start              # Dev server (localhost:3000)
npm run build          # Production build
npm run lint           # ESLint
npm test               # Jest tests (none written)
npm run eject          # Eject CRA (IRREVERSIBLE)
```

### Data Processing Scripts (Node.js)
```bash
node processTop200.js            # Process top 200 names
node enrichWithGemini.js         # Enrich using Gemini
node enrichWithMini.js           # Enrich using GPT-4-mini
node enrichUnknownOrigins.js     # Process unknown origins
node checkOpenAIStatus.js        # Check OpenAI API
node compareModelQuality.js      # Compare AI models
node cleanDatabase.js            # Clean database
```

**Note**: 47 Python scripts in `scripts/` (13,128 lines) for data processing - mostly one-off utilities.

### Backup Strategy

**Default location**: `/storage/emulated/0/Download/backupapp/`

**Backup command**:
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S) && \
tar -czf /storage/emulated/0/Download/backupapp/babyname2-backup-${TIMESTAMP}.tar.gz \
  --exclude='node_modules' --exclude='.git' --exclude='build' \
  --exclude='*.log' --exclude='*.tar.gz' .
```

**Excludes**: node_modules, .git, build, logs, old tarballs

---

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- Explicit return types preferred
- Interface over type (for objects)
- Enum for fixed constants

### React
- Functional components only (no class components)
- Hooks for state management
- Context API for global state
- Lazy loading for heavy components

### CSS/Tailwind
- Utility-first approach
- Custom colors in tailwind.config.js
- CSS modules for component-specific styles
- Framer Motion for animations

### File Organization
```
src/
  agents/          # AI agents
  components/      # Reusable React components
    ui/            # UI primitives
  contexts/        # Context providers
  hooks/           # Custom React hooks
  pages/           # Page components
  services/        # Business logic & API calls
  types/           # TypeScript type definitions
  utils/           # Utility functions
  config/          # Configuration files
  data/            # Static data files
```

---

## Security Considerations

### Authentication
- Google OAuth 2.0 with JWT validation
- Firebase UID used for Firestore (not OAuth ID)
- Admin users identified by email in `adminConfig.ts`
- Guest mode available without authentication

### Headers (Vercel)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Cache-Control: public, max-age=31536000, immutable (for /static/*)
```

### Data Protection
- No sensitive data in localStorage
- Firebase security rules restrict writes
- Admin features require authentication
- API keys in environment variables (not committed)

---

## Dependencies Overview

### Production Dependencies (39 total)
**Major**:
- react: 19.1.1
- react-router-dom: 7.9.1
- firebase: 12.3.0
- @google/generative-ai: 0.24.1
- tailwindcss: 3.4.17
- framer-motion: 12.23.19

**Notable**:
- @react-oauth/google: 0.12.2 (Google sign-in)
- @tanstack/react-virtual: 3.13.12 (virtual scrolling)
- html2canvas: 1.4.1 (screenshots)
- canvas-confetti: 1.9.3 (celebrations)
- jwt-decode: 4.0.0 (token parsing)
- axios: 1.12.2 (HTTP client)

### Dev Dependencies (8 total)
- @types/react: 19.1.9
- @types/react-dom: 19.1.9
- autoprefixer: 10.4.21
- postcss: 8.5.6
- tailwindcss: 3.4.17
- gh-pages: 6.3.0
- marked: 16.4.0

---

## Browser Compatibility

**Production Target**:
```
>0.2%
not dead
not op_mini all
```

**Development Target**:
```
last 1 chrome version
last 1 firefox version
last 1 safari version
```

**Features Requiring Polyfills**:
- None (modern browsers only)

**Minimum Supported Versions**:
- Chrome: 90+
- Firefox: 88+
- Safari: 14+
- Edge: 90+

---

## Documentation Index

**Core Docs**:
- `CLAUDE.md` - Claude Code guide (this file's companion)
- `README.md` - Public-facing project description
- `SESSION_LOG.md` - Recent session notes and changes

**Deployment Docs**:
- `QUICK_DEPLOY.md` - Quick reference for Vercel
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete Vercel guide
- `CONTINUE_FROM_HERE.md` - Current deployment status

**Feature Docs** (`docs/`):
- `LIST_MODES.md` - LIST1 MODE documentation
- `DATABASE_VIEWER_FEATURE.md` - Database viewer
- `ADMIN_SCREENSHOT_FEATURE.md` - Screenshot feature
- `SEO_IMPLEMENTATION.md` - SEO strategy
- `PERFORMANCE_OPTIMIZATION_2025-10-18.md` - Performance guide

**Reference Docs**:
- `LIST1_MODE_REFERENCE.md` - Quick LIST1 reference
- `ADMIN_QUICK_REFERENCE.md` - Admin features guide
- `MCP_SETUP.md` - MCP server configuration
- `GOOGLE_AUTH_SETUP.md` - OAuth setup guide

---

## Future Enhancements

**Planned Features** (see `todos.md`):
1. Comprehensive test suite (Jest + RTL)
2. Progressive Web App (PWA) with offline mode
3. Multi-language support (i18n)
4. Advanced analytics dashboard
5. Social sharing improvements
6. AI chat agent enhancements
7. More themed lists (nature, vintage, modern, etc.)

**Technical Improvements**:
1. Migrate to Vite (faster builds)
2. Implement Service Worker for offline support
3. Add E2E tests (Playwright/Cypress)
4. Optimize bundle size (tree shaking, code splitting)
5. Implement A/B testing framework
6. Add monitoring/error tracking (Sentry)

---

**Last Updated**: 2025-10-19
**Document Version**: 1.0
**Maintained By**: Claude Code AI Assistant
