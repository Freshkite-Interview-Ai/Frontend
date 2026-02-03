import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

/**
 * Token storage keys
 */
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'interview_ai_access_token',
  REFRESH_TOKEN: 'interview_ai_refresh_token',
  TOKEN_EXPIRY: 'interview_ai_token_expiry',
  USER: 'interview_ai_user',
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
  plan?: 'basic' | 'pro' | null;
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
      console.error('Token refresh failed:', error);
      backendAuthService.clearTokens();
    }

    return null;
  },

  /**
   * Store tokens in localStorage
   */
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number): void => {
    if (typeof window === 'undefined') return;

    const expiryTime = Date.now() + expiresIn * 1000;

    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  },

  /**
   * Get access token (refreshes if expired)
   */
  getAccessToken: async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const expiry = localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);

    if (!accessToken || !expiry) {
      return null;
    }

    // Check if token is expired (with 60 second buffer)
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() > expiryTime - 60000) {
      // Token expired, try to refresh
      return backendAuthService.refreshAccessToken();
    }

    return accessToken;
  },

  /**
   * Get access token synchronously (no refresh)
   */
  getAccessTokenSync: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  /**
   * Store user data
   */
  setUser: (user: StoredUser): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Get stored user data
   */
  getUser: (): StoredUser | null => {
    if (typeof window === 'undefined') return null;

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
    if (typeof window === 'undefined') return false;

    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);

    return !!(accessToken && refreshToken);
  },

  /**
   * Clear all tokens and user data (logout)
   */
  clearTokens: (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
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
      console.error('Logout API call failed:', error);
    } finally {
      backendAuthService.clearTokens();
    }
  },
};

export default backendAuthService;
