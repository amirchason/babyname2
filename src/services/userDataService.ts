import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserPreferences {
  favorites: string[];  // Liked names
  dislikes: string[];   // Disliked names
  pinnedFavorites?: string[]; // Pinned favorites
  likeCounts?: { [name: string]: number }; // Like counts for each name
  lastUpdated: Timestamp | null;
  deviceId: string;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

class UserDataService {
  private userId: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private deviceId: string;
  private syncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncTime: null,
    error: null
  };
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    // Generate or retrieve device ID for conflict resolution
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // Set the current user ID
  setUserId(userId: string | null) {
    console.log('[USERDATA DEBUG] setUserId called with:', userId);

    // Unsubscribe from previous user's data
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.userId = userId;
    console.log('[USERDATA DEBUG] userId set to:', this.userId);

    // NO LONGER auto-subscribe to real-time updates (was causing infinite sync loop)
    // Sync only happens on: login, logout, manual sync, and debounced background saves
  }

  // REMOVED: subscribeToUserData() and handleCloudDataUpdate()
  // These were causing infinite sync loops via Firebase onSnapshot listener
  // Now sync only happens explicitly: login, logout, manual sync, background saves

  // Save preferences to cloud
  async saveToCloud(
    favorites: string[],
    dislikes: string[],
    pinnedFavorites?: string[],
    likeCounts?: { [name: string]: number },
    silent: boolean = false  // If true, don't show sync animation
  ): Promise<void> {
    console.log('[USERDATA DEBUG] saveToCloud called, userId:', this.userId, 'silent:', silent);
    if (!this.userId) {
      console.error('[USERDATA DEBUG] saveToCloud failed - no userId set!');
      throw new Error('No user logged in');
    }

    // Only show sync animation for non-silent saves (login, logout, manual sync)
    if (!silent) {
      this.updateSyncStatus({ isSyncing: true });
    }

    try {
      const userDocRef = doc(db, 'users', this.userId);

      await setDoc(userDocRef, {
        preferences: {
          favorites,
          dislikes,
          pinnedFavorites: pinnedFavorites || [],
          likeCounts: likeCounts || {},
          lastUpdated: serverTimestamp(),
          deviceId: this.deviceId
        },
        email: localStorage.getItem('userEmail') || '',
        lastLogin: serverTimestamp()
      }, { merge: true });

      // Only update sync status for non-silent saves
      if (!silent) {
        this.updateSyncStatus({
          isSyncing: false,
          lastSyncTime: new Date(),
          error: null
        });
      }
    } catch (error) {
      console.error('Error saving to cloud:', error);
      // Always report errors, even for silent saves
      this.updateSyncStatus({
        isSyncing: false,
        error: (error as Error).message
      });
      throw error;
    }
  }

  // Load preferences from cloud
  async loadFromCloud(): Promise<UserPreferences | null> {
    console.log('[USERDATA DEBUG] loadFromCloud called, userId:', this.userId);
    if (!this.userId) {
      console.error('[USERDATA DEBUG] loadFromCloud failed - no userId set!');
      throw new Error('No user logged in');
    }

    this.updateSyncStatus({ isSyncing: true });

    try {
      const userDocRef = doc(db, 'users', this.userId);
      const snapshot = await getDoc(userDocRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const preferences = data.preferences as UserPreferences;

        this.updateSyncStatus({
          isSyncing: false,
          lastSyncTime: new Date(),
          error: null
        });

        return preferences || {
          favorites: [],
          dislikes: [],
          lastUpdated: null,
          deviceId: ''
        };
      }

      this.updateSyncStatus({ isSyncing: false });
      return null;
    } catch (error) {
      console.error('Error loading from cloud:', error);
      this.updateSyncStatus({
        isSyncing: false,
        error: (error as Error).message
      });
      throw error;
    }
  }

  // Merge local and cloud data
  mergePreferences(
    local: { favorites: string[]; dislikes: string[]; pinnedFavorites?: string[]; likeCounts?: { [name: string]: number } },
    cloud: UserPreferences
  ): { favorites: string[]; dislikes: string[]; pinnedFavorites?: string[]; likeCounts?: { [name: string]: number } } {
    // Simple merge strategy: combine both sets and remove duplicates
    const mergedFavorites = Array.from(new Set([
      ...local.favorites,
      ...cloud.favorites
    ]));

    const mergedDislikes = Array.from(new Set([
      ...local.dislikes,
      ...cloud.dislikes
    ]));

    // Merge pinned favorites
    const mergedPinned = Array.from(new Set([
      ...(local.pinnedFavorites || []),
      ...(cloud.pinnedFavorites || [])
    ]));

    // Merge like counts (keep highest count for each name)
    const mergedLikeCounts: { [name: string]: number } = {};
    const allLikeNames = new Set([
      ...Object.keys(local.likeCounts || {}),
      ...Object.keys(cloud.likeCounts || {})
    ]);

    allLikeNames.forEach(name => {
      const localCount = (local.likeCounts || {})[name] || 0;
      const cloudCount = (cloud.likeCounts || {})[name] || 0;
      mergedLikeCounts[name] = Math.max(localCount, cloudCount);
    });

    // Remove any names that appear in both lists (dislikes take precedence)
    const finalFavorites = mergedFavorites.filter(
      name => !mergedDislikes.includes(name)
    );

    return {
      favorites: finalFavorites,
      dislikes: mergedDislikes,
      pinnedFavorites: mergedPinned,
      likeCounts: mergedLikeCounts
    };
  }

  // Sync status management
  private updateSyncStatus(update: Partial<SyncStatus>) {
    this.syncStatus = { ...this.syncStatus, ...update };
    this.notifySyncListeners();
  }

  private notifySyncListeners() {
    this.syncListeners.forEach(listener => listener(this.syncStatus));
  }

  onSyncStatusChange(listener: (status: SyncStatus) => void) {
    this.syncListeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  // Clean up
  disconnect() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.userId = null;
  }
}

const userDataService = new UserDataService();
export default userDataService;