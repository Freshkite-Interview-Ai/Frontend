'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store';
import { User } from '@/types';
import { backendAuthService } from '@/services/backendAuth';
import logger from '@/lib/logger';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const { logout: storeLogout } = useAuthStore();
  const [backendAuthenticated, setBackendAuthenticated] = useState(false);
  const [isExchangingToken, setIsExchangingToken] = useState(false);
  const exchangeAttempted = useRef(false);

  const isLoading = status === 'loading' || isExchangingToken;
  const isAuthenticated = status === 'authenticated' && backendAuthenticated;

  // Check for token refresh errors
  const hasError = session?.error === 'RefreshAccessTokenError';

  // Get user from session or stored user
  const storedUser = backendAuthService.getUser();
  const user: User | null = storedUser
    ? {
        id: storedUser.id,
        email: storedUser.email,
        firstName: storedUser.name?.split(' ')[0] || '',
        lastName: storedUser.name?.split(' ').slice(1).join(' ') || '',
        username: storedUser.email?.split('@')[0] || '',
        avatar: storedUser.picture || undefined,
        isPaid: storedUser.isPaid ?? false,
        tokenBalance: storedUser.tokenBalance ?? 0,
      }
    : session?.user
    ? {
        id: session.user.id || '',
        email: session.user.email || '',
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        username: session.user.email?.split('@')[0] || '',
        avatar: session.user.image || undefined,
        isPaid: false,
        tokenBalance: 0,
      }
    : null;

  // Exchange Google token for backend JWT when session is ready
  useEffect(() => {
    const exchangeToken = async () => {
      // Check if already authenticated with backend
      if (backendAuthService.isAuthenticated()) {
        setBackendAuthenticated(true);
        return;
      }

      // Only proceed if we have a Google session with idToken
      if (status !== 'authenticated' || !session) return;
      
      const idToken = session?.idToken;
      if (!idToken) return;

      // Prevent multiple exchange attempts
      if (exchangeAttempted.current || isExchangingToken) return;
      exchangeAttempted.current = true;

      setIsExchangingToken(true);
      try {
        await backendAuthService.exchangeGoogleToken(idToken);
        setBackendAuthenticated(true);
        logger.info('auth', 'Backend authentication successful');
      } catch (error) {
        logger.error('auth', 'Failed to exchange token with backend', error);
        exchangeAttempted.current = false; // Allow retry
      } finally {
        setIsExchangingToken(false);
      }
    };

    exchangeToken();
  }, [session, status, isExchangingToken]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      // Clear backend tokens first
      await backendAuthService.logout();
      setBackendAuthenticated(false);
      exchangeAttempted.current = false;
      
      // Then sign out from NextAuth
      await signOut({ callbackUrl: '/' });
      storeLogout();
    } catch (error) {
      logger.error('auth', 'Logout failed', error);
      throw error;
    }
  }, [storeLogout]);

  // Auto-logout when token refresh fails
  useEffect(() => {
    if (hasError) {
      handleLogout();
    }
  }, [hasError, handleLogout]);

  // Login with Google (primary auth method)
  const login = useCallback(async () => {
    try {
      // Reset exchange attempt flag for new login
      exchangeAttempted.current = false;
      await signIn('google', { callbackUrl: '/auth/callback' });
    } catch (error) {
      logger.error('auth', 'Google login failed', error);
      throw error;
    }
  }, []);

  // Get backend access token for API calls
  const getToken = useCallback(async () => {
    return backendAuthService.getAccessToken();
  }, []);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    getToken,
  };
};

export default useAuth;
