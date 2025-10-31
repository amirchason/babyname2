import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
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
    if (!data || typeof data !== 'object') return false;
    if (typeof data.id !== 'string' || !data.id) return false;
    if (typeof data.email !== 'string' || !data.email) return false;
    if (typeof data.name !== 'string') return false;
    if (typeof data.picture !== 'string') return false;
    return true;
  }, []);

  // Clear all user data and cache
  const clearCache = useCallback(() => {
    console.log('AuthContext: Clearing all caches...');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    userDataService.setUserId(null);
    favoritesService.setUserContext(null);
    setUser(null);
    console.log('AuthContext: Cache cleared');
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    console.log('AuthContext: Checking for existing session...');

    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');

    if (storedUser && accessToken && tokenExpiry) {
      // Check if token is still valid
      const expiryTime = parseInt(tokenExpiry);
      const now = Date.now();

      if (now < expiryTime) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (isValidUserData(parsedUser)) {
            console.log('AuthContext: Restored session for:', parsedUser.email);
            setUser(parsedUser);
            userDataService.setUserId(parsedUser.id);
            favoritesService.setUserContext(parsedUser.id);
          } else {
            console.log('AuthContext: Invalid stored user data, clearing...');
            clearCache();
          }
        } catch (error) {
          console.error('AuthContext: Error parsing stored user:', error);
          clearCache();
        }
      } else {
        console.log('AuthContext: Token expired, clearing session');
        clearCache();
      }
    } else {
      console.log('AuthContext: No existing session found');
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
      }
    } catch (error) {
      console.error('AuthContext: Error loading user data:', error);
      setSyncError('Failed to sync favorites');
      toast.error('Failed to sync favorites. Your local data is safe.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Google OAuth login using access token flow
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log('[AUTH] ===== GOOGLE LOGIN SUCCESSFUL =====');
      console.log('[AUTH] Access token received');

      try {
        // Store access token and expiry
        const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
        localStorage.setItem('google_access_token', tokenResponse.access_token);
        localStorage.setItem('google_token_expiry', expiryTime.toString());

        // Fetch user info from Google API
        console.log('[AUTH] Fetching user info from Google...');
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();
        console.log('[AUTH] User info received:', userInfo.email);

        // Create user data object
        const userData: User = {
          id: userInfo.sub, // Google's user ID
          email: userInfo.email,
          name: userInfo.name || 'User',
          picture: userInfo.picture || '',
          isAdmin: isAdminEmail(userInfo.email),
        };

        // Save user data
        console.log('[AUTH] Saving user data...');
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userEmail', userData.email);

        // Set user ID for cloud sync
        userDataService.setUserId(userData.id);
        favoritesService.setUserContext(userData.id);

        // Load user data from cloud
        await loadUserData(userData.id);

        console.log('[AUTH] ===== LOGIN COMPLETE =====');
        toast.success(`Welcome back, ${userData.name.split(' ')[0]}!`);
      } catch (error: any) {
        console.error('[AUTH] ===== LOGIN ERROR =====');
        console.error('[AUTH] Error:', error);
        toast.error(`Login failed: ${error.message}`);
        clearCache();
      }
    },
    onError: (error) => {
      console.error('[AUTH] ===== OAUTH ERROR =====');
      console.error('[AUTH] Error:', error);
      toast.error('Login failed. Please try again.');
    },
    onNonOAuthError: (error) => {
      console.error('[AUTH] ===== NON-OAUTH ERROR =====');
      console.error('[AUTH] Error:', error);
      toast.error('Login error. Please try again.');
    },
  });

  const login = () => {
    console.log('[AUTH] ===== INITIATING GOOGLE LOGIN =====');
    googleLogin();
  };

  const logout = async () => {
    console.log('AuthContext: Logging out...');

    // Show overlay immediately
    setShowLogoutOverlay(true);

    try {
      // Clear cloud sync
      userDataService.setUserId(null);
      favoritesService.setUserContext(null);

      // Clear Google OAuth session
      googleLogout();

      // Clear local storage
      clearCache();

      console.log('AuthContext: Logout complete');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('AuthContext: Error during logout:', error);
      toast.error('Error during logout');
    } finally {
      // Hide overlay after a short delay
      setTimeout(() => {
        setShowLogoutOverlay(false);
      }, 800);
    }
  };

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
      console.error('Manual sync error:', error);
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
    return <LoadingOverlay message="Loading..." />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showLogoutOverlay && <LogoutOverlay />}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error('REACT_APP_GOOGLE_CLIENT_ID is not configured');
    return (
      <AuthContext.Provider
        value={{
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          login: () => console.error('Google Client ID not configured'),
          logout: () => {},
          loading: false,
          isSyncing: false,
          syncError: null,
          manualSync: async () => {},
          clearCache: () => {},
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </GoogleOAuthProvider>
  );
};
