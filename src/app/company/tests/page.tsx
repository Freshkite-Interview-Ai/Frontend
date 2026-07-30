'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Badge, LoadingSpinner } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { companyAuthService } from '@/services';
import { companyTestService } from '@/services/companyTestService';
import { RecruitmentTest } from '@/types';

export default function CompanyTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<RecruitmentTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTests = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await companyTestService.getTests();
      setTests(response.data || []);
    } catch {
      setError('Failed to load tests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!companyAuthService.isAuthenticated()) {
      router.replace('/login?mode=company');
      return;
    }
    fetchTests();
  }, [fetchTests, router]);

  const handlePublish = async (testId: string) => {
    try {
      await companyTestService.publishTest(testId);
      fetchTests();
    } catch {
      setError('Failed to publish test');
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this draft test?')) return;
    try {
      await companyTestService.deleteTest(testId);
      fetchTests();
    } catch {
      setError('Failed to delete test');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Recruitment Tests" description="Create and manage tests for candidates" />
        <Button onClick={() => router.push('/company/tests/create')}>Create Test</Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner /></div>
      ) : tests.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-secondary-500 dark:text-secondary-400 mb-4">No tests created yet</p>
              <Button onClick={() => router.push('/company/tests/create')}>Create Your First Test</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <Card key={test.id} hover onClick={() => router.push(`/company/tests/${test.id}`)}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white truncate">
                        {test.title}
                      </h3>
                      <Badge variant={test.status === 'published' ? 'success' : 'warning'}>
                        {test.status}
                      </Badge>
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
                        {test.eligibility.skills.length > 5 && (
                          <span className="text-xs text-secondary-400">+{test.eligibility.skills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    {test.status === 'draft' && (
                      <>
                        <Button size="sm" onClick={() => handlePublish(test.id)}>Publish</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(test.id)}>Delete</Button>
                      </>
                    )}
                    {test.status === 'published' && (
                      <Button size="sm" variant="secondary" onClick={() => router.push(`/company/tests/${test.id}/analytics`)}>
                        Analytics
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
