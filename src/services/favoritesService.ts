import { NameEntry } from './nameService';
import userDataService, { UserPreferences } from './userDataService';

interface FavoritesData {
  favorites: string[]; // Array of name strings (liked names)
  dislikes: string[];  // Array of name strings (disliked/hidden names)
}

class FavoritesService {
  private readonly STORAGE_KEY = 'babynames_preferences';
  private data: FavoritesData = {
    favorites: [],
    dislikes: []
  };
  private isLoggedIn: boolean = false;
  private userId: string | null = null;

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
          dislikes: (parsed.dislikes || []).map((n: string) => n.trim()).filter((n: string) => n.length > 0)
        };
      }
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      this.data = { favorites: [], dislikes: [] };
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

  isFavorite(name: string): boolean {
    const normalizedName = name.trim();
    return this.data.favorites.some(f => f.trim() === normalizedName);
  }

  getFavorites(): string[] {
    return [...this.data.favorites];
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

    // Clear favorites from memory
    this.data.favorites = [];

    // Immediately save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      console.log('[FavoritesService] Favorites cleared from localStorage');
    } catch (error) {
      console.error('[FavoritesService] Error saving to localStorage:', error);
      throw error;
    }

    // Force immediate cloud sync if logged in
    if (this.isLoggedIn && this.userId) {
      console.log('[FavoritesService] User is logged in, syncing to cloud...');
      try {
        await userDataService.saveToCloud(this.data.favorites, this.data.dislikes);
        console.log('[FavoritesService] Empty favorites successfully synced to cloud');
      } catch (error) {
        console.error('[FavoritesService] Failed to sync empty favorites to cloud:', error);
        throw error; // Propagate error so the UI can handle it
      }
    } else {
      console.log('[FavoritesService] User not logged in, skipping cloud sync');
    }
  }

  async clearDislikes(): Promise<void> {
    console.log('[FavoritesService] Clearing dislikes...');
    console.log('[FavoritesService] Current isLoggedIn:', this.isLoggedIn, 'userId:', this.userId);

    // Clear dislikes from memory
    this.data.dislikes = [];

    // Immediately save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
      console.log('[FavoritesService] Dislikes cleared from localStorage');
    } catch (error) {
      console.error('[FavoritesService] Error saving to localStorage:', error);
      throw error;
    }

    // Force immediate cloud sync if logged in
    if (this.isLoggedIn && this.userId) {
      console.log('[FavoritesService] User is logged in, syncing to cloud...');
      try {
        await userDataService.saveToCloud(this.data.favorites, this.data.dislikes);
        console.log('[FavoritesService] Empty dislikes successfully synced to cloud');
      } catch (error) {
        console.error('[FavoritesService] Failed to sync empty dislikes to cloud:', error);
        throw error; // Propagate error so the UI can handle it
      }
    } else {
      console.log('[FavoritesService] User not logged in, skipping cloud sync');
    }
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