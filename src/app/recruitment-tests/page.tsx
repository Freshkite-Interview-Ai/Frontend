'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';
import { recruitmentTestService } from '@/services/recruitmentTestService';
import { useAuthStatus } from '@/hooks';
import { RecruitmentTest } from '@/types';
import { useRecruitmentTestStore } from '@/store';

export default function RecruitmentTestsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const tests = useRecruitmentTestStore((state) => state.tests);
  const isLoading = useRecruitmentTestStore((state) => state.isLoading);
  const error = useRecruitmentTestStore((state) => state.error);
  const setLoading = useRecruitmentTestStore((state) => state.setLoading);
  const setError = useRecruitmentTestStore((state) => state.setError);
  const setTests = useRecruitmentTestStore((state) => state.setTests);
  const isCacheFresh = useRecruitmentTestStore((state) => state.isCacheFresh);

  const fetchTests = useCallback(async (force = false) => {
    if (!force && tests.length > 0 && isCacheFresh()) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await recruitmentTestService.getEligibleTests();
      setTests(res.data || [], res.pagination?.total);
    } catch {
      setError('Failed to load eligible tests. Make sure your resume has been analyzed.');
    } finally {
      setLoading(false);
    }
  }, [isCacheFresh, setError, setLoading, setTests, tests.length]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchTests(false);
  }, [authLoading, isAuthenticated, fetchTests, router]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const isTestActive = (test: RecruitmentTest) => {
    const now = new Date();
    return new Date(test.startTime) <= now && new Date(test.endTime) >= now;
  };

  const getAttemptBadge = (test: RecruitmentTest) => {
    if (!test.attempted || !test.attemptStatus) {
      return null;
    }

    if (test.attemptStatus === 'in_progress') {
      return <Badge variant="warning">In Progress</Badge>;
    }
    if (test.attemptStatus === 'completed') {
      return <Badge variant="success">Completed</Badge>;
    }
    if (test.attemptStatus === 'auto_submitted') {
      return <Badge variant="info">Submitted</Badge>;
    }
    return <Badge variant="danger">Terminated</Badge>;
  };

  const renderActionButton = (test: RecruitmentTest) => {
    const active = isTestActive(test);
    const isUpcoming = new Date(test.startTime) > new Date();

    if (test.attempted && test.attemptStatus === 'in_progress') {
      if (!active) {
        return (
          <Button variant="secondary" disabled>
            Ended
          </Button>
        );
      }

      return (
        <Button onClick={() => router.push(`/recruitment-tests/${test.id}/attempt`)}>
          Resume Test
        </Button>
      );
    }

    if (test.attempted && test.attemptStatus && test.attemptStatus !== 'in_progress') {
      const label =
        test.attemptStatus === 'completed'
          ? 'Completed'
          : test.attemptStatus === 'auto_submitted'
            ? 'Submitted'
            : 'Terminated';

      return (
        <Button variant="secondary" disabled>
          {label}
        </Button>
      );
    }

    if (active) {
      return (
        <Button onClick={() => router.push(`/recruitment-tests/${test.id}/attempt`)}>
          Start Test
        </Button>
      );
    }

    if (isUpcoming) {
      return (
        <Button variant="secondary" disabled>
          Not Started
        </Button>
      );
    }

    return (
      <Button variant="secondary" disabled>
        Ended
      </Button>
    );
  };

  if (authLoading) return <LoadingPage />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Recruitment Tests"
          description="Tests you're eligible for based on your resume analysis"
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No eligible tests found</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
                  Upload and get your resume analyzed to see matching tests from companies.
                </p>
                <Button onClick={() => router.push('/resume')}>Upload Resume</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tests.map((test) => {
              const active = isTestActive(test);
              return (
                <Card key={test.id} hover>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{test.title}</h3>
                          {active ? (
                            <Badge variant="success">Active</Badge>
                          ) : new Date(test.startTime) > new Date() ? (
                            <Badge variant="info">Upcoming</Badge>
                          ) : (
                            <Badge variant="default">Ended</Badge>
                          )}
                          {getAttemptBadge(test)}
                        </div>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-3 line-clamp-2">
                          {test.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-500 dark:text-secondary-400">
                          <span>⏱ {test.duration} min</span>
                          <span>📝 {test.questionCount} questions</span>
                          <span>📅 {formatDate(test.startTime)} — {formatDate(test.endTime)}</span>
                        </div>
                        {test.eligibility && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {test.eligibility.skills.slice(0, 5).map((skill) => (
                              <span key={skill} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {renderActionButton(test)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
