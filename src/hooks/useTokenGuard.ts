'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store';
import { userService, backendAuthService } from '@/services';

interface UseTokenGuardResult {
  isChecking: boolean;
  tokenBalance: number;
  isPaid: boolean;
  hasTokens: boolean;
}

export const useTokenGuard = (): UseTokenGuardResult => {
  const router = useRouter();
  const { status } = useSession();
  const { user, setUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);

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

    const tokenBalance = user?.tokenBalance ?? 0;

    if (tokenBalance <= 0) {
      router.replace('/tokens');
    }
  }, [isChecking, hasLoadedProfile, router, user?.tokenBalance]);

  return {
    isChecking,
    tokenBalance: user?.tokenBalance ?? 0,
    isPaid: user?.isPaid ?? false,
    hasTokens: (user?.tokenBalance ?? 0) > 0,
  };
};

export default useTokenGuard;
