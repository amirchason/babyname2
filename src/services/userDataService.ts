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

    // Subscribe to new user's data if userId is provided
    if (userId) {
      this.subscribeToUserData();
    }
  }

  // Subscribe to real-time updates
  private subscribeToUserData() {
    if (!this.userId) return;

    const userDocRef = doc(db, 'users', this.userId);

    this.unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as { preferences?: UserPreferences };
          if (data.preferences) {
            // Notify favorites service about cloud data
            this.handleCloudDataUpdate(data.preferences);
          }
        }
      },
      (error) => {
        console.error('Error subscribing to user data:', error);
        this.updateSyncStatus({ error: error.message });
      }
    );
  }

  // Handle incoming cloud data
  private handleCloudDataUpdate(cloudPreferences: UserPreferences) {
    // This will be called by favoritesService to merge data
    if (window.dispatchEvent) {
      const event = new CustomEvent('cloudDataUpdate', {
        detail: cloudPreferences
      });
      window.dispatchEvent(event);
    }

    this.updateSyncStatus({
      lastSyncTime: new Date(),
      error: null
    });
  }

  // Save preferences to cloud
  async saveToCloud(favorites: string[], dislikes: string[]): Promise<void> {
    console.log('[USERDATA DEBUG] saveToCloud called, userId:', this.userId);
    if (!this.userId) {
      console.error('[USERDATA DEBUG] saveToCloud failed - no userId set!');
      throw new Error('No user logged in');
    }

    this.updateSyncStatus({ isSyncing: true });

    try {
      const userDocRef = doc(db, 'users', this.userId);

      await setDoc(userDocRef, {
        preferences: {
          favorites,
          dislikes,
          lastUpdated: serverTimestamp(),
          deviceId: this.deviceId
        },
        email: localStorage.getItem('userEmail') || '',
        lastLogin: serverTimestamp()
      }, { merge: true });

      this.updateSyncStatus({
        isSyncing: false,
        lastSyncTime: new Date(),
        error: null
      });
    } catch (error) {
      console.error('Error saving to cloud:', error);
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
    local: { favorites: string[]; dislikes: string[] },
    cloud: UserPreferences
  ): { favorites: string[]; dislikes: string[] } {
    // Simple merge strategy: combine both sets and remove duplicates
    const mergedFavorites = Array.from(new Set([
      ...local.favorites,
      ...cloud.favorites
    ]));

    const mergedDislikes = Array.from(new Set([
      ...local.dislikes,
      ...cloud.dislikes
    ]));

    // Remove any names that appear in both lists (dislikes take precedence)
    const finalFavorites = mergedFavorites.filter(
      name => !mergedDislikes.includes(name)
    );

    return {
      favorites: finalFavorites,
      dislikes: mergedDislikes
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