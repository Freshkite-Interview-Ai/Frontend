'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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

    const resolveRedirect = async () => {
      if (hasRedirected) return;
      if (status === 'loading') return;

      if (status !== 'authenticated' || !session) {
        router.replace('/login');
        return;
      }

      // Exchange token with backend if not already authenticated
      if (!backendAuthService.isAuthenticated()) {
        const idToken = session?.idToken;
        if (!idToken) {
          // Wait for idToken to be available
          console.log('Waiting for idToken...');
          return;
        }

        try {
          await backendAuthService.exchangeGoogleToken(idToken);
        } catch (err) {
          console.error('Failed to exchange token with backend:', err);
          if (isMounted) {
            setError('Unable to complete sign in. Please try again.');
          }
          return;
        }
      }

      // Fetch user profile and determine redirect
      try {
        const response = await userService.getMe();
        if (isMounted && response?.data) {
          setUser(response.data);
        }

        const isPaid = response?.data?.isPaid ?? false;
        const plan = response?.data?.plan ?? null;

        hasRedirected = true;

        if (!isPaid || !plan) {
          router.replace('/plan');
        } else {
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Failed to resolve auth callback:', err);
        if (isMounted) {
          setError('Unable to complete sign in. Please try again.');
        }
      }
    };

    resolveRedirect();

    const pollId = window.setInterval(() => {
      resolveRedirect();
    }, 500);

    return () => {
      isMounted = false;
      window.clearInterval(pollId);
    };
  }, [router, setUser, status, session]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.replace('/login')}
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
