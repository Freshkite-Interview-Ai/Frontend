'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { userService } from '@/services';
import { useAuthStore } from '@/store';
import { User } from '@/types';
import { useAuthStatus } from './useAuthStatus';

export interface ProfileDetails {
  name: string;
  email: string;
  /** Remote avatar URL, or null when the user has none (render initials instead) */
  image: string | null;
  /** Uppercase first letter used for the fallback avatar */
  initial: string;
  mobile: string | null;
  location: string | null;
  bio: string | null;
  /** 'Google' | 'Email & Password' - how the account signs in */
  providerLabel: string;
  memberSince: string | null;
}

/**
 * Single profile retrieval flow for BOTH Google and manually registered users.
 *
 * The backend `/me` response is the source of truth (it exists for every account
 * regardless of auth method); the NextAuth session only fills in the Google avatar
 * and acts as a fallback for name/email while `/me` is still loading.
 */
export function useProfile() {
  const { isAuthenticated, session } = useAuthStatus();
  const { user: storedUser, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const response = await userService.getMe();
      if (response?.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, setUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const sessionUser = session?.user;

  const profile: ProfileDetails = useMemo(() => {
    const fullName =
      storedUser?.displayName?.trim() ||
      storedUser?.name?.trim() ||
      [storedUser?.firstName, storedUser?.lastName].filter(Boolean).join(' ').trim() ||
      sessionUser?.name?.trim() ||
      '';
    const email = storedUser?.email || sessionUser?.email || '';
    const image = storedUser?.avatar || storedUser?.picture || sessionUser?.image || null;

    return {
      name: fullName || 'User',
      email,
      image,
      initial: (fullName || email || 'U').charAt(0).toUpperCase(),
      mobile: storedUser?.mobile || null,
      location: storedUser?.location || null,
      bio: storedUser?.bio || null,
      providerLabel:
        (storedUser?.authProvider ?? (sessionUser ? 'google' : 'local')) === 'google'
          ? 'Google'
          : 'Email & Password',
      memberSince: storedUser?.createdAt
        ? new Date(storedUser.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })
        : null,
    };
  }, [storedUser, sessionUser]);

  return {
    profile,
    /** Raw backend user - use for fields not covered by ProfileDetails */
    user: storedUser as User | null,
    isLoading,
    refresh: loadProfile,
  };
}

export default useProfile;
