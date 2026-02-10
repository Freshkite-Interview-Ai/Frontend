'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';
import { useAppStore } from '@/store';
import { useTokenGuard } from '@/hooks';
import { resumeService, analyticsService } from '@/services';
import { UserAnalytics } from '@/types';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  darkColor: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Practice Concepts',
    description: 'Browse and practice technical concepts',
    href: '/concepts',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    color: 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-600',
    darkColor: 'dark:from-primary-900/50 dark:to-primary-800/50 dark:text-primary-400',
  },
  {
    title: 'Upload Resume',
    description: 'Add your resume for personalized questions',
    href: '/resume',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    color: 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600',
    darkColor: 'dark:from-blue-900/50 dark:to-blue-800/50 dark:text-blue-400',
  },
  {
    title: 'Start Interview',
    description: 'Begin a mock interview session',
    href: '/interview',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
    color: 'bg-gradient-to-br from-green-100 to-green-200 text-green-600',
    darkColor: 'dark:from-green-900/50 dark:to-green-800/50 dark:text-green-400',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resume, setResume, setResumeLoading } = useAppStore();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const { isChecking: isPlanChecking } = useTokenGuard();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  // Load resume status and analytics from backend on mount
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      // Load resume
      try {
        setResumeLoading(true);
        const response = await resumeService.getMyResume();
        if (response.data) {
          setResume(response.data);
        }
      } catch (error) {
        console.error('Failed to load resume:', error);
      } finally {
        setResumeLoading(false);
      }

      // Load analytics
      try {
        setAnalyticsLoading(true);
        const analyticsData = await analyticsService.getUserAnalytics();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, setResume, setResumeLoading]);

  if (isLoading || isPlanChecking) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={`Welcome back, ${user?.name || user?.email?.split('@')[0] || 'User'}!`}
        description="Ready to ace your next interview? Let's get started."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Concepts Practiced</p>
                <p className="text-3xl font-bold text-secondary-900 dark:text-white mt-1">
                  {analyticsLoading ? '...' : analytics?.totalConceptsPracticed ?? 0}
                </p>
                <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">Rating &gt; 8</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Attempts</p>
                <p className="text-3xl font-bold text-secondary-900 dark:text-white mt-1">
                  {analyticsLoading ? '...' : analytics?.totalAttempts ?? 0}
                </p>
                <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                  {analytics?.totalRecordingMinutes ? `${analytics.totalRecordingMinutes.toFixed(1)} mins recorded` : 'Start practicing'}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Resume Status</p>
                <div className="mt-2">
                  {resume ? (
                    <Badge variant="success">Uploaded</Badge>
                  ) : (
                    <Badge variant="warning">Not Uploaded</Badge>
                  )}
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 overflow-hidden group hover:shadow-lg transition-all duration-300">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Current Streak</p>
                <p className="text-3xl font-bold text-secondary-900 dark:text-white mt-1">
                  {analyticsLoading ? '...' : analytics?.currentStreak ?? 0}
                  <span className="text-sm font-normal text-secondary-400 dark:text-secondary-500 ml-1">days</span>
                </p>
                <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                  Best: {analytics?.longestStreak ?? 0} days
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card hover className="h-full bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 group">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.color} ${action.darkColor} group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{action.title}</h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">{action.description}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-secondary-400 dark:text-secondary-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card className="bg-white dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700">
        <CardContent>
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl group hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center font-semibold text-sm shadow-lg shadow-primary-500/25">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-secondary-900 dark:text-white">Upload Your Resume</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                  Get personalized interview questions based on your experience and skills.
                </p>
              </div>
              {!resume && (
                <Link href="/resume">
                  <Button size="sm" className="rounded-xl shadow-lg shadow-primary-500/25">Upload</Button>
                </Link>
              )}
              {resume && (
                <Badge variant="success">Done</Badge>
              )}
            </div>

            <div className="flex items-start gap-4 p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl group hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center font-semibold text-sm shadow-lg shadow-primary-500/25">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-secondary-900 dark:text-white">Practice Concepts</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                  Browse our library of technical concepts and record your explanations.
                </p>
              </div>
              <Link href="/concepts">
                <Button size="sm" variant="outline" className="rounded-xl border-secondary-300 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-700">Browse</Button>
              </Link>
            </div>

            <div className="flex items-start gap-4 p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-2xl group hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl flex items-center justify-center font-semibold text-sm shadow-lg shadow-primary-500/25">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-secondary-900 dark:text-white">Start a Mock Interview</h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                  Put your skills to the test with a simulated interview session.
                </p>
              </div>
              <Link href="/interview">
                <Button size="sm" variant="outline" className="rounded-xl border-secondary-300 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-700">Start</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
