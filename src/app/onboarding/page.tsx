'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, Button, LoadingSpinner, Logo } from '@/components/ui';
import { userService } from '@/services';
import { useAuthStore } from '@/store';
import { TargetGoalType, TargetGoal } from '@/types';

const GOAL_OPTIONS: {
  type: TargetGoalType;
  title: string;
  description: string;
  icon: string;
  threshold: string;
}[] = [
  {
    type: 'faang',
    title: 'FAANG / Top Tech',
    description: 'Targeting Google, Meta, Amazon, Apple, Netflix, or similar top-tier companies.',
    icon: '🏆',
    threshold: 'Pass threshold: 9/10',
  },
  {
    type: 'product',
    title: 'Product Companies',
    description: 'Targeting mid-to-large product companies with strong engineering teams.',
    icon: '🚀',
    threshold: 'Pass threshold: 8/10',
  },
  {
    type: 'service',
    title: 'Service / IT Companies',
    description: 'Targeting service-based companies or IT consultancies.',
    icon: '💼',
    threshold: 'Pass threshold: 6/10',
  },
  {
    type: 'custom',
    title: 'Custom Goal',
    description: 'Set your own pass criteria and focus areas.',
    icon: '⚙️',
    threshold: 'You decide the threshold',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const { setUser } = useAuthStore();
  const [selectedGoal, setSelectedGoal] = useState<TargetGoalType | null>(null);
  const [customMinRating, setCustomMinRating] = useState(7);
  const [customFocusAreas, setCustomFocusAreas] = useState('');
  const [saving, setSaving] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-950">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (status !== 'authenticated') {
    router.replace('/login');
    return null;
  }

  const handleSave = async () => {
    if (!selectedGoal) return;

    setSaving(true);
    try {
      const targetGoal: TargetGoal = { type: selectedGoal };

      if (selectedGoal === 'custom') {
        targetGoal.customCriteria = {
          minRating: customMinRating,
          focusAreas: customFocusAreas
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        };
      }

      const response = await userService.updateMe({
        targetGoal,
        onboardingCompleted: true,
      });

      if (response?.data) {
        setUser(response.data);
      }

      router.replace('/dashboard');
    } catch (error) {
      console.error('Failed to save onboarding:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      const response = await userService.updateMe({ onboardingCompleted: true });
      if (response?.data) {
        setUser(response.data);
      }
      router.replace('/dashboard');
    } catch {
      router.replace('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <h1 className="text-3xl font-bold text-center text-secondary-900 dark:text-white mb-2">
          What&apos;s your target?
        </h1>
        <p className="text-center text-secondary-600 dark:text-secondary-400 mb-8">
          This helps us personalize your practice experience and set the right pass criteria.
        </p>

        {/* Goal Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {GOAL_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedGoal(option.type)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                selectedGoal === option.type
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-lg'
                  : 'border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 hover:border-secondary-300 dark:hover:border-secondary-600'
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-1">
                {option.title}
              </h3>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                {option.description}
              </p>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                {option.threshold}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Criteria */}
        {selectedGoal === 'custom' && (
          <Card className="mb-8">
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Minimum Pass Rating (1-10)
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={customMinRating}
                  onChange={(e) => setCustomMinRating(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-secondary-500 mt-1">
                  <span>1</span>
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    {customMinRating}
                  </span>
                  <span>10</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Focus Areas (comma-separated)
                </label>
                <input
                  type="text"
                  value={customFocusAreas}
                  onChange={(e) => setCustomFocusAreas(e.target.value)}
                  placeholder="e.g. System Design, Algorithms, OOP"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="text-sm text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
          >
            Skip for now
          </button>
          <Button
            onClick={handleSave}
            disabled={!selectedGoal || saving}
            isLoading={saving}
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
