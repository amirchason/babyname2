import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import userDataService from '../services/userDataService';
import favoritesService from '../services/favoritesService';
import { useToast } from './ToastContext';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
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

        console.log('[AUTH DEBUG] Setting user:', userData.email);
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

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Fetch user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });

        const userInfo: GoogleUserInfo = await userInfoResponse.json();

        const userData: User = {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('google_access_token', response.access_token);

        // Set user ID for cloud sync
        userDataService.setUserId(userData.id);
        favoritesService.setUserContext(userData.id);

        // Load and merge user data from cloud
        await loadUserData(userData.id);
        toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
      } catch (error) {
        console.error('Failed to get user info:', error);
        toast.error('Login failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast.error('Login failed. Please try again.');
    },
    flow: 'implicit',
  });

  const logout = () => {
    // Save data before logout
    if (user) {
      const favorites = favoritesService.getFavorites();
      const dislikes = favoritesService.getDislikes();
      userDataService.saveToCloud(favorites, dislikes)
        .then(() => {
          toast.success('Favorites saved. See you next time!');
        })
        .catch((error) => {
          console.error('Error saving data on logout:', error);
          toast.warning('Logged out, but some favorites may not have synced.');
        });
    }

    setUser(null);
    userDataService.disconnect();
    favoritesService.setUserContext(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('google_access_token');
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
      login,
      logout,
      loading,
      isSyncing,
      syncError,
      manualSync,
      clearCache
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if we have a valid client ID
  const hasValidClientId = GOOGLE_CLIENT_ID &&
                          GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' &&
                          GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com');

  if (!hasValidClientId) {
    // For local development or when client ID is not configured
    console.log('Google OAuth not configured. Running in guest mode.');
    return (
      <AuthContext.Provider value={{
        user: null,
        isAuthenticated: false,
        login: () => console.log('Google Client ID not configured'),
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

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </GoogleOAuthProvider>
  );
};