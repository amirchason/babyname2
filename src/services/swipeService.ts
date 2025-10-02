/**
 * Swipe Service for Tinder-Style Name Cards
 * Manages card stacks, preloading, and user decisions
 */

import optimizedNameService, { OptimizedNameEntry } from './optimizedNameService';
import favoritesService from './favoritesService';

export type SwipeDirection = 'left' | 'right' | 'up';
export type DeckType = 'quick' | 'male' | 'female' | 'unisex' | 'full';

export interface SwipeCard {
  name: OptimizedNameEntry;
  position: number;
  isPreloaded: boolean;
}

export interface SwipeState {
  liked: Set<number>;
  disliked: Set<number>;
  superLiked: Set<number>;
  currentPosition: number;
  deckType: DeckType;
  totalSwiped: number;
}

class SwipeService {
  // Card stack management
  private currentStack: SwipeCard[] = [];
  private nextStack: SwipeCard[] = [];
  private previousCards: SwipeCard[] = []; // For undo

  // User decisions
  private liked: Set<number> = new Set();
  private disliked: Set<number> = new Set();
  private superLiked: Set<number> = new Set();

  // Session state
  private currentDeck: number[] = [];
  private currentPosition: number = 0;
  private deckType: DeckType = 'quick';
  private isLoading: boolean = false;

  // Configuration
  private readonly STACK_SIZE = 10;
  private readonly PRELOAD_THRESHOLD = 5;
  private readonly UNDO_LIMIT = 10;

  constructor() {
    // Load saved state from localStorage
    this.loadState();
  }

  /**
   * Initialize a swipe session
   */
  async initialize(deckType: DeckType = 'quick'): Promise<void> {
    this.deckType = deckType;
    this.currentPosition = 0;

    // Get deck from name service
    this.currentDeck = await optimizedNameService.getSwipeDeck(deckType);

    if (this.currentDeck.length === 0) {
      console.error('No names available in deck:', deckType);
      return;
    }

    // Load initial stacks
    await this.loadInitialStacks();

    console.log(`✓ Swipe session initialized with ${this.currentDeck.length} names`);
  }

  /**
   * Load initial card stacks
   */
  private async loadInitialStacks(): Promise<void> {
    this.isLoading = true;

    // Load current stack
    const currentIds = this.currentDeck.slice(
      this.currentPosition,
      this.currentPosition + this.STACK_SIZE
    );

    const currentNames = await optimizedNameService.getNamesByIds(currentIds);

    // Filter out disliked names from the stack
    const filteredNames = currentNames.filter(name =>
      !favoritesService.isDisliked(name.n)
    );

    this.currentStack = filteredNames.map((name, index) => ({
      name,
      position: this.currentPosition + index,
      isPreloaded: true
    }));

    // Preload next stack
    this.preloadNextStack();

    this.isLoading = false;
  }

  /**
   * Preload next batch of cards
   */
  private async preloadNextStack(): Promise<void> {
    const nextPosition = this.currentPosition + this.STACK_SIZE;
    const nextIds = this.currentDeck.slice(
      nextPosition,
      nextPosition + this.STACK_SIZE
    );

    if (nextIds.length === 0) return;

    // Load asynchronously
    optimizedNameService.getNamesByIds(nextIds).then(names => {
      // Filter out disliked names from the preloaded stack
      const filteredNames = names.filter(name =>
        !favoritesService.isDisliked(name.n)
      );

      this.nextStack = filteredNames.map((name, index) => ({
        name,
        position: nextPosition + index,
        isPreloaded: true
      }));
    });
  }

  /**
   * Get current card to display
   */
  getCurrentCard(): SwipeCard | null {
    return this.currentStack[0] || null;
  }

  /**
   * Get next few cards for preview
   */
  getUpcomingCards(count: number = 3): SwipeCard[] {
    return this.currentStack.slice(1, count + 1);
  }

  /**
   * Handle swipe action
   */
  async onSwipe(direction: SwipeDirection, cardId?: number): Promise<void> {
    const currentCard = this.getCurrentCard();
    if (!currentCard) return;

    const nameId = cardId || currentCard.name.id;

    // Track decision
    switch (direction) {
      case 'right':
        this.liked.add(nameId);
        this.disliked.delete(nameId);
        break;
      case 'left':
        this.disliked.add(nameId);
        this.liked.delete(nameId);
        break;
      case 'up':
        this.superLiked.add(nameId);
        this.liked.add(nameId);
        this.disliked.delete(nameId);
        break;
    }

    // Store for undo
    this.previousCards.unshift(currentCard);
    if (this.previousCards.length > this.UNDO_LIMIT) {
      this.previousCards.pop();
    }

    // Remove swiped card
    this.currentStack.shift();
    this.currentPosition++;

    // Move card from next stack to current
    if (this.nextStack.length > 0) {
      this.currentStack.push(this.nextStack.shift()!);
    }

    // Preload more if needed
    if (this.nextStack.length < this.PRELOAD_THRESHOLD) {
      this.preloadNextStack();
    }

    // Save state
    this.saveState();
  }

  /**
   * Undo last swipe
   */
  undoLastSwipe(): SwipeCard | null {
    if (this.previousCards.length === 0) return null;

    const card = this.previousCards.shift()!;

    // Remove from decision sets
    this.liked.delete(card.name.id);
    this.disliked.delete(card.name.id);
    this.superLiked.delete(card.name.id);

    // Add back to current stack
    this.currentStack.unshift(card);
    this.currentPosition--;

    // Save state
    this.saveState();

    return card;
  }

  /**
   * Skip to next card without swiping
   */
  skipCard(): void {
    const currentCard = this.getCurrentCard();
    if (!currentCard) return;

    // Move to end of deck
    this.currentDeck.push(currentCard.name.id);
    this.onSwipe('left', currentCard.name.id); // Treat as neutral
  }

  /**
   * Get statistics for current session
   */
  getStats(): {
    liked: number;
    disliked: number;
    superLiked: number;
    remaining: number;
    totalSwiped: number;
    percentComplete: number;
  } {
    const totalSwiped = this.liked.size + this.disliked.size;
    const remaining = this.currentDeck.length - this.currentPosition;
    const percentComplete = (this.currentPosition / this.currentDeck.length) * 100;

    return {
      liked: this.liked.size,
      disliked: this.disliked.size,
      superLiked: this.superLiked.size,
      remaining,
      totalSwiped,
      percentComplete: Math.round(percentComplete)
    };
  }

  /**
   * Get liked names
   */
  async getLikedNames(): Promise<OptimizedNameEntry[]> {
    const likedIds = Array.from(this.liked);
    return optimizedNameService.getNamesByIds(likedIds);
  }

  /**
   * Get super liked names
   */
  async getSuperLikedNames(): Promise<OptimizedNameEntry[]> {
    const superLikedIds = Array.from(this.superLiked);
    return optimizedNameService.getNamesByIds(superLikedIds);
  }

  /**
   * Filter deck by criteria
   */
  async filterDeck(filters: {
    gender?: 'M' | 'F' | 'U';
    origin?: string;
    lengthMin?: number;
    lengthMax?: number;
  }): Promise<void> {
    // This would filter the current deck based on criteria
    // For now, we can switch between predefined decks
    if (filters.gender === 'M') {
      await this.initialize('male');
    } else if (filters.gender === 'F') {
      await this.initialize('female');
    } else if (filters.gender === 'U') {
      await this.initialize('unisex');
    }
  }

  /**
   * Reset swipe session
   */
  reset(): void {
    this.liked.clear();
    this.disliked.clear();
    this.superLiked.clear();
    this.currentPosition = 0;
    this.currentStack = [];
    this.nextStack = [];
    this.previousCards = [];
    this.saveState();
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    const state: SwipeState = {
      liked: this.liked,
      disliked: this.disliked,
      superLiked: this.superLiked,
      currentPosition: this.currentPosition,
      deckType: this.deckType,
      totalSwiped: this.liked.size + this.disliked.size
    };

    try {
      localStorage.setItem('swipeState', JSON.stringify({
        liked: Array.from(state.liked),
        disliked: Array.from(state.disliked),
        superLiked: Array.from(state.superLiked),
        currentPosition: state.currentPosition,
        deckType: state.deckType,
        totalSwiped: state.totalSwiped
      }));
    } catch (error) {
      console.error('Failed to save swipe state:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    try {
      const savedState = localStorage.getItem('swipeState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.liked = new Set(parsed.liked || []);
        this.disliked = new Set(parsed.disliked || []);
        this.superLiked = new Set(parsed.superLiked || []);
        this.currentPosition = parsed.currentPosition || 0;
        this.deckType = parsed.deckType || 'quick';
      }
    } catch (error) {
      console.error('Failed to load swipe state:', error);
    }
  }

  /**
   * Export liked names
   */
  exportLikedNames(): string {
    const likedArray = Array.from(this.liked);
    return JSON.stringify({
      liked: likedArray,
      superLiked: Array.from(this.superLiked),
      exportDate: new Date().toISOString(),
      totalSwiped: this.liked.size + this.disliked.size
    }, null, 2);
  }

  /**
   * Import liked names
   */
  importLikedNames(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.liked) {
        this.liked = new Set(data.liked);
        this.superLiked = new Set(data.superLiked || []);
        this.saveState();
        return true;
      }
    } catch (error) {
      console.error('Failed to import liked names:', error);
    }
    return false;
  }

  /**
   * Check if currently loading
   */
  isLoadingCards(): boolean {
    return this.isLoading;
  }

  /**
   * Get card stack size
   */
  getStackSize(): number {
    return this.currentStack.length;
  }
}

// Export singleton instance
const swipeService = new SwipeService();
export default swipeService;