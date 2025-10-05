import { NameEntry } from './nameService';
import userDataService, { UserPreferences } from './userDataService';

interface FavoritesData {
  favorites: string[]; // Array of name strings (liked names)
  dislikes: string[];  // Array of name strings (disliked/hidden names)
  pinnedFavorites?: string[]; // Array of pinned favorite names (shown at top)
}

class FavoritesService {
  private readonly STORAGE_KEY = 'babynames_preferences';
  private readonly MAX_PINNED_FAVORITES = 20; // Maximum number of pinned favorites
  private readonly DEBOUNCE_DELAY = 1500; // 1.5 seconds debounce for cloud sync
  private data: FavoritesData = {
    favorites: [],
    dislikes: [],
    pinnedFavorites: []
  };
  private isLoggedIn: boolean = false;
  private userId: string | null = null;
  private isClearingData: boolean = false; // Flag to prevent cloud sync during clear operations
  private syncTimeout: NodeJS.Timeout | null = null; // Debounce timer for cloud sync

  constructor() {
    this.loadFromStorage();
    this.setupCloudSync();
  }

  private setupCloudSync() {
    // Listen for cloud data updates
    window.addEventListener('cloudDataUpdate', (event: any) => {
      const cloudData = event.detail as UserPreferences;
      if (cloudData) {
        this.handleCloudUpdate(cloudData);
      }
    });

    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.isLoggedIn = true;
      this.userId = userData.id;
    }
  }

  private handleCloudUpdate(cloudData: UserPreferences) {
    // Skip cloud merge if we're in the middle of clearing data
    if (this.isClearingData) {
      console.log('[FavoritesService] Skipping cloud merge - clearing in progress');
      return;
    }

    // Merge cloud data with local data
    const merged = userDataService.mergePreferences(
      { favorites: this.data.favorites, dislikes: this.data.dislikes },
      cloudData
    );

    // Update local data
    this.data = merged;
    this.saveToStorage();
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
          pinnedFavorites: (parsed.pinnedFavorites || []).map((n: string) => n.trim()).filter((n: string) => n.length > 0)
        };
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      this.data = { favorites: [], dislikes: [], pinnedFavorites: [] };
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      // Sync to cloud if user is logged in
      this.syncToCloud();
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  private async syncToCloud() {
    // Debounce cloud sync to batch rapid changes (prevents lag and reduces Firebase writes)
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    this.syncTimeout = setTimeout(async () => {
      if (this.isLoggedIn && this.userId) {
        try {
          await userDataService.saveToCloud(
            this.data.favorites,
            this.data.dislikes
          );
        } catch (error) {
          console.error('Error syncing to cloud:', error);
        }
      }
      this.syncTimeout = null;
    }, this.DEBOUNCE_DELAY);
  }

  // Flush any pending sync immediately (used during logout)
  async flushPendingSync(): Promise<void> {
    // Clear any pending debounced sync
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }

    // Immediately save to cloud if logged in
    if (this.isLoggedIn && this.userId) {
      try {
        await userDataService.saveToCloud(
          this.data.favorites,
          this.data.dislikes
        );
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
    }
  }

  removeFavorite(name: string): void {
    const normalizedName = name.trim();
    const index = this.data.favorites.findIndex(f => f.trim() === normalizedName);
    if (index > -1) {
      this.data.favorites.splice(index, 1);
      this.saveToStorage();
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
    }
  }

  removeDislikes(name: string): void {
    const normalizedName = name.trim();
    const index = this.data.dislikes.findIndex(d => d.trim() === normalizedName);
    if (index > -1) {
      this.data.dislikes.splice(index, 1);
      this.saveToStorage();
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
        await userDataService.saveToCloud([], this.data.dislikes);
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

    // Reset the flag after a delay to ensure cloud sync has completed
    setTimeout(() => {
      this.isClearingData = false;
      console.log('[FavoritesService] Clearing flag reset - cloud sync can resume');
    }, 1000);
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
        await userDataService.saveToCloud(this.data.favorites, []);
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

    // Reset the flag after a delay to ensure cloud sync has completed
    setTimeout(() => {
      this.isClearingData = false;
      console.log('[FavoritesService] Clearing flag reset - cloud sync can resume');
    }, 1000);
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
        await userDataService.saveToCloud([], []);
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
  }

  setDislikes(dislikes: string[]): void {
    this.data.dislikes = dislikes;
    this.saveToStorage();
  }

  // Get all data
  getAllData(): FavoritesData {
    return { ...this.data };
  }
}

const favoritesService = new FavoritesService();
export default favoritesService;