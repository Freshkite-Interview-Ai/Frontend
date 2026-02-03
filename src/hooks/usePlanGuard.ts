'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store';
import { userService, backendAuthService } from '@/services';
import { Plan } from '@/types';

export type PlanRequirement = 'none' | 'basic' | 'pro';

interface UsePlanGuardResult {
  isChecking: boolean;
  userPlan: Plan | null;
  isPaid: boolean;
}

export const usePlanGuard = (required: PlanRequirement): UsePlanGuardResult => {
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

    const isPaid = user?.isPaid ?? false;
    const plan = user?.plan ?? null;

    if (required === 'basic' && !isPaid) {
      router.replace('/plan');
      return;
    }

    if (required === 'pro' && (!isPaid || plan !== 'pro')) {
      router.replace('/plan');
    }
  }, [isChecking, required, router, user?.isPaid, user?.plan]);

  return {
    isChecking,
    userPlan: user?.plan ?? null,
    isPaid: user?.isPaid ?? false,
  };
};

export default usePlanGuard;
