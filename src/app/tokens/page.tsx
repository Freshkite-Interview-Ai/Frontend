'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';
import { useAuthStore } from '@/store';
import { useAuth, useTokenGuard } from '@/hooks';
import { paymentService, userService } from '@/services';
import { TokenPack } from '@/types';

export default function TokensPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { isChecking, tokenBalance } = useTokenGuard();
  const { user, setUser } = useAuthStore();
  const [processingPack, setProcessingPack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [packsLoading, setPacksLoading] = useState(true);
  const [tokenCosts, setTokenCosts] = useState<{ interview: number; audio: number; resume: number }>({
    interview: 0,
    audio: 0,
    resume: 0,
  });

  // Load token packs and pricing from backend
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await paymentService.getTokenConfig();
        const data = response.data;
        if (data) {
          setPacks(data.packs ?? []);
          setTokenCosts({
            interview: data.interviewSession8 ?? 0,
            audio: data.audioAnalysis ?? 0,
            resume: data.resumeAnalysis ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load token config:', err);
        // Fallback: try loading just packs
        try {
          const packsRes = await paymentService.getTokenPacks();
          setPacks(packsRes.data?.packs ?? []);
        } catch {
          // ignore
        }
      } finally {
        setPacksLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handlePurchase = async (packId: string) => {
    setError(null);
    setProcessingPack(packId);

    try {
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout');
      }

      const orderResponse = await paymentService.createOrder(packId);
      const order = orderResponse.data;

      const paymentResult = await paymentService.openCheckout(order, user ?? null);

      await paymentService.verifyPayment(paymentResult);

      const refreshed = await userService.getMe();
      if (refreshed?.data) {
        setUser(refreshed.data);
      }

      router.replace('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      if (message !== 'Payment cancelled') {
        setError(message);
      }
    } finally {
      setProcessingPack(null);
    }
  };

  if (isLoading || isChecking || packsLoading) {
    return <LoadingPage message="Loading token options..." />;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Buy Tokens"
        description="Purchase tokens to unlock AI-powered features for your interview preparation."
      />

      {/* Current Balance Hero Card */}
      <div className="mb-12 relative overflow-hidden rounded-2xl border border-primary-200 dark:border-primary-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-primary-600/5 to-transparent dark:from-primary-500/20 dark:via-primary-600/10" />
        <Card className="border-0 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20">
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">Your Balance</p>
              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-5xl font-black text-primary-600 dark:text-primary-300">{tokenBalance}</h3>
                <span className="text-xl font-semibold text-secondary-500 dark:text-secondary-400">tokens</span>
              </div>
              {tokenBalance > 0 && (
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-3">
                  ✓ Ready to practice! You have tokens available.
                </p>
              )}
              {tokenBalance <= 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 font-medium">
                  ⚠ Get started by purchasing your first token pack
                </p>
              )}
            </div>
            {tokenBalance > 0 && (
              <Button
                onClick={() => router.replace('/dashboard')}
                className="px-8 py-3 text-base font-semibold"
              >
                Go to Dashboard →
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-6 py-4 flex items-start gap-3 dark:border-red-900/50 dark:bg-red-900/20">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-red-900 dark:text-red-100">Payment Error</p>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Token Packs Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-8">Choose Your Plan</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {packs.map((pack) => (
            <div key={pack.id} className="relative group">
              {pack.popular && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500 dark:opacity-20 dark:group-hover:opacity-30" />
              )}
              <Card
                className={`relative border transition-all duration-300 ${
                  pack.popular
                    ? 'border-primary-400 dark:border-primary-600 ring-2 ring-primary-500 dark:ring-primary-400 shadow-lg'
                    : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-4 left-8 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                    <span>⭐ Most Popular</span>
                  </div>
                )}
                <CardContent className="flex h-full flex-col gap-6 p-6">
                  {/* Pack Header */}
                  <div>
                    <div className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white mb-4">
                      {pack.name}
                    </div>
                    <h3 className="text-4xl font-black text-secondary-900 dark:text-white mt-2">
                      {pack.tokens.toLocaleString()} <span className="text-base font-semibold text-secondary-500 dark:text-secondary-400">tokens</span>
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="border-t border-b border-secondary-200 dark:border-secondary-700 py-4">
                    <p className="text-xs text-secondary-600 dark:text-secondary-400 uppercase tracking-wider mb-2">Price</p>
                    <p className="text-3xl font-black text-primary-600 dark:text-primary-400">
                      ₹{pack.displayPriceINR}
                    </p>
                    {pack.tokens > 0 && (
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-2">
                        ₹{(pack.displayPriceINR / pack.tokens).toFixed(2)} per token
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 flex-grow">{pack.description}</p>

                  {/* Button */}
                  <Button
                    className={`w-full font-semibold py-3 text-base transition-all ${
                      pack.popular
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-lg hover:shadow-primary-500/40'
                        : ''
                    }`}
                    onClick={() => handlePurchase(pack.id)}
                    isLoading={processingPack === pack.id}
                    disabled={processingPack !== null}
                  >
                    {processingPack === pack.id ? 'Processing...' : `Buy ${pack.name}`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Breakdown Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-8">How Many Tokens Do You Need?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Interview */}
          <div className="group relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-6 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 text-white font-bold text-lg">
                🎤
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">Interview</p>
              <h3 className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">{tokenCosts.interview || '—'}</h3>
              <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
                For a full 8-question mock interview with AI evaluation and personalized report
              </p>
            </div>
          </div>

          {/* Audio Analysis */}
          <div className="group relative overflow-hidden rounded-xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-6 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 text-white font-bold text-lg">
                🎵
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 mb-2">Audio Analysis</p>
              <h3 className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">{tokenCosts.audio || '—'}</h3>
              <p className="text-sm text-purple-700/80 dark:text-purple-300/80">
                Per audio practice session with transcription and AI feedback
              </p>
            </div>
          </div>

          {/* Resume Analysis */}
          <div className="group relative overflow-hidden rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-6 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10" />
            <div className="relative">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 text-white font-bold text-lg">
                📄
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">Resume Analysis</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">{tokenCosts.resume || '—'}</h3>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                AI-powered skill extraction and personalized feedback
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <Card className="border-secondary-200 dark:border-secondary-700 bg-gradient-to-br from-secondary-50 to-secondary-100/50 dark:from-secondary-900/30 dark:to-secondary-800/20">
        <CardContent>
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-6">Why Tokens?</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">Pay per use</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Only pay for the AI features you actually use</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">Flexible pricing</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Purchase exactly what you need without being locked into monthly plans</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary-600 dark:text-primary-400 font-bold">✓</span>
              </div>
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">No expiration</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">Your tokens never expire - use them whenever you're ready</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
