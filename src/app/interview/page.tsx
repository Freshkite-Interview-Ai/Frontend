'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingSpinner, Badge } from '@/components/ui';
import { useAppStore } from '@/store';
import { Interview } from '@/types';
import { interviewService } from '@/services';

export default function InterviewPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resume, currentInterview, setCurrentInterview, interviews, interviewLoading, setInterviewLoading } = useAppStore();
  
  const isAuthenticated = status === 'authenticated';
  const authLoading = status === 'loading';

  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load active interview on page load
  useEffect(() => {
    const loadActiveInterview = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await interviewService.getActiveSession();
        if (response.data) {
          setCurrentInterview(response.data as unknown as Interview);
        }
      } catch (error) {
        console.error('Failed to load active interview:', error);
      }
    };
    loadActiveInterview();
  }, [isAuthenticated, setCurrentInterview]);

  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      const response = await interviewService.startInterview();
      if (response.data) {
        setCurrentInterview(response.data as unknown as Interview);
      }
    } catch (error) {
      console.error('Failed to start interview:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndInterview = async () => {
    if (!currentInterview) return;

    setInterviewLoading(true);
    try {
      await interviewService.endInterview(currentInterview.id);
      setCurrentInterview(null);
    } catch (error) {
      console.error('Failed to end interview:', error);
    } finally {
      setInterviewLoading(false);
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="Interview"
        description="Start a mock interview session to practice your skills."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentInterview ? (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <svg
                      className="w-10 h-10 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <Badge variant={getStatusColor(currentInterview.status)} className="mb-4">
                    {currentInterview.status.replace('-', ' ').toUpperCase()}
                  </Badge>

                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                    Interview in Progress
                  </h2>

                  <p className="text-secondary-600 mb-2">
                    Started at{' '}
                    {currentInterview.startedAt
                      ? new Date(currentInterview.startedAt).toLocaleTimeString()
                      : 'N/A'}
                  </p>

                  <p className="text-sm text-secondary-500 mb-8">
                    Session ID: {currentInterview.id}
                  </p>

                  {/* Interview Content Placeholder */}
                  <div className="bg-secondary-50 rounded-xl p-8 mb-8">
                    <div className="w-16 h-16 bg-secondary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-secondary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-medium text-secondary-700 mb-2">
                      AI Interview Coming Soon
                    </h3>
                    <p className="text-sm text-secondary-500">
                      This is where the AI interviewer will ask questions and you can respond.
                      The feature is currently under development.
                    </p>
                  </div>

                  <Button
                    variant="danger"
                    onClick={handleEndInterview}
                    isLoading={interviewLoading}
                    disabled={interviewLoading}
                  >
                    End Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-10 h-10 text-secondary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                    Ready for Your Interview?
                  </h2>

                  <p className="text-secondary-600 max-w-md mx-auto mb-8">
                    Start a mock interview session to practice answering technical questions.
                    The AI interviewer will adapt to your experience level.
                  </p>

                  {!resume && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-left">
                          <h4 className="font-medium text-yellow-800 text-sm">
                            Resume Not Uploaded
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Upload your resume for personalized questions.
                          </p>
                          <Link href="/resume" className="text-sm text-yellow-800 underline mt-2 inline-block">
                            Upload Resume
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={handleStartInterview}
                    isLoading={isStarting}
                    disabled={isStarting}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    }
                  >
                    Start Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Interview Tips */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-secondary-900 mb-4">Interview Tips</h3>
              <ul className="space-y-3 text-sm text-secondary-600">
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Think out loud while solving problems
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Ask clarifying questions when needed
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Consider edge cases and constraints
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Discuss time and space complexity
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Preparation Checklist */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-secondary-900 mb-4">Preparation Checklist</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  {resume ? (
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 border-2 border-secondary-300 rounded-full" />
                    </div>
                  )}
                  <span className={resume ? 'text-secondary-900' : 'text-secondary-500'}>
                    Resume uploaded
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-secondary-300 rounded-full" />
                  </div>
                  <span className="text-secondary-500">Practice concepts reviewed</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-secondary-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-secondary-300 rounded-full" />
                  </div>
                  <span className="text-secondary-500">Quiet environment ready</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
