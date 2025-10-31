import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
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

const AuthProviderContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showLogoutOverlay, setShowLogoutOverlay] = useState(false);
  const toast = useToast();

  // Validate user data structure and format
  const isValidUserData = useCallback((data: any): data is User => {
    console.log('[AUTH DEBUG] Validating user data:', JSON.stringify(data, null, 2));

    if (!data || typeof data !== 'object') {
      console.log('[AUTH DEBUG] Invalid: not an object');
      return false;
    }

    // Check required fields exist and are non-empty strings
    if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
      console.log('[AUTH DEBUG] Invalid: id missing or empty:', data.id);
      return false;
    }

    if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
      console.log('[AUTH DEBUG] Invalid: email missing or empty:', data.email);
      return false;
    }

    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      console.log('[AUTH DEBUG] Invalid: name missing or empty:', data.name);
      return false;
    }

    // Relaxed validation: Accept any non-empty ID format
    // This allows for:
    // - Google OAuth IDs (numeric, 15-21 digits)
    // - Firebase UIDs (alphanumeric, 28 chars)
    // - Old auth system IDs (any format)
    // - Legacy user data from previous app versions
    console.log('[AUTH DEBUG] Validation PASSED - ID format:', data.id.length, 'chars');
    return true;
  }, []);

  // Clear all user data and reload page
  const clearCache = useCallback(() => {
    console.log('[AUTH DEBUG] Clearing cache...');
    setUser(null);
    userDataService.disconnect();
    favoritesService.setUserContext(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('google_access_token');
    setSyncError(null);

    // Reload page after a short delay to ensure clean state
    setTimeout(() => {
      console.log('[AUTH DEBUG] Reloading page...');
      window.location.reload();
    }, 500);
  }, []);

  useEffect(() => {
    console.log('[AUTH DEBUG] AuthContext useEffect running...');

    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    console.log('[AUTH DEBUG] localStorage user:', storedUser);

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);

        // Validate user data structure with strict checking
        if (!isValidUserData(userData)) {
          console.warn('[AUTH DEBUG] Invalid user data in localStorage, clearing...');
          localStorage.removeItem('user');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('google_access_token');
          toast.error('Session expired or invalid. Please sign in again.', 8000, 'Clear & Reload', clearCache);
          setLoading(false);
          return;
        }

        // Add admin status if not already present
        if (userData.isAdmin === undefined) {
          userData.isAdmin = isAdminEmail(userData.email);
        }

        console.log('[AUTH DEBUG] Setting user:', userData.email);
        console.log('[AUTH DEBUG] User admin status:', userData.isAdmin);
        setUser(userData);

        // Set user ID for cloud sync
        console.log('[AUTH DEBUG] Setting userDataService userId:', userData.id);
        userDataService.setUserId(userData.id);

        console.log('[AUTH DEBUG] Setting favoritesService context:', userData.id);
        favoritesService.setUserContext(userData.id);

        // Verify userId was set
        console.log('[AUTH DEBUG] userDataService.userId after set:', (userDataService as any).userId);

        // Load user data from cloud
        console.log('[AUTH DEBUG] Calling loadUserData...');
        loadUserData(userData.id).catch((error) => {
          console.error('[AUTH DEBUG] Failed to load user data on init:', error);
          // Don't clear user on sync failure, just show error
          toast.error('Failed to sync favorites. Click the cloud icon to retry.', 6000);
        });
      } catch (error) {
        console.error('[AUTH DEBUG] Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('google_access_token');
        toast.error('Session data corrupted. Clearing...', 8000, 'Reload Now', clearCache);
      }
    } else {
      console.log('[AUTH DEBUG] No stored user found');
    }

    setLoading(false);
  }, [isValidUserData, clearCache]);

  // Handle redirect result when user comes back from Google
  useEffect(() => {
    const handleRedirectResult = async () => {
      const auth = getAuth();

      try {
        console.log('[AUTH DEBUG] Checking for redirect result...');
        const result = await getRedirectResult(auth);

        if (result) {
          console.log('[AUTH DEBUG] ===== REDIRECT SUCCESSFUL =====');
          console.log('[AUTH DEBUG] Firebase UID:', result.user.uid);
          console.log('[AUTH DEBUG] Firebase email:', result.user.email);

          // Get the Google access token
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const accessToken = credential?.accessToken;

          if (accessToken) {
            localStorage.setItem('google_access_token', accessToken);
          }

          // Create user data object
          const userData: User = {
            id: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || 'User',
            picture: result.user.photoURL || '',
            isAdmin: isAdminEmail(result.user.email || ''),
          };

          console.log('[AUTH DEBUG] Setting user:', userData.email);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userEmail', userData.email);

          // Set user ID for cloud sync
          userDataService.setUserId(userData.id);
          favoritesService.setUserContext(userData.id);

          // Load user data from cloud
          await loadUserData(userData.id);
          console.log('[AUTH DEBUG] ===== LOGIN SUCCESSFUL =====');
          toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
        } else {
          console.log('[AUTH DEBUG] No redirect result (normal page load)');
        }
      } catch (error: any) {
        console.error('[AUTH DEBUG] ===== REDIRECT RESULT ERROR =====');
        console.error('[AUTH DEBUG] Error code:', error?.code);
        console.error('[AUTH DEBUG] Error message:', error?.message);
        console.error('[AUTH DEBUG] Full error:', error);

        if (error?.code !== 'auth/popup-closed-by-user') {
          toast.error(`Login failed: ${error?.message}`, 8000);
        }
      }
    };

    handleRedirectResult();
  }, []);

  // CRITICAL: Listen to Firebase auth state changes to maintain session
  useEffect(() => {
    const auth = getAuth();

    console.log('[AUTH DEBUG] Setting up auth state listener...');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AUTH DEBUG] ===== AUTH STATE CHANGED =====');
      console.log('[AUTH DEBUG] Firebase user:', firebaseUser?.email || 'null');

      if (firebaseUser) {
        // User is signed in with Firebase
        console.log('[AUTH DEBUG] Firebase user detected, UID:', firebaseUser.uid);

        // Create user data object from Firebase user
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          picture: firebaseUser.photoURL || '',
          isAdmin: isAdminEmail(firebaseUser.email || ''),
        };

        console.log('[AUTH DEBUG] Updating user state from auth listener:', userData.email);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userEmail', userData.email);

        // Set user ID for cloud sync
        userDataService.setUserId(userData.id);
        favoritesService.setUserContext(userData.id);

        // Load user data from cloud
        console.log('[AUTH DEBUG] Loading user data from cloud...');
        try {
          await loadUserData(userData.id);
        } catch (error) {
          console.error('[AUTH DEBUG] Error loading user data:', error);
        }
      } else {
        // User is signed out
        console.log('[AUTH DEBUG] No Firebase user, clearing state');
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('google_access_token');
        userDataService.setUserId(null);
        favoritesService.setUserContext(null);
      }
    });

    return () => {
      console.log('[AUTH DEBUG] Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Subscribe to sync status
  useEffect(() => {
    const unsubscribe = userDataService.onSyncStatusChange((status) => {
      setIsSyncing(status.isSyncing);
      setSyncError(status.error);
    });
    return unsubscribe;
  }, []);

  const loadUserData = async (userId: string) => {
    console.log('AuthContext: Loading user data for userId:', userId);
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

        // Show success toast
        toast.success('Favorites synced successfully!');
      } else {
        toast.info('No previous favorites found in cloud');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      const errorMessage = (error as Error).message;
      setSyncError(errorMessage);

      // Handle specific error cases
      if (errorMessage.includes('No user logged in')) {
        toast.error(
          'Session expired. Please sign in again.',
          8000,
          'Clear Cache',
          clearCache
        );
      } else if (errorMessage.includes('permission-denied') || errorMessage.includes('auth/')) {
        toast.error(
          'Authentication error. Try clearing cache and signing in again.',
          8000,
          'Clear Cache',
          clearCache
        );
      } else {
        toast.error(
          `Failed to sync favorites: ${errorMessage}`,
          6000,
          'Retry',
          () => loadUserData(userId)
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  console.log('🔧 [AUTH DEBUG] Setting up Firebase Auth login...');
  console.log('🔧 [AUTH DEBUG] Current origin:', window.location.origin);
  console.log('🔧 [AUTH DEBUG] User agent:', navigator.userAgent);

  const login = async () => {
    try {
      console.log('[AUTH DEBUG] ===== FIREBASE REDIRECT AUTH STARTED =====');
      console.log('[AUTH DEBUG] Using signInWithRedirect (mobile-optimized)');

      // Initialize Firebase auth and provider
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      // Configure provider
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('[AUTH DEBUG] Redirecting to Google...');

      // Redirect to Google (full page redirect, not popup)
      await signInWithRedirect(auth, provider);

      // User will be redirected away from the page
      // When they come back, we'll catch the result in useEffect
    } catch (error: any) {
      console.error('[AUTH DEBUG] ===== REDIRECT FAILED =====');
      console.error('[AUTH DEBUG] Error code:', error?.code);
      console.error('[AUTH DEBUG] Error message:', error?.message);

      if (error?.code === 'auth/redirect-cancelled-by-user') {
        toast.error('Login cancelled.', 5000);
      } else {
        toast.error(`Redirect failed: ${error?.message}`, 8000);
      }
    }
  };

  const logout = async () => {
    try {
      // Show beautiful overlay animation
      setShowLogoutOverlay(true);

      // Flush any pending debounced sync immediately (ensures all data is saved)
      if (user) {
        await favoritesService.flushPendingSync();
        console.log('[AUTH DEBUG] All favorites flushed to cloud');
      }

      // Keep overlay visible for animation (1 second total)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sign out of Firebase Auth
      const auth = getAuth();
      await auth.signOut();
      console.log('[AUTH DEBUG] Signed out of Firebase Auth');

      setUser(null);
      userDataService.disconnect();
      favoritesService.setUserContext(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('google_access_token');

      // Hide overlay
      setShowLogoutOverlay(false);

      toast.success('Favorites saved. See you next time!');
    } catch (error) {
      console.error('[AUTH DEBUG] Error during logout:', error);
      setShowLogoutOverlay(false);
      toast.warning('Logged out, but some favorites may not have synced.');

      // Force cleanup even if save failed
      setUser(null);
      userDataService.disconnect();
      favoritesService.setUserContext(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('google_access_token');
    }
  };

  const manualSync = async () => {
    if (!user) {
      toast.warning('Please log in to sync your favorites');
      return;
    }

    toast.info('Syncing favorites...');
    await loadUserData(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false,
      login,
      logout,
      loading,
      isSyncing,
      syncError,
      manualSync,
      clearCache
    }}>
      {children}
      <LogoutOverlay
        isVisible={showLogoutOverlay}
        favoritesCount={favoritesService.getFavoritesCount()}
      />
      <LoadingOverlay
        isVisible={isSyncing}
        message="Syncing your favorites..."
      />
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('✅ [AUTH INIT] Firebase Auth initialized');
  console.log('🔍 [AUTH INIT] Current URL:', window.location.href);
  console.log('🔍 [AUTH INIT] Current origin:', window.location.origin);

  // Firebase Auth doesn't require client ID - it uses firebase config
  return <AuthProviderContent>{children}</AuthProviderContent>;
};