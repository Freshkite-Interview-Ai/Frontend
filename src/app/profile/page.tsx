'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface ActivityItem {
  id: string;
  type: 'concept' | 'interview' | 'resume' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview');

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  if (isLoading) {
    return <LoadingPage message="Loading profile..." />;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const stats: StatItem[] = [
    {
      label: 'Concepts Practiced',
      value: 12,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'from-primary-500 to-primary-600',
    },
    {
      label: 'Interviews Completed',
      value: 5,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Practice Hours',
      value: '8.5',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Achievements',
      value: 3,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'concept',
      title: 'Practiced React Hooks',
      description: 'Completed explanation of useState and useEffect',
      timestamp: '2 hours ago',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      ),
    },
    {
      id: '2',
      type: 'interview',
      title: 'Completed Mock Interview',
      description: 'Frontend Developer - 45 minutes',
      timestamp: 'Yesterday',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      ),
    },
    {
      id: '3',
      type: 'resume',
      title: 'Updated Resume',
      description: 'Added new project experience',
      timestamp: '3 days ago',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      ),
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Earned "Quick Learner" Badge',
      description: 'Completed 10 concepts in one week',
      timestamp: '1 week ago',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-900/50 dark:to-orange-800/50 flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      ),
    },
  ];

  const achievements = [
    { id: '1', name: 'Quick Learner', description: 'Complete 10 concepts in one week', earned: true, icon: '🚀' },
    { id: '2', name: 'First Steps', description: 'Complete your first concept', earned: true, icon: '👣' },
    { id: '3', name: 'Interview Ready', description: 'Complete 5 mock interviews', earned: true, icon: '🎯' },
    { id: '4', name: 'Consistency King', description: 'Practice for 7 consecutive days', earned: false, icon: '👑' },
    { id: '5', name: 'Deep Diver', description: 'Master 20 advanced concepts', earned: false, icon: '🏊' },
    { id: '6', name: 'Perfectionist', description: 'Get 100% on an interview', earned: false, icon: '💯' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'achievements', label: 'Achievements' },
  ] as const;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          <CardContent className="-mt-16 sm:-mt-20 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="relative group">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'Profile'}
                    width={120}
                    height={120}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-secondary-800 shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white dark:border-secondary-800 shadow-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-1 right-1 p-2 bg-white dark:bg-secondary-700 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-secondary-50 dark:hover:bg-secondary-600">
                  <CameraIcon />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">
                      {user?.name || 'User'}
                    </h1>
                    <p className="text-secondary-500 dark:text-secondary-400 mt-1">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="primary">Pro Member</Badge>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </div>
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="gap-2">
                      <EditIcon />
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="relative group p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-700/50 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-secondary-100 dark:bg-secondary-800 rounded-2xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bio Section */}
            <Card className="lg:col-span-2">
              <CardContent>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">About</h3>
                <p className="text-secondary-600 dark:text-secondary-400 leading-relaxed">
                  Passionate software developer with a focus on frontend technologies. Currently preparing for technical interviews and improving my skills in React, TypeScript, and system design. Always eager to learn and grow!
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-secondary-900 dark:text-white font-medium">San Francisco, CA</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Member Since</p>
                    <p className="text-secondary-900 dark:text-white font-medium">January 2026</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'PostgreSQL'].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-700/50 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors group"
                  >
                    {activity.icon}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {activity.title}
                      </h4>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-secondary-400 dark:text-secondary-500 whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`transition-all duration-300 ${
                  achievement.earned
                    ? 'border-primary-200 dark:border-primary-700'
                    : 'opacity-60 grayscale'
                }`}
              >
                <CardContent className="text-center">
                  <div className={`text-4xl mb-3 ${achievement.earned ? '' : 'opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <h4 className="font-semibold text-secondary-900 dark:text-white mb-1">
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {achievement.description}
                  </p>
                  {achievement.earned && (
                    <Badge variant="success" className="mt-3">
                      Earned
                    </Badge>
                  )}
                  {!achievement.earned && (
                    <Badge variant="default" className="mt-3">
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
