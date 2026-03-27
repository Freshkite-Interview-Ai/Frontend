'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LoadingPage } from '@/components/ui';
import { backendAuthService, userService } from '@/services';
import { useAuthStore } from '@/store';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let hasRedirected = false;
    let hasFailed = false;
    let isPending = false;

    const resolveRedirect = async () => {
      // Stop if already done, failed, or a request is already in-flight
      if (hasRedirected || hasFailed || isPending) return;
      if (status === 'loading') return;

      if (status !== 'authenticated' || !session) {
        router.replace('/login');
        return;
      }

      // Exchange token with backend if not already authenticated
      if (!backendAuthService.isAuthenticated()) {
        const idToken = session?.idToken;
        if (!idToken) {
          // Wait for idToken to be available in the session
          return;
        }

        isPending = true;
        try {
          await backendAuthService.exchangeGoogleToken(idToken);
        } catch (err) {
          console.error('Failed to exchange token with backend:', err);
          hasFailed = true;
          if (isMounted) {
            setError('Unable to complete sign in. Please try again.');
          }
          return;
        } finally {
          isPending = false;
        }
      }

      // Fetch user profile and determine redirect
      isPending = true;
      try {
        const response = await userService.getMe();
        if (isMounted && response?.data) {
          setUser(response.data);
        }

        const tokenBalance = response?.data?.tokenBalance ?? 0;
        const onboardingCompleted = response?.data?.onboardingCompleted ?? false;

        hasRedirected = true;

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
        hasFailed = true;
        if (isMounted) {
          setError('Unable to complete sign in. Please try again.');
        }
      } finally {
        isPending = false;
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
