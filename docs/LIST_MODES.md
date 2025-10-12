# List Modes Documentation

This document defines the different list display modes available on the HomePage and their features.

---

## 📋 LIST1 MODE (Current Default)

**Description**: The original, feature-rich name browsing experience with comprehensive filtering and sorting options.

### Features Overview

#### 1. **Display Components**
- **View Modes**:
  - Grid view (NameCard component) - Cards in responsive grid
  - List view (NameCardCompact component) - Compact rows with borders
- **Pagination**: 30 items per page with smart page controls
- **Item Count Display**: Shows "X-Y of Z" results

#### 2. **Gender Filters** (Primary Filter Bar)
Location: Above name list
- All names
- Boys (male)
- Girls (female)
- Unisex

#### 3. **Smart Filters Drawer** (Advanced Filters)
Location: Tabbed bottom drawer modal

**5 Filter Categories**:

##### a) **Origin Filter**
- Filter by cultural origin (e.g., English, Spanish, Arabic)
- Shows top 9 origins initially
- "Show More" accordion for additional origins
- Badge format with Globe icon and count
- Multi-select (Set of strings)

##### b) **Letter Filter**
- Filter by starting letter (A-Z)
- 7-column grid of letter buttons
- Multi-select (Set of strings)

##### c) **Length Filter**
- Short (3-4 letters)
- Medium (5-7 letters)
- Long (8+ letters)
- Icon-based buttons (Minimize2, Ruler, Maximize2)
- Multi-select (Set of strings)

##### d) **Syllable Filter**
- 1 syllable (e.g., "Max, Jade")
- 2 syllables (e.g., "Emma, Noah")
- 3 syllables (e.g., "Olivia, Benjamin")
- 4+ syllables (e.g., "Isabella")
- Circular number badges
- Multi-select (Set of numbers)

##### e) **Ending Filter**
- Popular endings: -a, -en, -son, -lyn, -er, -ie, -el, -ia, -elle, -ette, -yn
- 2-column grid with Sparkles icon
- Shows example names
- Multi-select (Set of strings)

**Filter Controls**:
- "Clear All" button (shows count when filters active)
- Active filter count badge on main Filter button
- Tab navigation with filter count badges

#### 4. **Sorting Options** (Compact Toolbar)
- **Popular**: Sort by popularity rank (toggleable ascending/descending)
- **A→Z**: Alphabetical sort (toggleable Z→A)
- **Shuffle**: Random order (re-shuffles on each click)

#### 5. **Additional Features**
- Search bar (expandable from header)
- View mode toggle (Grid/List)
- Quick page jump input (for large datasets)
- Smart pagination with ellipsis for large page counts
- Fly-away animations on like/dislike
- Real-time filtering with preserved search order

### State Variables (HomePage.tsx)

```typescript
// Primary filter
const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');

// Sort
const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
const [sortReverse, setSortReverse] = useState(false);

// View
const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');

// Advanced filters
const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(new Set());
const [selectedStartLetters, setSelectedStartLetters] = useState<Set<string>>(new Set());
const [selectedEndings, setSelectedEndings] = useState<Set<string>>(new Set());
const [selectedSyllables, setSelectedSyllables] = useState<Set<number>>(new Set());
const [selectedLengths, setSelectedLengths] = useState<Set<string>>(new Set());

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(30);
```

### Code Location

**File**: `/src/pages/HomePage.tsx`

**Sections**:
- Lines 607-999: Smart Filters Drawer (Tabbed UI)
- Lines 1002-1413: Names Grid Section
  - Lines 1016-1057: Gender Filter Buttons
  - Lines 1059-1175: Sorting Controls & View Toggle
  - Lines 1197-1275: Name Card Rendering (Grid/List)
  - Lines 1277-1409: Pagination Controls

### Visual Design

**Color Scheme**: Purple/Pink gradient theme
- Active filters: `bg-gradient-to-r from-purple-600 to-pink-600`
- Hover states: `hover:bg-purple-50` with `hover:border-purple-300`
- Selected states: White text on gradient background

**Layout**:
- Full-width responsive design
- Bottom drawer for filters (85vh max height)
- Grid/List toggle for different viewing preferences
- Compact toolbar with ultra-small font sizes (11px, 9px)

### Future List Mode Ideas

When adding **list2 mode**, **list3 mode**, etc., consider:

1. **list2 mode**: Simplified browsing
   - No advanced filters
   - Only gender filter + sort
   - Larger cards, fewer options
   - Focus on discovery over precision

2. **list3 mode**: Expert mode
   - All list1 filters PLUS:
   - Name length slider (exact characters)
   - Popularity range slider
   - Country/region filter
   - Meaning/origin keyword search
   - Custom sort criteria

3. **list4 mode**: Curated collections
   - Pre-defined lists (e.g., "Vintage Names", "Nature Names", "Celebrity Names")
   - No filters, just browse collections
   - Swipeable carousel format

### Implementation Notes

To add a new list mode:

1. Add state variable: `const [listMode, setListMode] = useState<'list1' | 'list2' | 'list3'>('list1');`
2. Create separate components for each mode's UI
3. Add mode selector in header or as tabs
4. Persist user's preferred mode in localStorage
5. Document new mode in this file

---

*Last updated: 2025-10-10*
*Current active mode: list1*
