'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import { ProblemSolver } from '@/components/features/problem-solver';
import { useAuthStatus } from '@/hooks';
import { SubmissionContext } from '@/types';

export default function ProblemSolvePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const problemId = params.problemId as string;
  const context = (searchParams.get('context') || 'practice') as SubmissionContext;
  const contextId = searchParams.get('contextId') || undefined;

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen flex flex-col">
      {/* Minimal header with back button */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <span className="text-xs text-secondary-400">Problem Solver</span>
        {context !== 'practice' && (
          <span className="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 capitalize">
            {context}
          </span>
        )}
      </div>

      {/* Problem Solver fills remaining space */}
      <div className="flex-1 min-h-0 relative">
        <ProblemSolver
          problemId={problemId}
          context={context}
          contextId={contextId}
          onSubmitSuccess={(submission) => {
            if (context !== 'practice') {
              // In test/interview context, we may want to navigate back
              // For now, the lock screen will show
            }
          }}
        />
      </div>
    </div>
  );
}
