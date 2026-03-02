import axios from 'axios';
import logger from '@/lib/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'prephire_access_token',
  REFRESH_TOKEN: 'prephire_refresh_token',
  TOKEN_EXPIRY: 'prephire_token_expiry',
  USER: 'prephire_user',
};

let pendingRefreshPromise: Promise<string | null> | null = null;

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
};

const getLocalStorage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

/**
 * User data stored with tokens
 */
export interface StoredUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  isPaid?: boolean;
  tokenBalance?: number;
}

/**
 * Auth response from backend
 */
export interface AuthResponse {
  user: StoredUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Backend Auth Service
 * Handles token exchange and storage for custom JWT flow
 */
export const backendAuthService = {
  /**
   * Exchange Google ID token for our backend JWT
   */
  exchangeGoogleToken: async (googleIdToken: string): Promise<AuthResponse> => {
    const response = await axios.post<{ success: boolean; data: AuthResponse }>(
      `${API_URL}/auth/google`,
      { idToken: googleIdToken }
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, expiresIn, user } = response.data.data;
      
      // Store tokens
      backendAuthService.setTokens(accessToken, refreshToken, expiresIn);
      backendAuthService.setUser(user);

      return response.data.data;
    }

    throw new Error('Failed to exchange Google token');
  },

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken: async (): Promise<string | null> => {
    const refreshToken = backendAuthService.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post<{
        success: boolean;
        data: { accessToken: string; refreshToken: string; expiresIn: number };
      }>(`${API_URL}/auth/refresh`, { refreshToken });

      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data;
        
        backendAuthService.setTokens(accessToken, newRefreshToken, expiresIn);
        
        return accessToken;
      }
    } catch (error) {
      logger.warn('backendAuth', 'Token refresh failed', error);
      backendAuthService.clearTokens();
    }

    return null;
  },

  /**
   * Store tokens in localStorage
   */
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number): void => {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    if (!sessionStorage || !localStorage) return;

    const expiryTime = Date.now() + expiresIn * 1000;

    sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    sessionStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  },

  /**
   * Get access token (refreshes if expired)
   */
  getAccessToken: async (): Promise<string | null> => {
    const sessionStorage = getSessionStorage();
    if (!sessionStorage) return null;

    const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const expiry = sessionStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);

    if (!accessToken || !expiry) {
      return null;
    }

    // Check if token is expired (with 60 second buffer)
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() > expiryTime - 60000) {
      if (!pendingRefreshPromise) {
        pendingRefreshPromise = backendAuthService.refreshAccessToken().finally(() => {
          pendingRefreshPromise = null;
        });
      }
      return pendingRefreshPromise;
    }

    return accessToken;
  },

  /**
   * Get access token synchronously (no refresh)
   */
  getAccessTokenSync: (): string | null => {
    const sessionStorage = getSessionStorage();
    if (!sessionStorage) return null;
    return sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    const localStorage = getLocalStorage();
    if (!localStorage) return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  /**
   * Store user data
   */
  setUser: (user: StoredUser): void => {
    const localStorage = getLocalStorage();
    if (!localStorage) return;
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Get stored user data
   */
  getUser: (): StoredUser | null => {
    const localStorage = getLocalStorage();
    if (!localStorage) return null;

    const userData = localStorage.getItem(TOKEN_KEYS.USER);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated (has valid tokens)
   */
  isAuthenticated: (): boolean => {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    if (!sessionStorage || !localStorage) return false;

    const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

    return !!(accessToken && refreshToken);
  },

  /**
   * Clear all tokens and user data (logout)
   */
  clearTokens: (): void => {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    if (!sessionStorage || !localStorage) return;

    sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_KEYS.USER);
  },

  /**
   * Logout - clear tokens and call backend
   */
  logout: async (): Promise<void> => {
    try {
      const accessToken = backendAuthService.getAccessTokenSync();
      if (accessToken) {
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (error) {
      logger.warn('backendAuth', 'Logout API call failed', error);
    } finally {
      backendAuthService.clearTokens();
    }
  },
};

export default backendAuthService;
