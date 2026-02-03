'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';
import { useAuthStore } from '@/store';
import { useAuth, usePlanGuard } from '@/hooks';
import { paymentService, userService } from '@/services';
import { Plan } from '@/types';

interface PlanCard {
  id: Plan;
  title: string;
  price: number;
  description: string;
  features: string[];
  accent: string;
}

const PLAN_CARDS: PlanCard[] = [
  {
    id: 'basic',
    title: 'Basic',
    price: 5000,
    description: 'Perfect for concept practice and fundamentals.',
    features: ['Concept library access', 'Audio practice recorder', 'Practice analytics'],
    accent: 'from-primary-500 to-primary-600',
  },
  {
    id: 'pro',
    title: 'Pro',
    price: 10000,
    description: 'Unlock all features including mock interviews.',
    features: [
      'Everything in Basic',
      'Mock interviews',
      'Interview analytics',
      'Priority feature access',
    ],
    accent: 'from-purple-500 to-purple-600',
  },
];

export default function PlanPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { isChecking } = usePlanGuard('none');
  const { user, setUser } = useAuthStore();
  const [processingPlan, setProcessingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasActivePlan = Boolean(user?.isPaid && user?.plan);
  const currentPlanLabel = useMemo(() => {
    if (!user?.plan) return null;
    return user.plan === 'pro' ? 'Pro' : 'Basic';
  }, [user?.plan]);

  const handlePurchase = async (plan: Plan) => {
    setError(null);
    setProcessingPlan(plan);

    try {
      const scriptLoaded = await paymentService.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay checkout');
      }

      const orderResponse = await paymentService.createOrder(plan);
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
      setError(message);
    } finally {
      setProcessingPlan(null);
    }
  };

  if (isLoading || isChecking) {
    return <LoadingPage message="Preparing your plan options..." />;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Choose Your Plan"
        description="Pick a plan to unlock the features you need to prepare for interviews."
      />

      {hasActivePlan && currentPlanLabel && (
        <Card className="mb-8 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-primary-600 dark:text-primary-400">Current Plan</p>
              <h3 className="text-2xl font-semibold text-secondary-900 dark:text-white mt-2">
                {currentPlanLabel} Plan Active
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400 mt-1">
                You already have access to your selected plan.
              </p>
            </div>
            <Button onClick={() => router.replace('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {PLAN_CARDS.map((plan) => {
          const isCurrentPlan = hasActivePlan && user?.plan === plan.id;
          return (
            <Card key={plan.id} className="border-secondary-200 dark:border-secondary-700">
              <CardContent className="flex h-full flex-col gap-6">
                <div>
                  <div className={`inline-flex items-center rounded-full bg-gradient-to-r ${plan.accent} px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white`}>
                    {plan.title}
                  </div>
                  <h3 className="mt-4 text-3xl font-bold text-secondary-900 dark:text-white">
                    ₹{plan.price}
                  </h3>
                  <p className="mt-2 text-secondary-600 dark:text-secondary-400">{plan.description}</p>
                </div>

                <ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {isCurrentPlan && (
                    <Badge variant="success" className="mb-3 inline-flex">
                      Current Plan
                    </Badge>
                  )}
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(plan.id)}
                    isLoading={processingPlan === plan.id}
                    disabled={processingPlan !== null || isCurrentPlan}
                  >
                    {isCurrentPlan ? 'Selected' : 'Choose Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
