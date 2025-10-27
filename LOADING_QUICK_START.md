# Loading Animation - Quick Start Guide

## 🚀 TL;DR - Copy & Paste

### Import
```tsx
import { useLoading } from '../contexts/LoadingContext';
```

### Use
```tsx
const { withLoading } = useLoading();

// Wrap any async operation
await withLoading(
  yourAsyncFunction(),
  'Your custom message...'
);
```

## 📋 Common Patterns

### Pattern 1: Search/Filter
```tsx
const { withLoading } = useLoading();

const handleSearch = async (query: string) => {
  const results = await withLoading(
    nameService.searchNames(query),
    'Searching 174k names...'
  );
  setResults(results);
};
```

### Pattern 2: Data Loading
```tsx
const { withLoading } = useLoading();

useEffect(() => {
  withLoading(
    async () => {
      const data = await fetchData();
      setData(data);
    },
    'Loading your favorites...'
  );
}, []);
```

### Pattern 3: Save/Update
```tsx
const { withLoading } = useLoading();

const handleSave = async () => {
  await withLoading(
    saveFavorites(names),
    'Saving your favorites...'
  );
};
```

## 💬 Message Templates

### Search Operations
- `'Searching 174k beautiful names...'`
- `'Finding perfect matches...'`
- `'Exploring name meanings...'`

### Favorites/Lists
- `'Loading your favorites...'`
- `'Saving your collection...'`
- `'Updating your list...'`

### Authentication/Sync
- `'Signing in and syncing data...'`
- `'Syncing with cloud...'`
- `'Saving to your account...'`

### AI/Enrichment
- `'Generating AI insights...'`
- `'Discovering name origins...'`
- `'Enriching name data...'`

### General
- `'Finding your perfect name...'` (default)
- `'Just a moment...'`
- `'Almost there...'`

## ✅ Best Practices

```tsx
// ✅ GOOD - Automatic cleanup
await withLoading(asyncOp(), 'Message...');

// ❌ BAD - Manual cleanup (error-prone)
showLoading('Message...');
await asyncOp();
hideLoading();
```

## 🎨 Inline Loading (Optional)

```tsx
import LoadingAnimation from '../components/LoadingAnimation';

function MyComponent() {
  const [loading, setLoading] = useState(false);

  return loading ? (
    <LoadingAnimation
      fullScreen={false}
      message="Loading..."
    />
  ) : (
    <div>Content</div>
  );
}
```

## 📚 Full Documentation

- **Usage Guide**: `LOADING_ANIMATION_USAGE.md`
- **Summary**: `LOADING_ANIMATION_SUMMARY.md`
- **Demo Component**: `src/components/LoadingAnimationDemo.tsx`

---

**That's it!** Just import `useLoading`, use `withLoading`, and enjoy the beautiful loading animation.
