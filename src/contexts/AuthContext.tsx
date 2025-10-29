import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
// Firebase auth dynamically imported in login/logout handlers to reduce initial bundle size
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

// Get client ID from env or use placeholder
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

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

  console.log('🔧 [AUTH DEBUG] Setting up useGoogleLogin hook...');
  console.log('🔧 [AUTH DEBUG] Current origin:', window.location.origin);
  console.log('🔧 [AUTH DEBUG] User agent:', navigator.userAgent);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      console.log('🎉 [AUTH DEBUG] ===== ON SUCCESS CALLBACK TRIGGERED! =====');
      try {
        console.log('[AUTH DEBUG] ===== GOOGLE OAUTH LOGIN STARTED =====');
        console.log('[AUTH DEBUG] Google OAuth successful, access_token received');
        console.log('[AUTH DEBUG] Access token length:', response.access_token?.length);
        console.log('[AUTH DEBUG] Response object:', response);

        // 1. Fetch user info from Google
        console.log('[AUTH DEBUG] Step 1: Fetching user info from Google...');
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error(`Google API error: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
        }

        const userInfo: GoogleUserInfo = await userInfoResponse.json();
        console.log('[AUTH DEBUG] Google user info:', userInfo.email);
        console.log('[AUTH DEBUG] User name:', userInfo.name);

        // 2. Sign into Firebase Auth using Google OAuth token
        console.log('[AUTH DEBUG] Step 2: Signing into Firebase Auth...');
        // Lazy load Firebase auth to reduce initial bundle size
        const { getAuth, GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
        console.log('[AUTH DEBUG] Firebase auth module loaded');

        const credential = GoogleAuthProvider.credential(null, response.access_token);
        console.log('[AUTH DEBUG] Google credential created');

        const auth = getAuth();
        console.log('[AUTH DEBUG] Firebase auth instance retrieved');

        const firebaseResult = await signInWithCredential(auth, credential);
        console.log('[AUTH DEBUG] Firebase Auth successful!');
        console.log('[AUTH DEBUG] Firebase UID:', firebaseResult.user.uid);
        console.log('[AUTH DEBUG] Firebase email:', firebaseResult.user.email);

        // 3. Use Firebase UID (not Google ID) - this is what Firestore recognizes
        const userData: User = {
          id: firebaseResult.user.uid,  // ← Firebase UID, not Google OAuth ID
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          isAdmin: isAdminEmail(userInfo.email),
        };

        console.log('[AUTH DEBUG] Setting user with Firebase UID:', userData.id);
        console.log('[AUTH DEBUG] User admin status:', userData.isAdmin);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('google_access_token', response.access_token);

        // Set user ID for cloud sync
        console.log('[AUTH DEBUG] Setting userDataService userId:', userData.id);
        userDataService.setUserId(userData.id);
        favoritesService.setUserContext(userData.id);

        // Load and merge user data from cloud
        console.log('[AUTH DEBUG] Step 3: Loading user data from Firestore...');
        await loadUserData(userData.id);
        console.log('[AUTH DEBUG] ===== LOGIN SUCCESSFUL =====');
        toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
      } catch (error) {
        console.error('[AUTH DEBUG] ===== LOGIN FAILED =====');
        console.error('[AUTH DEBUG] Error type:', error?.constructor?.name);
        console.error('[AUTH DEBUG] Error message:', (error as Error)?.message);
        console.error('[AUTH DEBUG] Error stack:', (error as Error)?.stack);
        console.error('[AUTH DEBUG] Full error object:', error);

        const errorMessage = (error as Error)?.message || 'Unknown error occurred';
        toast.error(`Login failed: ${errorMessage}`, 8000);

        // Show user-friendly error based on error type
        if (errorMessage.includes('Firebase')) {
          toast.error('Firebase authentication error. Please contact support.', 10000);
        } else if (errorMessage.includes('Google API')) {
          toast.error('Could not fetch Google account info. Please try again.', 10000);
        }
      }
    },
    onError: (error) => {
      console.error('[AUTH DEBUG] ===== GOOGLE OAUTH ERROR =====');
      console.error('[AUTH DEBUG] OAuth error:', error);
      console.error('[AUTH DEBUG] Error type:', typeof error);
      console.error('[AUTH DEBUG] Error details:', JSON.stringify(error, null, 2));
      toast.error('Google login failed. Please try again.', 6000);
    },
    onNonOAuthError: (error) => {
      console.error('[AUTH DEBUG] ===== NON-OAUTH ERROR =====');
      console.error('[AUTH DEBUG] Non-OAuth error:', error);
      console.error('[AUTH DEBUG] This could be a popup blocker or network issue');
      toast.error('Login popup blocked or network error. Please check settings.', 8000);
    },
    flow: 'implicit',
    ux_mode: 'popup',
    scope: 'openid profile email',
  });

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
      // Lazy load Firebase auth to reduce initial bundle size
      const { getAuth } = await import('firebase/auth');
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
  // Check if we have a valid client ID
  const hasValidClientId = GOOGLE_CLIENT_ID &&
                          GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' &&
                          GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com');

  console.log('🔍 [AUTH INIT] Checking Google Client ID...');
  console.log('🔍 [AUTH INIT] Client ID exists:', !!GOOGLE_CLIENT_ID);
  console.log('🔍 [AUTH INIT] Client ID value:', GOOGLE_CLIENT_ID?.substring(0, 20) + '...');
  console.log('🔍 [AUTH INIT] Client ID valid:', hasValidClientId);
  console.log('🔍 [AUTH INIT] Current URL:', window.location.href);
  console.log('🔍 [AUTH INIT] Current origin:', window.location.origin);

  if (!hasValidClientId) {
    // For local development or when client ID is not configured
    console.error('❌ [AUTH INIT] Google OAuth not configured. Running in guest mode.');
    console.error('❌ [AUTH INIT] Expected format: xxx.apps.googleusercontent.com');
    console.error('❌ [AUTH INIT] Got:', GOOGLE_CLIENT_ID);
    return (
      <AuthContext.Provider value={{
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        login: () => {
          console.error('Google Client ID not configured');
          alert('Google OAuth is not configured properly. Client ID: ' + GOOGLE_CLIENT_ID);
        },
        logout: () => {},
        loading: false,
        isSyncing: false,
        syncError: null,
        manualSync: async () => {},
        clearCache: () => {}
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  console.log('✅ [AUTH INIT] Google OAuth configured properly');
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </GoogleOAuthProvider>
  );
};