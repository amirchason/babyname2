# Swipe-Off Animation Feature

## Overview
Added snappy swipe-off animations to the curated names lists page (BabyNameListsPage). When a name is liked, it smoothly swipes off the screen to the right, and the remaining names close the gap with a smooth animation.

## Implementation Date
2025-10-12

## Files Modified
1. `/src/components/ThemedListAccordion.tsx` - Core accordion component for themed lists
2. `/src/pages/BabyNameListsPage.tsx` - Main curated lists page

## Technical Details

### Key Features
1. **Swipe-off Animation**: When a name is liked (heart button clicked), the card:
   - Slides 400px to the right
   - Rotates 30 degrees
   - Fades out (opacity 0)
   - Scales down to 0.7x
   - Duration: 0.3 seconds with easeOut timing

2. **Smooth Gap Closing**: Remaining cards automatically fill the gap using Framer Motion's `layout` prop:
   - Duration: 0.3 seconds with easeInOut timing
   - No jarring jumps or repositioning
   - Works in both grid and list views

3. **State Management**:
   - Added `removedNames` Set to track which names have been removed
   - Names are filtered out from the displayed list after being liked
   - Removed names don't reappear even when filters change

### Animation Details

#### Exit Animation (Swipe-off)
```typescript
exit={{
  x: 400,           // Slide 400px right
  rotate: 30,       // Rotate 30 degrees clockwise
  opacity: 0,       // Fade to invisible
  scale: 0.7,       // Shrink to 70% size
  transition: { duration: 0.3, ease: "easeOut" }
}}
```

#### Layout Animation (Gap Closing)
```typescript
layout              // Enable automatic layout animations
transition={{
  layout: { duration: 0.3, ease: "easeInOut" }
}}
```

### Components Updated

#### ThemedListAccordion.tsx
- Added `removedNames` state to track removed cards
- Added `handleNameRemove()` function to add names to removed set
- Wrapped both grid and list views with `<AnimatePresence mode="popLayout">`
- Added `layout` prop to motion.div wrappers
- Added `exit` animation for swipe-off effect
- Connected `onFavoriteToggle` callback to `handleNameRemove`

#### BabyNameListsPage.tsx
- Same changes as ThemedListAccordion for the "Matching Names" section
- Ensures consistent animation behavior across all name displays

### Why This Approach?

1. **Performance**: Using `AnimatePresence` with `popLayout` mode ensures:
   - Only exiting elements animate out
   - Remaining elements smoothly reposition
   - No unnecessary re-renders

2. **User Experience**:
   - Fast 0.3s animation feels snappy, not sluggish
   - Visual feedback confirms the action
   - Smooth gap closing feels polished

3. **Consistency**: Same animation system used in:
   - Grid view (card layout)
   - List view (compact layout)
   - Both ThemedListAccordion and BabyNameListsPage

## Usage

### How It Works
1. User clicks the heart button on a name card
2. `onFavoriteToggle` callback is triggered
3. `handleNameRemove(name.name)` adds the name to `removedNames` Set
4. Name is filtered out from `filteredNames` array
5. Framer Motion detects the removal and triggers exit animation
6. Other cards smoothly reposition using layout animation

### Timing
- **Swipe-off**: 0.3 seconds
- **Gap closing**: 0.3 seconds (simultaneous)
- **Total perceived animation**: ~0.3-0.4 seconds

## Testing Recommendations

1. **Grid View**:
   - Like a name in the middle of the grid
   - Verify smooth gap closing in all directions

2. **List View**:
   - Like a name in a compact list
   - Verify smooth upward shift of items below

3. **Multiple Rapid Likes**:
   - Click multiple hearts quickly
   - Verify animations don't conflict or stutter

4. **Edge Cases**:
   - Like the last name on a page
   - Like all visible names
   - Change filters after removing names (removed names should stay hidden)

## Future Enhancements

1. **Undo Feature**: Add a toast notification with "Undo" button to restore removed names
2. **Reset Button**: Add a button to clear the removed names set and show all names again
3. **Persistence**: Save removed names to localStorage so they stay hidden across sessions
4. **Custom Animations**: Allow users to choose animation direction (left/right/up/down)

## Related Files
- `/src/components/NameCard.tsx` - Already has fly-away animation on like/dislike
- `/src/pages/SwipeModePage.tsx` - Uses similar swipe animations for Tinder-style cards
- `/src/pages/HomePage.tsx` - Could benefit from same animation treatment

## Notes
- Animation is disabled during CSS transitions to prevent conflicts
- Uses Framer Motion's built-in layout animations for smooth repositioning
- No impact on favorites/dislikes service - animations are purely visual
- Works seamlessly with existing like counter and cloud sync features

---
*Implemented: 2025-10-12*
*Animation Duration: 0.3s*
*Animation Style: Fast, snappy, smooth*
