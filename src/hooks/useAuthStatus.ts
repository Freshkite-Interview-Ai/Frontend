'use client';

import { useSession } from 'next-auth/react';
import { backendAuthService } from '@/services/backendAuth';
import { useState, useEffect, useCallback } from 'react';

/**
 * Unified auth status hook that considers BOTH NextAuth (Google) and
 * backend local auth (email/password).
 *
 * Use this instead of checking `useSession().status` directly on pages.
 */
export function useAuthStatus() {
  const { data: session, status: nextAuthStatus } = useSession();
  const [localAuthChecked, setLocalAuthChecked] = useState(false);
  const [isLocalAuth, setIsLocalAuth] = useState(false);

  const refreshLocalAuth = useCallback(() => {
    setIsLocalAuth(backendAuthService.isAuthenticated());
    setLocalAuthChecked(true);
  }, []);

  useEffect(() => {
    refreshLocalAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshLocalAuth();
      }
    };

    window.addEventListener('focus', refreshLocalAuth);
    window.addEventListener('storage', refreshLocalAuth);
    window.addEventListener('prephire-auth-changed', refreshLocalAuth);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshLocalAuth);
      window.removeEventListener('storage', refreshLocalAuth);
      window.removeEventListener('prephire-auth-changed', refreshLocalAuth);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshLocalAuth]);

  useEffect(() => {
    refreshLocalAuth();
  }, [nextAuthStatus, refreshLocalAuth]);

  const isGoogleAuth = nextAuthStatus === 'authenticated';
  const isNextAuthLoading = nextAuthStatus === 'loading';

  // For local-auth users, do not block UI on NextAuth session loading.
  const isLoading = !localAuthChecked || (isNextAuthLoading && !isLocalAuth);

  // Authenticated via either method
  const isAuthenticated = isGoogleAuth || isLocalAuth;

  return {
    isAuthenticated,
    isLoading,
    isGoogleAuth,
    isLocalAuth,
    session,
    nextAuthStatus,
  };
}

export default useAuthStatus;
