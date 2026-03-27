'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
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

// ─── Schemas ──────────────────────────────────────────────────────────────────

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().max(50).optional(),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number'),
  mobile: z
    .string()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid mobile (e.g. +919876543210)'),
});

type SignupForm = z.infer<typeof signupSchema>;

// Maps backend codes → readable messages
const ERROR_MESSAGES: Record<string, string> = {
  CONFLICT: 'An account with this email already exists.',
  TOO_MANY_REQUESTS: 'Too many attempts. Please wait before trying again.',
  OTP_EXPIRED: 'Code expired. Please request a new one.',
  OTP_INVALID: 'Incorrect code.',
  OTP_TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please request a new code.',
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

// ─── OTP Step ─────────────────────────────────────────────────────────────────

interface OtpStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

function OtpStep({ email, onVerified, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    setError('');
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await backendAuthService.verifyOtp(email, code);
      // Store in authStore via the hook is done by parent
      onVerified();
    } catch (err) {
      setError(parseBackendError(err));
      // Clear invalid OTP fields
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    try {
      await backendAuthService.resendOtp(email);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(parseBackendError(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
          <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Check your email</h2>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          We sent a 6-digit code to <span className="font-medium text-secondary-700 dark:text-secondary-300">{email}</span>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* OTP inputs */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition-all"
          />
        ))}
      </div>

      <Button
        fullWidth
        size="lg"
        onClick={handleVerify}
        isLoading={isLoading}
        disabled={otp.join('').length < 6}
      >
        Verify Email
      </Button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors"
        >
          ← Change email
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isResending}
          className="text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed transition-all"
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : isResending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Signup Page ─────────────────────────────────────────────────────────

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: googleLogin } = useAuth();
  const { login: storeLogin } = useAuthStore();

  const [authMode, setAuthMode] = useState<'candidate' | 'company'>('candidate');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPassword, setCompanyPassword] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const password = watch('password', '');

  useEffect(() => {
    const mode = searchParams?.get('mode');
    setAuthMode(mode === 'company' ? 'company' : 'candidate');
  }, [searchParams]);

  useEffect(() => {
    setGlobalError('');
  }, [authMode]);


  const handleSignup = async (data: SignupForm) => {
    setGlobalError('');
    try {
      await backendAuthService.signup({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        mobile: data.mobile,
      });
      setPendingEmail(data.email);
      setStep('otp');
    } catch (err) {
      setGlobalError(parseBackendError(err));
    }
  };

  const handleOtpVerified = () => {
    // backendAuthService.verifyOtp() already called setTokens() which set
    // the prephire_local_auth cookie — middleware will now allow /dashboard
    const stored = backendAuthService.getUser();
    if (stored) {
      storeLogin(
        {
          id: stored.id,
          email: stored.email,
          firstName: stored.firstName || stored.name?.split(' ')[0] || '',
          lastName: stored.lastName,
        },
        backendAuthService.getAccessTokenSync() || '',
        backendAuthService.getRefreshToken() || ''
      );
    }
    router.push('/dashboard');
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setGlobalError('');
    try {
      await googleLogin();
    } catch {
      setGlobalError('Google sign-in failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const handleCompanySignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCompanyLoading(true);
    setGlobalError('');
    try {
      await companyAuthService.signup(companyName.trim(), companyEmail.trim(), companyPassword);
      router.push('/company/dashboard');
    } catch {
      setGlobalError('Company signup failed. Please try again.');
    } finally {
      setIsCompanyLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pw: string): { level: number; label: string; color: string } => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { level: score, label: 'Fair', color: 'bg-yellow-500' };
    return { level: score, label: 'Strong', color: 'bg-green-500' };
  };

  const pwStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center justify-center group">
            <Logo size="lg" iconOnly />
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-secondary-900 dark:text-white">
            {step === 'otp' ? 'Verify Your Email' : 'Create Account'}
          </h1>
          {step === 'form' && (
            <p className="mt-2 text-secondary-600 dark:text-secondary-400">
              Start your interview preparation journey
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl border border-secondary-100 dark:border-secondary-700 p-8">
          {/* Error banner */}
          {globalError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {globalError}
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <OtpStep
              email={pendingEmail}
              onVerified={handleOtpVerified}
              onBack={() => setStep('form')}
            />
          )}

          {/* Registration Form */}
          {step === 'form' && (
            <>
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
                  {/* Candidate registration form */}
                  <form onSubmit={handleSubmit(handleSignup)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          label="First Name"
                          placeholder="John"
                          autoComplete="given-name"
                          {...register('firstName')}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          label="Last Name (optional)"
                          placeholder="Doe"
                          autoComplete="family-name"
                          {...register('lastName')}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

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
                        label="Mobile"
                        type="tel"
                        placeholder="+919876543210"
                        autoComplete="tel"
                        {...register('mobile')}
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mobile.message}</p>
                      )}
                    </div>

                    <div>
                      <Input
                        label="Password"
                        type="password"
                        placeholder="Min 8 chars, 1 uppercase, 1 number"
                        autoComplete="new-password"
                        {...register('password')}
                      />
                      {/* Password strength bar */}
                      {password && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((bar) => (
                              <div
                                key={bar}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  bar <= pwStrength.level ? pwStrength.color : 'bg-secondary-200 dark:bg-secondary-600'
                                }`}
                              />
                            ))}
                          </div>
                          {pwStrength.label && (
                            <p className={`text-xs ${pwStrength.color.replace('bg-', 'text-')}`}>
                              {pwStrength.label}
                            </p>
                          )}
                        </div>
                      )}
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
                      )}
                    </div>

                    <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                      Create Account
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
                    onClick={handleGoogleSignup}
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
                    <span>Sign up with Google</span>
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleCompanySignup}>
                  <Input
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Corp"
                    required
                  />
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
                    placeholder="Create a password"
                    required
                  />
                  <Button type="submit" fullWidth size="lg" isLoading={isCompanyLoading}>
                    Create Company Account
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
                Already have an account?{' '}
                <Link
                  href={authMode === 'company' ? '/login?mode=company' : '/login'}
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-secondary-500 dark:text-secondary-400 mt-8">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
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
