import { NameEntry } from './nameService';

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

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = {
          favorites: parsed.favorites || [],
          dislikes: parsed.dislikes || []
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
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  }

  // Favorites (Liked names) methods
  addFavorite(name: string): void {
    if (!this.isFavorite(name)) {
      // Remove from dislikes if it was there
      this.removeDislikes(name);
      // Add to favorites
      this.data.favorites.push(name);
      this.saveToStorage();
    }
  }

  removeFavorite(name: string): void {
    const index = this.data.favorites.indexOf(name);
    if (index > -1) {
      this.data.favorites.splice(index, 1);
      this.saveToStorage();
    }
  }

  isFavorite(name: string): boolean {
    return this.data.favorites.includes(name);
  }

  getFavorites(): string[] {
    return [...this.data.favorites];
  }

  // Dislikes (Hidden names) methods
  addDislike(name: string): void {
    if (!this.isDisliked(name)) {
      // Remove from favorites if it was there
      this.removeFavorite(name);
      // Add to dislikes
      this.data.dislikes.push(name);
      this.saveToStorage();
    }
  }

  removeDislikes(name: string): void {
    const index = this.data.dislikes.indexOf(name);
    if (index > -1) {
      this.data.dislikes.splice(index, 1);
      this.saveToStorage();
    }
  }

  isDisliked(name: string): boolean {
    return this.data.dislikes.includes(name);
  }

  getDislikes(): string[] {
    return [...this.data.dislikes];
  }

  // Clear methods
  clearFavorites(): void {
    this.data.favorites = [];
    this.saveToStorage();
  }

  clearDislikes(): void {
    this.data.dislikes = [];
    this.saveToStorage();
  }

  clearAll(): void {
    this.data = { favorites: [], dislikes: [] };
    this.saveToStorage();
  }

  // Filter method to exclude disliked names
  filterOutDislikes(names: NameEntry[]): NameEntry[] {
    if (this.data.dislikes.length === 0) {
      return names;
    }
    return names.filter(name => !this.isDisliked(name.name));
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
}

const favoritesService = new FavoritesService();
export default favoritesService;