# LIST1 MODE - Quick Reference Guide

**Current Status**: ✅ ACTIVE (Default mode)
**Full Documentation**: See `docs/LIST_MODES.md`

---

## What is LIST1 MODE?

The comprehensive name browsing experience with:
- 5-tab Smart Filters drawer (Origin, Letter, Length, Syllables, Ending)
- Gender filters (All, Boys, Girls, Unisex)
- 3 sorting options (Popular, A→Z, Shuffle)
- View toggle (Grid/List)
- Advanced pagination with quick jump
- 30 items per page

---

## Code Location Map

### HomePage.tsx

| Component | Lines | Description |
|-----------|-------|-------------|
| **State Variables** | 43-61 | All LIST1 MODE state declarations |
| **Smart Filters Drawer** | 613-1011 | 5-tab modal with all advanced filters |
| **Names Grid Section** | 1014-1432 | Main content area |
| ↳ Gender Buttons | 1034-1076 | All/Boys/Girls/Unisex filters |
| ↳ Sort Toolbar | 1078-1194 | Popular/A-Z/Shuffle + Filters + View toggle |
| ↳ Grid/List Cards | 1215-1293 | Name card rendering |
| ↳ Pagination | 1297-1428 | Page controls with quick jump |

### Components Used

- `NameCard.tsx` - Grid view cards
- `NameCardCompact.tsx` - List view rows
- `NameDetailModal.tsx` - Name details popup

### Icons (Lucide React)

- **Origin**: `Globe`
- **Letter**: `Type`
- **Length**: `Ruler`, `Minimize2`, `Maximize2`
- **Syllables**: `Music`
- **Ending**: `Sparkles`
- **Sort**: `Trophy`, `ArrowDownAZ`, `Dices`
- **View**: `LayoutGrid`, `List`
- **Filter**: `Filter`

---

## Key State Variables

```typescript
// View mode
const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');

// Gender filter
const [activeFilter, setActiveFilter] = useState<'all' | 'male' | 'female' | 'unisex'>('all');

// Sort
const [sortBy, setSortBy] = useState<'popularity' | 'alphabetical' | 'random'>('popularity');
const [sortReverse, setSortReverse] = useState(false);

// Smart Filters (5 categories)
const [selectedOrigins, setSelectedOrigins] = useState<Set<string>>(new Set());
const [selectedStartLetters, setSelectedStartLetters] = useState<Set<string>>(new Set());
const [selectedEndings, setSelectedEndings] = useState<Set<string>>(new Set());
const [selectedSyllables, setSelectedSyllables] = useState<Set<number>>(new Set());
const [selectedLengths, setSelectedLengths] = useState<Set<string>>(new Set());

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(30);
```

---

## Filter Logic Flow

1. **Apply gender filter** → `activeFilter` state
2. **Apply smart filters** → 5 Set-based filters (origin, letter, ending, syllable, length)
3. **Apply sorting** → `sortBy` + `sortReverse` states
4. **Apply pagination** → Slice results by page
5. **Render** → NameCard (grid) or NameCardCompact (list)

All filtering happens in `useEffect` at **line 285-374** in HomePage.tsx.

---

## Adding LIST2 MODE in the Future

To add a new list mode:

1. **Add state**: `const [listMode, setListMode] = useState<'list1' | 'list2'>('list1');`
2. **Create mode selector** in header or tabs
3. **Conditionally render** based on `listMode`:
   ```tsx
   {listMode === 'list1' && <List1Component />}
   {listMode === 'list2' && <List2Component />}
   ```
4. **Save preference** to localStorage
5. **Document** new mode in `docs/LIST_MODES.md`

---

## Visual Design

- **Primary colors**: Purple-Pink gradient (`from-purple-600 to-pink-600`)
- **Active states**: White text on gradient background
- **Hover states**: `hover:bg-purple-50` + `hover:border-purple-300`
- **Font sizes**: Ultra-compact (`text-[11px]`, `text-[9px]` for counts)
- **Layout**: Full-width responsive, compact spacing

---

**Last updated**: 2025-10-10
**Questions?** See `docs/LIST_MODES.md` or search for `LIST1 MODE` comments in `HomePage.tsx`
