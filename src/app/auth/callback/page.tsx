'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LoadingPage } from '@/components/ui';
import { backendAuthService, userService } from '@/services';
import { useAuthStore } from '@/store';

const MAX_RETRIES = 40; // 40 × 500ms = 20 seconds max wait

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid stale closure issues when deps change
  const hasRedirected = useRef(false);
  const hasFailed = useRef(false);
  const isPending = useRef(false);
  const retryCount = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const resolveRedirect = async () => {
      // Stop if already done, failed, or a request is already in-flight
      if (hasRedirected.current || hasFailed.current || isPending.current) return;
      if (status === 'loading') return;

      if (status !== 'authenticated' || !session) {
        router.replace('/login');
        return;
      }

      // Exchange token with backend if not already authenticated
      if (!backendAuthService.isAuthenticated()) {
        const idToken = session?.idToken;
        if (!idToken) {
          retryCount.current += 1;
          // Timeout: give up after MAX_RETRIES
          if (retryCount.current >= MAX_RETRIES) {
            hasFailed.current = true;
            if (isMounted) {
              setError('Sign-in is taking too long. Please try again.');
            }
          }
          // Wait for idToken to be available in the session
          return;
        }

        isPending.current = true;
        try {
          await backendAuthService.exchangeGoogleToken(idToken);
        } catch (err) {
          console.error('Failed to exchange token with backend:', err);
          hasFailed.current = true;
          if (isMounted) {
            setError('Unable to complete sign in. Please try again.');
          }
          return;
        } finally {
          isPending.current = false;
        }
      }

      // Fetch user profile and determine redirect
      isPending.current = true;
      try {
        const response = await userService.getMe();
        if (isMounted && response?.data) {
          setUser(response.data);
        }

        const tokenBalance = response?.data?.tokenBalance ?? 0;
        const onboardingCompleted = response?.data?.onboardingCompleted ?? false;

        hasRedirected.current = true;

        // Redirect based on onboarding status and token balance
        if (tokenBalance <= 0) {
          router.replace('/tokens');
        } else if (!onboardingCompleted) {
          router.replace('/onboarding');
        } else {
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Failed to resolve auth callback:', err);
        hasFailed.current = true;
        if (isMounted) {
          setError('Unable to complete sign in. Please try again.');
        }
      } finally {
        isPending.current = false;
      }
    };

    resolveRedirect();

    const pollId = window.setInterval(resolveRedirect, 500);

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
    };
  }, [router, setUser, status, session]);

  const handleBackToLogin = async () => {
    backendAuthService.clearTokens();
    await signOut({ redirect: false });
    router.replace('/login');
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleBackToLogin}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return <LoadingPage message="Signing you in..." />;
}
