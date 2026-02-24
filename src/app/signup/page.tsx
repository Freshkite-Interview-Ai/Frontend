'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button, Input, LoadingPage } from '@/components/ui';
import { useAuth } from '@/hooks';
import { companyAuthService } from '@/services';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'candidate' | 'company'>('candidate');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const mode = searchParams?.get('mode');
    setAuthMode(mode === 'company' ? 'company' : 'candidate');
  }, [searchParams]);

  useEffect(() => {
    setError('');
  }, [authMode]);

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

  const handleCompanySignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCompanyLoading(true);
    setError('');

    try {
      await companyAuthService.signup(
        companyName.trim(),
        companyEmail.trim(),
        companyPassword
      );
      router.push('/company/dashboard');
    } catch (err) {
      setError('Company signup failed. Please try again.');
    } finally {
      setIsCompanyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800 flex items-center justify-center px-4 py-12">
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
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Create Account</h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Start your interview preparation journey
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-secondary-100 dark:border-secondary-700 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 rounded-2xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50/70 dark:bg-secondary-700/40 p-1 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('candidate')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                authMode === 'candidate'
                  ? 'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white shadow-sm'
                  : 'text-secondary-500 dark:text-secondary-300'
              }`}
            >
              Signup as Candidate
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('company')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                authMode === 'company'
                  ? 'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white shadow-sm'
                  : 'text-secondary-500 dark:text-secondary-300'
              }`}
            >
              Signup as Company
            </button>
          </div>

          {authMode === 'candidate' ? (
            <div className="space-y-4">
              <p className="text-center text-secondary-600 dark:text-secondary-400 mb-6">
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

              <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                You will be redirected to our secure registration portal
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleCompanySignup}>
              <Input
                label="Company Name"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Acme Corp"
                required
              />
              <Input
                label="Company Email"
                type="email"
                value={companyEmail}
                onChange={(event) => setCompanyEmail(event.target.value)}
                placeholder="recruiter@company.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={companyPassword}
                onChange={(event) => setCompanyPassword(event.target.value)}
                placeholder="Create a password"
                required
              />
              <Button type="submit" fullWidth size="lg" isLoading={isCompanyLoading}>
                Create Company Account
              </Button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
            Already have an account?{' '}
            <Link
              href={authMode === 'company' ? '/login?mode=company' : '/login'}
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-8">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingPage message="Loading signup page..." />}>
      <SignupPageContent />
    </Suspense>
  );
}
