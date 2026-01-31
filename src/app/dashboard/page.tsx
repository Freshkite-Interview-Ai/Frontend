'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';
import { useAppStore } from '@/store';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
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
    color: 'bg-primary-100 text-primary-600',
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
    color: 'bg-blue-100 text-blue-600',
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
    color: 'bg-green-100 text-green-600',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resume } = useAppStore();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  if (isLoading) {
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Concepts Practiced</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
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

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Resume Status</p>
                <div className="mt-1">
                  {resume ? (
                    <Badge variant="success">Uploaded</Badge>
                  ) : (
                    <Badge variant="warning">Not Uploaded</Badge>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Interviews Completed</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card hover className="h-full">
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-secondary-900">{action.title}</h3>
                      <p className="text-sm text-secondary-600 mt-1">{action.description}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-secondary-400"
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
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-secondary-900">Upload Your Resume</h3>
                <p className="text-sm text-secondary-600 mt-1">
                  Get personalized interview questions based on your experience and skills.
                </p>
              </div>
              {!resume && (
                <Link href="/resume">
                  <Button size="sm">Upload</Button>
                </Link>
              )}
              {resume && (
                <Badge variant="success">Done</Badge>
              )}
            </div>

            <div className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-secondary-900">Practice Concepts</h3>
                <p className="text-sm text-secondary-600 mt-1">
                  Browse our library of technical concepts and record your explanations.
                </p>
              </div>
              <Link href="/concepts">
                <Button size="sm" variant="outline">Browse</Button>
              </Link>
            </div>

            <div className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-secondary-900">Start a Mock Interview</h3>
                <p className="text-sm text-secondary-600 mt-1">
                  Put your skills to the test with a simulated interview session.
                </p>
              </div>
              <Link href="/interview">
                <Button size="sm" variant="outline">Start</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
