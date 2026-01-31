'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button, LoadingPage } from '@/components/ui';
import { useAuth } from '@/hooks';

export default function SignupPage() {
  const router = useRouter();
  const { status } = useSession();
  const { login } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <LoadingPage message="Checking authentication..." />;
  }

  if (status === 'authenticated') {
    return null;
  }

  const handleSignup = async () => {
    // Keycloak handles registration - just redirect to login
    // Users can register through Keycloak's registration page
    await login();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl mb-4 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-secondary-900">Create Account</h1>
          <p className="mt-2 text-secondary-600">
            Start your interview preparation journey
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-100 p-8">
          <div className="space-y-4">
            <p className="text-center text-secondary-600 mb-6">
              Click below to create your account through our secure portal.
            </p>

            <Button
              onClick={handleSignup}
              fullWidth
              size="lg"
              className="h-14 text-base"
              leftIcon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              }
            >
              Create Account
            </Button>

            <p className="text-center text-sm text-secondary-500 mt-4">
              You will be redirected to our secure registration portal
            </p>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-secondary-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-secondary-500 mt-8">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
