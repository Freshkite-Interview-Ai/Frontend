'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage, Badge } from '@/components/ui';
import { analyticsService } from '@/services';
import { UserAnalyticsWithDetails, PracticedConcept } from '@/types';

interface StatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
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
  const [analytics, setAnalytics] = useState<UserAnalyticsWithDetails | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!isAuthenticated) return;
      
      try {
        setAnalyticsLoading(true);
        const data = await analyticsService.getUserAnalyticsWithDetails();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingPage message="Loading profile..." />;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Calculate practice hours from recording minutes
  const practiceHours = analytics?.totalRecordingMinutes 
    ? (analytics.totalRecordingMinutes / 60).toFixed(1) 
    : '0';

  const stats: StatItem[] = [
    {
      label: 'Concepts Practiced',
      value: analyticsLoading ? '...' : (analytics?.totalConceptsPracticed ?? 0),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'from-primary-500 to-primary-600',
    },
    {
      label: 'Total Attempts',
      value: analyticsLoading ? '...' : (analytics?.totalAttempts ?? 0),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Practice Hours',
      value: analyticsLoading ? '...' : practiceHours,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Current Streak',
      value: analyticsLoading ? '...' : `${analytics?.currentStreak ?? 0} days`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const achievements = [
    { id: '1', name: 'First Steps', description: 'Complete your first concept', earned: (analytics?.totalAttempts ?? 0) >= 1, icon: '👣' },
    { id: '2', name: 'Quick Learner', description: 'Practice 5 concepts', earned: (analytics?.totalConceptsPracticed ?? 0) >= 5, icon: '🚀' },
    { id: '3', name: 'Expert', description: 'Practice 10 concepts', earned: (analytics?.totalConceptsPracticed ?? 0) >= 10, icon: '🎯' },
    { id: '4', name: 'Consistency King', description: 'Practice for 7 consecutive days', earned: (analytics?.currentStreak ?? 0) >= 7, icon: '👑' },
    { id: '5', name: 'Deep Diver', description: 'Complete 20 practice attempts', earned: (analytics?.totalAttempts ?? 0) >= 20, icon: '🏊' },
    { id: '6', name: 'Perfectionist', description: 'Get a rating above 9', earned: (analytics?.averageRating ?? 0) > 9, icon: '💯' },
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
            {/* Practiced Concepts Section */}
            <Card className="lg:col-span-2">
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Practiced Concepts</h3>
                  <span className="text-sm text-secondary-500 dark:text-secondary-400">
                    Rating &gt; 8 required
                  </span>
                </div>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : analytics?.practicedConcepts && analytics.practicedConcepts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.practicedConcepts.slice(0, 5).map((concept) => (
                      <div
                        key={concept.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-secondary-900 dark:text-white">{concept.title}</h4>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">
                              {concept.totalAttempts} attempt{concept.totalAttempts !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {concept.bestRating.toFixed(1)}
                          </div>
                          <div className="text-xs text-secondary-400 dark:text-secondary-500">best rating</div>
                        </div>
                      </div>
                    ))}
                    {analytics.practicedConcepts.length > 5 && (
                      <Link href="/concepts">
                        <Button variant="outline" className="w-full mt-2">
                          View All ({analytics.practicedConcepts.length} concepts)
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-400 mb-2">No concepts practiced yet</p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-500 mb-4">
                      Practice concepts and score above 8 to see them here
                    </p>
                    <Link href="/concepts">
                      <Button size="sm">Start Practicing</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Summary Section */}
            <Card>
              <CardContent>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Stats Summary</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Average Rating</p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {analytics?.averageRating ? analytics.averageRating.toFixed(1) : '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Longest Streak</p>
                    <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {analytics?.longestStreak ?? 0} days
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-700/50">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-1">Member Since</p>
                    <p className="text-secondary-900 dark:text-white font-medium">
                      {session?.user ? 'January 2026' : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">Recent Practice</h3>
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : analytics?.practicedConcepts && analytics.practicedConcepts.length > 0 ? (
                <div className="space-y-4">
                  {analytics.practicedConcepts.map((concept) => (
                    <div
                      key={concept.id}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-700/50 hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          Practiced {concept.title}
                        </h4>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">
                          Best rating: {concept.bestRating.toFixed(1)} • {concept.totalAttempts} attempt{concept.totalAttempts !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <span className="text-xs text-secondary-400 dark:text-secondary-500 whitespace-nowrap">
                        {concept.lastAttemptAt 
                          ? new Date(concept.lastAttemptAt).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                    <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-secondary-600 dark:text-secondary-400 mb-2">No recent activity</p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-500 mb-4">
                    Start practicing to see your activity here
                  </p>
                  <Link href="/concepts">
                    <Button size="sm">Browse Concepts</Button>
                  </Link>
                </div>
              )}
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
