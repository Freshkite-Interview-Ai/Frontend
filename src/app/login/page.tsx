'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, LoadingPage, Logo } from '@/components/ui';
import { useAuth } from '@/hooks';
import { backendAuthService } from '@/services';
import { companyAuthService } from '@/services';
import useAuthStore from '@/store/authStore';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

// Maps backend error codes to friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Incorrect email or password.',
  EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts. Try again later.',
  TOO_MANY_REQUESTS: 'Too many attempts. Please wait and try again.',
};

function parseBackendError(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as any).response;
    const code = res?.data?.error?.code || res?.data?.code;
    if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    const message = res?.data?.error?.message || res?.data?.message;
    if (message) return message;
  }
  return 'Something went wrong. Please try again.';
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: googleLogin } = useAuth();
  const { login: storeLogin, isAuthenticated } = useAuthStore();

  const [authMode, setAuthMode] = useState<'candidate' | 'company'>('candidate');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    const mode = searchParams?.get('mode');
    setAuthMode(mode === 'company' ? 'company' : 'candidate');
  }, [searchParams]);

  useEffect(() => {
    setError('');
  }, [authMode]);

  // Redirect already-authenticated users (Google session)
  useEffect(() => {
    if (isAuthenticated) router.push('/auth/callback');
  }, [isAuthenticated, router]);

  const handleLocalLogin = async (data: LoginForm) => {
    setError('');
    try {
      const result = await backendAuthService.localLogin(data.email, data.password);
      // setTokens() inside localLogin already set the prephire_local_auth cookie
      storeLogin(
        {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName || result.user.name?.split(' ')[0] || '',
          lastName: result.user.lastName,
        },
        result.accessToken,
        result.refreshToken
      );
      router.push('/dashboard');
    } catch (err) {
      setError(parseBackendError(err));
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await googleLogin();
    } catch {
      setError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleCompanyLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCompanyLoading(true);
    setError('');
    try {
      await companyAuthService.login(companyEmail.trim(), companyPassword);
      router.push('/company/dashboard');
    } catch {
      setError('Company login failed. Please check your credentials.');
    } finally {
      setIsCompanyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-900 dark:via-secondary-800 dark:to-secondary-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 dark:bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-400/20 dark:bg-secondary-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center justify-center group">
            <Logo size="lg" iconOnly />
          </Link>
          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-secondary-900 to-secondary-600 dark:from-white dark:to-secondary-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">
            Sign in to continue to Prephire
          </p>
        </div>

        <div className="bg-white/80 dark:bg-secondary-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-secondary-200/50 dark:border-secondary-700/50 p-8">
          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Mode switcher */}
          <div className="flex items-center gap-2 rounded-2xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50/70 dark:bg-secondary-700/40 p-1 mb-6">
            {(['candidate', 'company'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setAuthMode(mode)}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  authMode === mode
                    ? 'bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white shadow-sm'
                    : 'text-secondary-500 dark:text-secondary-300'
                }`}
              >
                {mode === 'candidate' ? 'Candidate' : 'Company'}
              </button>
            ))}
          </div>

          {authMode === 'candidate' ? (
            <div className="space-y-4">
              {/* Email/password form */}
              <form onSubmit={handleSubmit(handleLocalLogin)} className="space-y-4" noValidate>
                <div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                  Sign In
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-200 dark:border-secondary-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-secondary-800 text-secondary-500">or</span>
                </div>
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white dark:bg-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-600 text-secondary-700 dark:text-secondary-200 font-medium rounded-2xl border-2 border-secondary-200 dark:border-secondary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isGoogleLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleCompanyLogin}>
              <Input
                label="Company Email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="recruiter@company.com"
                required
              />
              <Input
                label="Password"
                type="password"
                value={companyPassword}
                onChange={(e) => setCompanyPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <Button type="submit" fullWidth size="lg" isLoading={isCompanyLoading}>
                Sign in as Company
              </Button>
              <p className="text-center text-sm text-secondary-500 dark:text-secondary-400">
                New here?{' '}
                <Link href="/signup?mode=company" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  Create a company account
                </Link>
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-8">
          By signing in, you agree to our{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingPage message="Loading login page..." />}>
      <LoginPageContent />
    </Suspense>
  );
}
