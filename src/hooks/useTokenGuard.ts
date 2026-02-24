'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store';
import { userService, backendAuthService } from '@/services';

// Pages that should NOT redirect to /tokens when balance is 0
const TOKEN_REDIRECT_EXEMPT_PATHS = ['/tokens', '/profile', '/company'];

interface UseTokenGuardResult {
  isChecking: boolean;
  tokenBalance: number;
  isPaid: boolean;
  hasTokens: boolean;
}

export const useTokenGuard = (): UseTokenGuardResult => {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const { user, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

  const isExemptPath = TOKEN_REDIRECT_EXEMPT_PATHS.some(
    (exemptPath) => pathname === exemptPath || pathname?.startsWith(exemptPath + '/')
  );

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (status === 'loading') return;

      if (status !== 'authenticated') {
        router.replace('/login');
        return;
      }

      if (hasLoadedProfile) {
        setIsChecking(false);
        return;
      }

      if (!backendAuthService.isAuthenticated()) {
        return;
      }

      try {
        const response = await userService.getMe();
        if (isMounted && response?.data) {
          setUser(response.data);
        }
        if (isMounted) {
          setHasLoadedProfile(true);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        if (isMounted) {
          setHasLoadedProfile(true);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    loadUser();

    const pollId = window.setInterval(() => {
      if (!hasLoadedProfile) {
        loadUser();
      }
    }, 400);

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
    };

  }, [hasLoadedProfile, router, setUser, status]);

  useEffect(() => {
    if (isChecking || !hasLoadedProfile) return;
    // Don't redirect on exempt paths (e.g., /tokens itself)
    if (isExemptPath) return;

    const tokenBalance = user?.tokenBalance ?? 0;

    if (tokenBalance <= 0) {
      router.replace('/tokens');
    }
  }, [isChecking, hasLoadedProfile, router, user?.tokenBalance, isExemptPath]);

  return {
    isChecking,
    tokenBalance: user?.tokenBalance ?? 0,
    isPaid: user?.isPaid ?? false,
    hasTokens: (user?.tokenBalance ?? 0) > 0,
  };
};

export default useTokenGuard;
