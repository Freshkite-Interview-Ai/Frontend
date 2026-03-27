import axios from 'axios';
import logger from '@/lib/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

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

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName?: string;
  mobile?: string;
  picture?: string;
  authProvider?: 'google' | 'local';
  emailVerified?: boolean;
  isPaid?: boolean;
  tokenBalance?: number;
}

export interface AuthResponse {
  user: StoredUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignupInput {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  mobile: string;
}

/**
 * Backend Auth Service
 * Handles all authentication flows: Google OAuth, email/password, OTP
 */
export const backendAuthService = {
  /**
   * Register with email + password. Backend sends OTP email.
   */
  signup: async (input: SignupInput): Promise<{ message: string; email: string }> => {
    const response = await axios.post<{ success: boolean; data: { message: string; email: string } }>(
      `${API_URL}/auth/signup`,
      input
    );
    return response.data.data;
  },

  /**
   * Verify OTP and activate account. Returns JWT tokens.
   */
  verifyOtp: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await axios.post<{ success: boolean; data: AuthResponse }>(
      `${API_URL}/auth/verify-otp`,
      { email, otp }
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, expiresIn, user } = response.data.data;
      backendAuthService.setTokens(accessToken, refreshToken, expiresIn);
      backendAuthService.setUser(user);
      return response.data.data;
    }

    throw new Error('OTP verification failed');
  },

  /**
   * Resend OTP to email.
   */
  resendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await axios.post<{ success: boolean; data: { message: string } }>(
      `${API_URL}/auth/resend-otp`,
      { email }
    );
    return response.data.data;
  },

  /**
   * Login with email + password.
   */
  localLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post<{ success: boolean; data: AuthResponse }>(
      `${API_URL}/auth/login`,
      { email, password }
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, expiresIn, user } = response.data.data;
      backendAuthService.setTokens(accessToken, refreshToken, expiresIn);
      backendAuthService.setUser(user);
      return response.data.data;
    }

    throw new Error('Login failed');
  },

  /**
   * Exchange Google ID token for our backend JWT.
   */
  exchangeGoogleToken: async (googleIdToken: string): Promise<AuthResponse> => {
    const response = await axios.post<{ success: boolean; data: AuthResponse }>(
      `${API_URL}/auth/google`,
      { idToken: googleIdToken }
    );

    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, expiresIn, user } = response.data.data;
      backendAuthService.setTokens(accessToken, refreshToken, expiresIn);
      backendAuthService.setUser(user);
      return response.data.data;
    }

    throw new Error('Failed to exchange Google token');
  },

  /**
   * Refresh access token using refresh token (with dedup).
   */
  refreshAccessToken: async (): Promise<string | null> => {
    const refreshToken = backendAuthService.getRefreshToken();
    if (!refreshToken) return null;

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

  setTokens: (accessToken: string, refreshToken: string, expiresIn: number): void => {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    if (!sessionStorage || !localStorage) return;

    const expiryTime = Date.now() + expiresIn * 1000;
    sessionStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    sessionStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());

    // Set a cookie so Next.js middleware can recognise local-auth users
    document.cookie = 'prephire_local_auth=1; path=/; SameSite=Strict; max-age=604800';
  },

  getAccessToken: async (): Promise<string | null> => {
    const sessionStorage = getSessionStorage();
    if (!sessionStorage) return null;

    const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const expiry = sessionStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);

    if (!accessToken || !expiry) return null;

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

  getAccessTokenSync: (): string | null => {
    const sessionStorage = getSessionStorage();
    if (!sessionStorage) return null;
    return sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    const localStorage = getLocalStorage();
    if (!localStorage) return null;
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  setUser: (user: StoredUser): void => {
    const localStorage = getLocalStorage();
    if (!localStorage) return;
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
  },

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

  isAuthenticated: (): boolean => {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    if (!sessionStorage || !localStorage) return false;

    const accessToken = sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    const expiry = sessionStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);

    if (!accessToken || !refreshToken) return false;

    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        return !!refreshToken;
      }
    }

    return true;
  },

  clearTokens: (): void => {
    const sessionStorage = getSessionStorage();
    const localStorage = getLocalStorage();
    if (!sessionStorage || !localStorage) return;

    sessionStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(TOKEN_KEYS.USER);

    // Clear the middleware auth cookie
    document.cookie = 'prephire_local_auth=; path=/; SameSite=Strict; max-age=0';
  },

  logout: async (): Promise<void> => {
    try {
      const accessToken = backendAuthService.getAccessTokenSync();
      const refreshToken = backendAuthService.getRefreshToken();
      if (accessToken) {
        await axios.post(
          `${API_URL}/auth/logout`,
          { refreshToken },
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
