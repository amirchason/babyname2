import { NameEntry } from './nameService';
import userDataService, { UserPreferences } from './userDataService';

interface FavoritesData {
  favorites: string[]; // Array of name strings (liked names)
  dislikes: string[];  // Array of name strings (disliked/hidden names)
  pinnedFavorites?: string[]; // Array of pinned favorite names (shown at top)
  likeCounts?: { [name: string]: number }; // Like counts for each favorite name
}

class FavoritesService {
  private readonly STORAGE_KEY = 'babynames_preferences';
  private readonly MAX_PINNED_FAVORITES = 20; // Maximum number of pinned favorites
  private readonly STORAGE_DEBOUNCE_DELAY = 500; // 500ms debounce for localStorage writes
  private readonly PERIODIC_SYNC_INTERVAL = 360000; // 6 minutes periodic sync
  private data: FavoritesData = {
    favorites: [],
    dislikes: [],
    pinnedFavorites: [],
    likeCounts: {}
  };
  private isLoggedIn: boolean = false;
  private userId: string | null = null;
  private isClearingData: boolean = false; // Flag to prevent cloud sync during clear operations
  private isDirty: boolean = false; // Flag to track if data needs syncing
  private periodicSyncInterval: NodeJS.Timeout | null = null; // 6-minute periodic sync timer
  private storageTimeout: NodeJS.Timeout | null = null; // Debounce timer for localStorage writes

  constructor() {
    this.loadFromStorage();
    this.setupCloudSync();
    this.startPeriodicSync();
  }

  private setupCloudSync() {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.isLoggedIn = true;
      this.userId = userData.id;
    }
  }

  // Start periodic sync (every 6 minutes)
  private startPeriodicSync() {
    // Clear any existing interval
    if (this.periodicSyncInterval) {
      clearInterval(this.periodicSyncInterval);
    }

    // Set up 6-minute periodic sync
    this.periodicSyncInterval = setInterval(async () => {
      // Only sync if logged in, has unsaved changes, and not currently clearing
      if (this.isLoggedIn && this.userId && this.isDirty && !this.isClearingData) {
        console.log('[FavoritesService] Periodic sync triggered (6 min)');
        try {
          await userDataService.saveToCloud(
            this.data.favorites,
            this.data.dislikes,
            this.data.pinnedFavorites,
            this.data.likeCounts,
            true  // silent = true (periodic sync is background)
          );
          this.isDirty = false; // Clear dirty flag after successful sync
          console.log('[FavoritesService] Periodic sync completed');
        } catch (error) {
          console.error('[FavoritesService] Periodic sync failed:', error);
          // Keep dirty flag set so it retries next interval
        }
      }
    }, this.PERIODIC_SYNC_INTERVAL);
  }

  // Stop periodic sync (cleanup)
  private stopPeriodicSync() {
    if (this.periodicSyncInterval) {
      clearInterval(this.periodicSyncInterval);
      this.periodicSyncInterval = null;
    }
  }

  setUserContext(userId: string | null) {
    console.log('[FavoritesService] Setting user context:', userId);
    this.userId = userId;
    this.isLoggedIn = !!userId;
    console.log('[FavoritesService] User context set - isLoggedIn:', this.isLoggedIn);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Normalize all names to ensure consistency (trim and filter out empty)
        this.data = {
          favorites: (parsed.favorites || []).map((n: string) => n.trim()).filter((n: string) => n.length > 0),
          dislikes: (parsed.dislikes || []).map((n: string) => n.trim()).filter((n: string) => n.length > 0),
          pinnedFavorites: (parsed.pinnedFavorites || []).map((n: string) => n.trim()).filter((n: string) => n.length > 0),
          likeCounts: parsed.likeCounts || {}
        };
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      this.data = { favorites: [], dislikes: [], pinnedFavorites: [], likeCounts: {} };
    }
  }

  private saveToStorage(): void {
    // Debounce localStorage writes to batch rapid changes (prevents UI blocking)
    if (this.storageTimeout) {
      clearTimeout(this.storageTimeout);
    }

    this.storageTimeout = setTimeout(() => {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        // Mark data as dirty (needs syncing on next periodic sync)
        if (this.isLoggedIn && this.userId) {
          this.isDirty = true;
        }
      } catch (error) {
        console.error('Error saving favorites to storage:', error);
      }
      this.storageTimeout = null;
    }, this.STORAGE_DEBOUNCE_DELAY);
  }

  // Flush any pending sync immediately (used during logout)
  async flushPendingSync(): Promise<void> {
    // Clear any pending debounced localStorage write
    if (this.storageTimeout) {
      clearTimeout(this.storageTimeout);
      this.storageTimeout = null;
    }

    // Immediately save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('[FavoritesService] Error flushing localStorage:', error);
    }

    // Immediately save to cloud if logged in
    if (this.isLoggedIn && this.userId) {
      try {
        await userDataService.saveToCloud(
          this.data.favorites,
          this.data.dislikes,
          this.data.pinnedFavorites,
          this.data.likeCounts,
          false  // silent = false (logout shows sync animation)
        );
        this.isDirty = false; // Clear dirty flag after successful sync
        console.log('[FavoritesService] Pending sync flushed successfully');
      } catch (error) {
        console.error('[FavoritesService] Error flushing pending sync:', error);
        throw error;
      }
    }
  }

  // Favorites (Liked names) methods
  addFavorite(name: string): void {
    const normalizedName = name.trim();
    if (!normalizedName) return;
    if (!this.isFavorite(normalizedName)) {
      // Remove from dislikes if it was there
      this.removeDislikes(normalizedName);
      // Add to favorites
      this.data.favorites.push(normalizedName);
      this.saveToStorage();

      // Dispatch custom event for heart animation
      window.dispatchEvent(new CustomEvent('favoriteAdded', { detail: { name: normalizedName } }));
      // Dispatch storage event to update counters
      window.dispatchEvent(new Event('storage'));
    }
  }

  removeFavorite(name: string): void {
    const normalizedName = name.trim();
    const index = this.data.favorites.findIndex(f => f.trim() === normalizedName);
    if (index > -1) {
      this.data.favorites.splice(index, 1);
      this.saveToStorage();
      // Dispatch custom event for blog name list animations
      window.dispatchEvent(new CustomEvent('favoriteRemoved', { detail: { name: normalizedName } }));
      // Dispatch storage event to update counters
      window.dispatchEvent(new Event('storage'));
    }
  }

  // Move a favorite up one position in the ranking
  moveFavoriteUp(name: string): boolean {
    const normalizedName = name.trim();
    const index = this.data.favorites.findIndex(f => f.trim() === normalizedName);

    // Can't move up if not found or already at top
    if (index <= 0) return false;

    // Swap with the item above it
    [this.data.favorites[index - 1], this.data.favorites[index]] =
    [this.data.favorites[index], this.data.favorites[index - 1]];

    this.saveToStorage();
    return true;
  }

  isFavorite(name: string): boolean {
    const normalizedName = name.trim();
    return this.data.favorites.some(f => f.trim() === normalizedName);
  }

  getFavorites(): string[] {
    return [...this.data.favorites];
  }

  // Pinned favorites methods
  pinFavorite(name: string): { success: boolean; message?: string } {
    const normalizedName = name.trim();
    if (!normalizedName) return { success: false };

    // Check if we're at the limit
    if (!this.isPinned(normalizedName)) {
      if ((this.data.pinnedFavorites?.length || 0) >= this.MAX_PINNED_FAVORITES) {
        return {
          success: false,
          message: `You can only pin up to ${this.MAX_PINNED_FAVORITES} names. Please unpin a name to add another.`
        };
      }
    }

    // Must be a favorite to pin
    if (!this.isFavorite(normalizedName)) {
      this.addFavorite(normalizedName);
    }

    // Add to pinned if not already
    if (!this.isPinned(normalizedName)) {
      if (!this.data.pinnedFavorites) {
        this.data.pinnedFavorites = [];
      }
      this.data.pinnedFavorites.push(normalizedName);
      this.saveToStorage();
    }

    return { success: true };
  }

  unpinFavorite(name: string): void {
    const normalizedName = name.trim();
    if (!this.data.pinnedFavorites) return;

    const index = this.data.pinnedFavorites.findIndex(p => p.trim() === normalizedName);
    if (index > -1) {
      this.data.pinnedFavorites.splice(index, 1);
      this.saveToStorage();
    }
  }

  isPinned(name: string): boolean {
    if (!this.data.pinnedFavorites) return false;
    const normalizedName = name.trim();
    return this.data.pinnedFavorites.some(p => p.trim() === normalizedName);
  }

  togglePin(name: string): { success: boolean; pinned: boolean; message?: string } {
    if (this.isPinned(name)) {
      this.unpinFavorite(name);
      return { success: true, pinned: false };
    } else {
      const result = this.pinFavorite(name);
      return {
        success: result.success,
        pinned: result.success,
        message: result.message
      };
    }
  }

  getPinnedFavorites(): string[] {
    return [...(this.data.pinnedFavorites || [])];
  }

  getPinnedCount(): number {
    return this.data.pinnedFavorites?.length || 0;
  }

  getMaxPinnedFavorites(): number {
    return this.MAX_PINNED_FAVORITES;
  }

  // Like count methods
  incrementLikeCount(name: string): number {
    const normalizedName = name.trim();
    if (!this.data.likeCounts) {
      this.data.likeCounts = {};
    }

    const currentCount = this.data.likeCounts[normalizedName] || 0;
    // If this is the first like and name is already favorited, start at 1, otherwise increment
    if (currentCount === 0 && this.isFavorite(normalizedName)) {
      this.data.likeCounts[normalizedName] = 2; // Heart = 1, first click = 2
    } else {
      this.data.likeCounts[normalizedName] = currentCount + 1;
    }
    this.saveToStorage();

    return this.data.likeCounts[normalizedName];
  }

  getLikeCount(name: string): number {
    const normalizedName = name.trim();
    return this.data.likeCounts?.[normalizedName] || 0;
  }

  decrementLikeCount(name: string): { count: number; removed: boolean } {
    const normalizedName = name.trim();
    if (!this.data.likeCounts) {
      this.data.likeCounts = {};
    }

    const currentCount = this.data.likeCounts[normalizedName] || 0;

    // If count is 1 or less, remove from favorites entirely
    if (currentCount <= 1) {
      this.removeFavorite(normalizedName);
      // Also remove from pinned if it was pinned
      if (this.isPinned(normalizedName)) {
        this.unpinFavorite(normalizedName);
      }
      delete this.data.likeCounts[normalizedName];
      this.saveToStorage();
      return { count: 0, removed: true };
    }

    // Otherwise, just decrement the count
    this.data.likeCounts[normalizedName] = currentCount - 1;
    this.saveToStorage();

    // Dispatch storage event to update UI
    window.dispatchEvent(new Event('storage'));

    return { count: this.data.likeCounts[normalizedName], removed: false };
  }

  // Dislikes (Hidden names) methods
  addDislike(name: string): void {
    const normalizedName = name.trim();
    if (!normalizedName) return;
    if (!this.isDisliked(normalizedName)) {
      // Remove from favorites if it was there
      this.removeFavorite(normalizedName);
      // Add to dislikes
      this.data.dislikes.push(normalizedName);
      this.saveToStorage();
      // Dispatch custom event for blog name list animations
      window.dispatchEvent(new CustomEvent('nameDisliked', { detail: { name: normalizedName } }));
      // Dispatch storage event to update counters
      window.dispatchEvent(new Event('storage'));
    }
  }

  removeDislikes(name: string): void {
    const normalizedName = name.trim();
    const index = this.data.dislikes.findIndex(d => d.trim() === normalizedName);
    if (index > -1) {
      this.data.dislikes.splice(index, 1);
      this.saveToStorage();
      // Dispatch storage event to update counters
      window.dispatchEvent(new Event('storage'));
    }
  }

  isDisliked(name: string): boolean {
    const normalizedName = name.trim();
    return this.data.dislikes.some(d => d.trim() === normalizedName);
  }

  getDislikes(): string[] {
    return [...this.data.dislikes];
  }

  // Clear methods - async to ensure cloud sync completes
  async clearFavorites(): Promise<void> {
    console.log('[FavoritesService] Clearing favorites...');
    console.log('[FavoritesService] Current isLoggedIn:', this.isLoggedIn, 'userId:', this.userId);

    // Set flag to prevent cloud sync from restoring data
    this.isClearingData = true;

    // Clear favorites from memory (including pinned)
    this.data.favorites = [];
    this.data.pinnedFavorites = [];

    // Force complete localStorage update - remove then set
    try {
      localStorage.removeItem(this.STORAGE_KEY);

      // Save clean data with empty favorites but preserved dislikes
      const cleanData = {
        favorites: [],
        dislikes: this.data.dislikes,
        pinnedFavorites: []
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanData));

      // Verify the clear worked
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.favorites && parsed.favorites.length > 0) {
          console.error('[FavoritesService] Failed to clear favorites - still has', parsed.favorites.length, 'items');
          // Force clear again
          cleanData.favorites = [];
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanData));
        }
      }
      console.log('[FavoritesService] Favorites cleared from localStorage');
    } catch (error) {
      console.error('[FavoritesService] Error saving to localStorage:', error);
      this.isClearingData = false; // Reset flag on error
      throw error;
    }

    // Force immediate cloud sync if logged in
    if (this.isLoggedIn && this.userId) {
      console.log('[FavoritesService] User is logged in, syncing to cloud...');
      try {
        await userDataService.saveToCloud([], this.data.dislikes, undefined, undefined, false);  // silent = false (user-initiated clear)
        console.log('[FavoritesService] Empty favorites successfully synced to cloud');
      } catch (error) {
        console.error('[FavoritesService] Failed to sync empty favorites to cloud:', error);
        this.isClearingData = false; // Reset flag on error
        throw error; // Propagate error so the UI can handle it
      }
    } else {
      console.log('[FavoritesService] User not logged in, skipping cloud sync');
    }

    // Reload from storage to ensure we have clean data
    this.loadFromStorage();

    // Dispatch storage event to update UI counters
    window.dispatchEvent(new Event('storage'));

    // Reset the flag after a delay to ensure cloud sync has completed
    setTimeout(() => {
      this.isClearingData = false;
      console.log('[FavoritesService] Clearing flag reset - cloud sync can resume');
    }, 5000);
  }

  async clearDislikes(): Promise<void> {
    console.log('[FavoritesService] Clearing dislikes...');
    console.log('[FavoritesService] Current isLoggedIn:', this.isLoggedIn, 'userId:', this.userId);

    // Set flag to prevent cloud sync from restoring data
    this.isClearingData = true;

    // Clear dislikes from memory
    this.data.dislikes = [];

    // Force complete localStorage update - remove then set
    try {
      localStorage.removeItem(this.STORAGE_KEY);

      // Save clean data with empty dislikes but preserved favorites
      const cleanData = {
        favorites: this.data.favorites,
        dislikes: []
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanData));

      // Verify the clear worked
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.dislikes && parsed.dislikes.length > 0) {
          console.error('[FavoritesService] Failed to clear dislikes - still has', parsed.dislikes.length, 'items');
          // Force clear again
          cleanData.dislikes = [];
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleanData));
        }
      }
      console.log('[FavoritesService] Dislikes cleared from localStorage');
    } catch (error) {
      console.error('[FavoritesService] Error saving to localStorage:', error);
      this.isClearingData = false; // Reset flag on error
      throw error;
    }

    // Force immediate cloud sync if logged in
    if (this.isLoggedIn && this.userId) {
      console.log('[FavoritesService] User is logged in, syncing to cloud...');
      try {
        await userDataService.saveToCloud(this.data.favorites, [], undefined, undefined, false);  // silent = false (user-initiated clear)
        console.log('[FavoritesService] Empty dislikes successfully synced to cloud');
      } catch (error) {
        console.error('[FavoritesService] Failed to sync empty dislikes to cloud:', error);
        this.isClearingData = false; // Reset flag on error
        throw error; // Propagate error so the UI can handle it
      }
    } else {
      console.log('[FavoritesService] User not logged in, skipping cloud sync');
    }

    // Reload from storage to ensure we have clean data
    this.loadFromStorage();

    // Dispatch storage event to update UI counters
    window.dispatchEvent(new Event('storage'));

    // Reset the flag after a delay to ensure cloud sync has completed
    setTimeout(() => {
      this.isClearingData = false;
      console.log('[FavoritesService] Clearing flag reset - cloud sync can resume');
    }, 5000);
  }

  async clearAll(): Promise<void> {
    console.log('[FavoritesService] Clearing all favorites and dislikes...');
    console.log('[FavoritesService] Current isLoggedIn:', this.isLoggedIn, 'userId:', this.userId);

    // Clear all data from memory
    this.data = { favorites: [], dislikes: [] };

    // Immediately save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      console.log('[FavoritesService] All data cleared from localStorage');
    } catch (error) {
      console.error('[FavoritesService] Error saving to localStorage:', error);
      throw error;
    }

    // Force immediate cloud sync if logged in
    if (this.isLoggedIn && this.userId) {
      console.log('[FavoritesService] User is logged in, syncing to cloud...');
      try {
        await userDataService.saveToCloud([], [], undefined, undefined, false);  // silent = false (user-initiated clear)
        console.log('[FavoritesService] Empty lists successfully synced to cloud');
      } catch (error) {
        console.error('[FavoritesService] Failed to sync empty lists to cloud:', error);
        throw error; // Propagate error so the UI can handle it
      }
    } else {
      console.log('[FavoritesService] User not logged in, skipping cloud sync');
    }
  }

  // Filter method to exclude disliked names
  filterOutDislikes(names: NameEntry[]): NameEntry[] {
    if (this.data.dislikes.length === 0) {
      return names;
    }
    return names.filter(name => !this.isDisliked(name.name));
  }

  // Filter method to exclude favorited names
  filterOutFavorites(names: NameEntry[]): NameEntry[] {
    if (this.data.favorites.length === 0) {
      return names;
    }
    return names.filter(name => !this.isFavorite(name.name));
  }

  // Filter method to exclude BOTH liked and disliked names
  filterOutLikedAndDisliked(names: NameEntry[]): NameEntry[] {
    if (this.data.favorites.length === 0 && this.data.dislikes.length === 0) {
      return names;
    }
    return names.filter(name => !this.isFavorite(name.name) && !this.isDisliked(name.name));
  }

  // Get names that are favorites from a list
  filterFavorites(names: NameEntry[]): NameEntry[] {
    if (this.data.favorites.length === 0) {
      return [];
    }
    return names.filter(name => this.isFavorite(name.name));
  }

  // Toggle methods for UI interaction
  toggleFavorite(name: string): boolean {
    if (this.isFavorite(name)) {
      this.removeFavorite(name);
      return false;
    } else {
      this.addFavorite(name);
      return true;
    }
  }

  toggleDislike(name: string): boolean {
    if (this.isDisliked(name)) {
      this.removeDislikes(name);
      return false;
    } else {
      this.addDislike(name);
      return true;
    }
  }

  // Stats methods
  getFavoritesCount(): number {
    return this.data.favorites.length;
  }

  getDislikesCount(): number {
    return this.data.dislikes.length;
  }

  // Set methods for bulk updates (used during merge)
  setFavorites(favorites: string[]): void {
    this.data.favorites = favorites;
    this.saveToStorage();
    // Dispatch storage event to update UI counters and lists
    window.dispatchEvent(new Event('storage'));
  }

  setDislikes(dislikes: string[]): void {
    this.data.dislikes = dislikes;
    this.saveToStorage();
    // Dispatch storage event to update UI counters and lists
    window.dispatchEvent(new Event('storage'));
  }

  // Get all data
  getAllData(): FavoritesData {
    return { ...this.data };
  }
}

const favoritesService = new FavoritesService();
export default favoritesService;