# Loading Animation Usage Guide

## Overview
The SoulSeed app now includes a beautiful, hypnotizing baby-themed loading animation that displays during async operations. The animation features:
- 💜 Pulsing gradient heart with glow effects
- ✨ Twinkling stars rotating around the center
- 🌸 Gentle falling petals
- 📝 Floating baby-themed words (Love, Joy, Dream, etc.)
- 🎨 Morphing gradient orbs in the background
- 🔵 Bouncing loading dots
- 💭 Customizable loading messages

## Global Integration

The loading system is already integrated globally via `LoadingProvider` in `App.tsx`:

```tsx
<LoadingProvider>
  <AuthProvider>
    <NameCacheProvider>
      {/* Your app */}
    </NameCacheProvider>
  </AuthProvider>
</LoadingProvider>
```

## Usage Examples

### 1. Basic Usage - Show/Hide Loading

```tsx
import { useLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const { showLoading, hideLoading } = useLoading();

  const handleClick = async () => {
    showLoading('Searching for names...');

    try {
      // Your async operation
      await fetchData();
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleClick}>Load Data</button>;
}
```

### 2. Recommended Usage - withLoading Wrapper

The `withLoading` method automatically handles show/hide and ensures cleanup:

```tsx
import { useLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const { withLoading } = useLoading();

  const handleSearch = async (query: string) => {
    const results = await withLoading(
      searchNames(query),
      'Finding perfect names...'
    );

    // Results are returned, loading is automatically hidden
    setSearchResults(results);
  };

  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      placeholder="Search names"
    />
  );
}
```

### 3. Convenience Hook - useAsyncWithLoading

For even cleaner code:

```tsx
import { useAsyncWithLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const asyncWithLoading = useAsyncWithLoading();

  const loadFavorites = async () => {
    await asyncWithLoading(
      async () => {
        const favorites = await fetchFavorites();
        setFavorites(favorites);
      },
      'Loading your favorites...'
    );
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return <div>{/* ... */}</div>;
}
```

### 4. Custom Messages

You can customize the loading message for different operations:

```tsx
const { withLoading } = useLoading();

// Search operation
await withLoading(searchNames(query), 'Searching 174k names...');

// Save operation
await withLoading(saveFavorites(names), 'Saving your favorites...');

// Sync operation
await withLoading(syncWithCloud(), 'Syncing with cloud...');

// AI enrichment
await withLoading(enrichName(name), 'Generating AI insights...');

// Default message (if not specified)
await withLoading(someOperation()); // "Finding your perfect name..."
```

### 5. Inline Loading Animation

For local loading states (not full-screen):

```tsx
import LoadingAnimation from '../components/LoadingAnimation';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      {isLoading ? (
        <LoadingAnimation
          fullScreen={false}
          message="Loading favorites..."
        />
      ) : (
        <div>{/* Your content */}</div>
      )}
    </div>
  );
}
```

## Best Practices

### ✅ DO:
- Use `withLoading()` for async operations - it handles cleanup automatically
- Provide contextual messages for different operations
- Use the global context for site-wide loading states
- Use inline variant for component-specific loading

### ❌ DON'T:
- Forget to call `hideLoading()` if using manual show/hide
- Nest multiple loading states (the context handles stacking)
- Use for instant operations (< 200ms) - it will flash

## Loading Message Ideas

Here are some suggested messages for different operations:

```tsx
// Search
'Searching 174k beautiful names...'
'Finding your perfect match...'
'Exploring name meanings...'

// Favorites
'Saving your favorites...'
'Loading your collection...'
'Updating your list...'

// Sync
'Syncing with cloud...'
'Saving to your account...'
'Merging your data...'

// AI/Enrichment
'Generating AI insights...'
'Discovering name origins...'
'Enriching name data...'

// General
'Finding your perfect name...' // Default
'Just a moment...'
'Almost there...'
```

## Advanced: Multiple Concurrent Loading States

The context automatically handles multiple concurrent loading operations:

```tsx
const { withLoading } = useLoading();

// Both operations run concurrently, loading stays visible
await Promise.all([
  withLoading(fetchFavorites(), 'Loading favorites...'),
  withLoading(fetchDislikes(), 'Loading dislikes...')
]);

// Loading hides only after BOTH complete
```

The last message shown wins (most recent operation's message).

## Integration Points in SoulSeed

Recommended places to integrate the loading animation:

### HomePage.tsx
```tsx
// Search operations
const handleSearch = async (query: string) => {
  const results = await withLoading(
    nameService.searchNames(query),
    'Searching 174k names...'
  );
  setFilteredNames(results);
};

// Filter changes
const handleFilterChange = async (filters: FilterState) => {
  const results = await withLoading(
    nameService.getFilteredNames(filters),
    'Applying filters...'
  );
  setFilteredNames(results);
};
```

### FavoritesPage.tsx
```tsx
// Loading favorites
useEffect(() => {
  withLoading(
    async () => {
      const favs = await favoritesService.getFavorites();
      setFavorites(favs);
    },
    'Loading your favorites...'
  );
}, []);
```

### SwipeModePage.tsx
```tsx
// Loading swipe stack
const initializeSwipeStack = async () => {
  const stack = await withLoading(
    swipeService.generateStack(preferences),
    'Creating your swipe stack...'
  );
  setSwipeStack(stack);
};
```

### AuthContext.tsx
```tsx
// Login/Sync operations
const handleLogin = async () => {
  await withLoading(
    async () => {
      await loginUser();
      await syncUserData();
    },
    'Signing in and syncing data...'
  );
};
```

## Animation Customization

The animation is built with Framer Motion and uses brand colors:
- Purple: `#D8B2F2`
- Pink: `#FFB3D9`
- Blue: `#B3D9FF`

To customize animations, edit `/src/components/LoadingAnimation.tsx`:

```tsx
// Adjust animation speeds
const heartPulse = {
  scale: [1, 1.2, 1],
  opacity: [0.6, 1, 0.6],
  // Change duration here:
  transition: { duration: 1.5 }
};

// Change floating words
const floatingWords = [
  'Love', 'Joy', 'Dream', // Add your words
];

// Adjust colors
const colors = {
  purple: '#D8B2F2',
  pink: '#FFB3D9',
  blue: '#B3D9FF',
};
```

## Troubleshooting

### Loading doesn't hide
```tsx
// ❌ BAD - loading stays visible if error thrown
showLoading();
await fetchData(); // might throw
hideLoading(); // never called!

// ✅ GOOD - always cleaned up
try {
  showLoading();
  await fetchData();
} finally {
  hideLoading(); // always called
}

// ✅ BEST - automatic cleanup
await withLoading(fetchData());
```

### Loading flashes too quickly
```tsx
// Add minimum display time
const withMinimumDisplay = async (promise: Promise<any>, minTime = 500) => {
  const [result] = await Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, minTime))
  ]);
  return result;
};

await withLoading(
  withMinimumDisplay(fetchData()),
  'Loading...'
);
```

## Testing

The loading animation is automatically shown during Suspense fallbacks in `App.tsx`:

```tsx
<Suspense fallback={<LoadingAnimation fullScreen message="Loading page..." />}>
  {/* Lazy-loaded pages */}
</Suspense>
```

To test manually:
1. Navigate to any page
2. Open DevTools
3. Throttle network to "Slow 3G"
4. Trigger a data operation
5. Observe the beautiful loading animation!

## Performance

The animation is optimized for performance:
- Uses CSS transforms (GPU-accelerated)
- Framer Motion optimizes animation frame rates
- Gradients use `blur-3xl` for smooth rendering
- All animations respect `prefers-reduced-motion`

---

**Created**: 2025-10-27
**Last Updated**: 2025-10-27
**Version**: 1.0.0
