import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import userDataService from '../services/userDataService';
import favoritesService from '../services/favoritesService';
import { useToast } from './ToastContext';
import LogoutOverlay from '../components/LogoutOverlay';
import LoadingOverlay from '../components/LoadingOverlay';
import { isAdminEmail } from '../config/adminConfig';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  loading: boolean;
  isSyncing: boolean;
  syncError: string | null;
  manualSync: () => Promise<void>;
  clearCache: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const toast = useToast();

  const auth = getAuth();

  // Convert Firebase user to our User type
  const convertFirebaseUser = useCallback((firebaseUser: FirebaseUser): User => {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'User',
      picture: firebaseUser.photoURL || '',
      isAdmin: isAdminEmail(firebaseUser.email || ''),
    };
  }, []);

  // Load user data from cloud and merge with local
  const loadUserData = async (userId: string) => {
    console.log('[AUTH] Loading user data for userId:', userId);
    try {
      setIsSyncing(true);
      setSyncError(null);
      const cloudData = await userDataService.loadFromCloud();

      if (cloudData) {
        // Merge cloud data with local data
        const localFavorites = favoritesService.getFavorites();
        const localDislikes = favoritesService.getDislikes();

        const merged = userDataService.mergePreferences(
          { favorites: localFavorites, dislikes: localDislikes },
          cloudData
        );

        // Update local storage with merged data
        favoritesService.setFavorites(merged.favorites);
        favoritesService.setDislikes(merged.dislikes);

        // Save merged data back to cloud
        await userDataService.saveToCloud(merged.favorites, merged.dislikes);

        console.log('[AUTH] Favorites synced successfully');
        toast.success('Favorites synced successfully!');
      }
    } catch (error) {
      console.error('[AUTH] Error loading user data:', error);
      setSyncError('Failed to sync favorites');
      toast.error('Failed to sync favorites. Your local data is safe.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear all user data and cache
  const clearCache = useCallback(() => {
    console.log('[AUTH] Clearing all caches...');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    userDataService.setUserId(null);
    favoritesService.setUserContext(null);
    setUser(null);
    console.log('[AUTH] Cache cleared');
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    console.log('[AUTH] Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('[AUTH] User signed in:', firebaseUser.email);

        // Convert to our User type
        const userData = convertFirebaseUser(firebaseUser);

        // Update state
        setUser(userData);

        // Set user context for services
        userDataService.setUserId(userData.id);
        favoritesService.setUserContext(userData.id);

        // Load user data from cloud (only if not already syncing)
        if (!isSyncing) {
          await loadUserData(userData.id);
        }
      } else {
        console.log('[AUTH] User signed out');
        clearCache();
      }

      setLoading(false);
    });

    return () => {
      console.log('[AUTH] Cleaning up auth state listener');
      unsubscribe();
    };
  }, [auth, convertFirebaseUser, clearCache]);

  // Subscribe to sync status
  useEffect(() => {
    const unsubscribe = userDataService.onSyncStatusChange((status) => {
      setIsSyncing(status.isSyncing);
      setSyncError(status.error);
    });
    return unsubscribe;
  }, []);

  // Login with Google using Firebase Auth
  const login = async () => {
    console.log('[AUTH] ===== INITIATING GOOGLE LOGIN =====');

    try {
      const provider = new GoogleAuthProvider();

      // Optional: Add scopes if needed
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

      // Optional: Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account', // Always show account selector
      });

      console.log('[AUTH] Opening Google sign-in popup...');
      const result = await signInWithPopup(auth, provider);

      // Get the credential from the result
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      console.log('[AUTH] ===== LOGIN SUCCESSFUL =====');
      console.log('[AUTH] User:', result.user.email);
      console.log('[AUTH] Access token received:', !!token);

      // User data will be handled by onAuthStateChanged listener
      toast.success(`Welcome back, ${result.user.displayName?.split(' ')[0] || 'there'}!`);

    } catch (error: any) {
      console.error('[AUTH] ===== LOGIN ERROR =====');
      console.error('[AUTH] Error code:', error.code);
      console.error('[AUTH] Error message:', error.message);
      console.error('[AUTH] Full error:', error);

      // Handle specific error codes
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('[AUTH] Popup cancelled (likely due to multiple requests)');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  // Logout
  const logout = async () => {
    console.log('[AUTH] ===== INITIATING LOGOUT =====');

    // Show overlay immediately
    setShowLogoutOverlay(true);

    try {
      // Sign out from Firebase
      await signOut(auth);

      // Clear services
      userDataService.setUserId(null);
      favoritesService.setUserContext(null);

      // Clear cache
      clearCache();

      console.log('[AUTH] ===== LOGOUT COMPLETE =====');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('[AUTH] ===== LOGOUT ERROR =====');
      console.error('[AUTH] Error:', error);
      toast.error('Error during logout');
    } finally {
      // Hide overlay after a short delay
      setTimeout(() => {
        setShowLogoutOverlay(false);
      }, 800);
    }
  };

  // Manual sync
  const manualSync = async () => {
    if (!user) {
      toast.error('Please log in to sync');
      return;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      const favorites = favoritesService.getFavorites();
      const dislikes = favoritesService.getDislikes();

      await userDataService.saveToCloud(favorites, dislikes);
      toast.success('Synced successfully!');
    } catch (error: any) {
      console.error('[AUTH] Manual sync error:', error);
      setSyncError(error.message);
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    logout,
    loading,
    isSyncing,
    syncError,
    manualSync,
    clearCache,
  };

  if (loading) {
    return <LoadingOverlay isVisible={true} message="Loading..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LogoutOverlay
        isVisible={showLogoutOverlay}
        favoritesCount={favoritesService.getFavorites().length}
      />
    </AuthContext.Provider>
  );
};
