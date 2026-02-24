'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Card, CardContent, Button, LoadingPage } from '@/components/ui';
import { analyticsService, userService, audioService } from '@/services';
import { ReportWithConcept } from '@/services/audioService';
import { useAuthStore } from '@/store';
import { useTokenGuard } from '@/hooks';
import { UserAnalyticsWithDetails } from '@/types';

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating / 2);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-secondary-300 dark:text-secondary-600'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview');
  const [analytics, setAnalytics] = useState<UserAnalyticsWithDetails | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [reports, setReports] = useState<ReportWithConcept[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportWithConcept | null>(null);
  const { user: storedUser, setUser } = useAuthStore();
  const { isChecking: isPlanChecking } = useTokenGuard();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const user = session?.user;

  const tokenBalance = storedUser?.tokenBalance ?? 0;

  const accountLabel = useMemo(() => {
    if (!storedUser?.isPaid) return 'Free';
    return 'Active';
  }, [storedUser?.isPaid]);

  const accountStatus = useMemo(() => {
    if (!storedUser?.isPaid) return 'Inactive';
    return 'Active';
  }, [storedUser?.isPaid]);

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

  // Load reports
  useEffect(() => {
    const loadReports = async () => {
      if (!isAuthenticated) return;
      try {
        setReportsLoading(true);
        const data = await audioService.getMyReports(1, 20);
        setReports(data.data || []);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setReportsLoading(false);
      }
    };
    loadReports();
  }, [isAuthenticated]);

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isAuthenticated) return;
      if (storedUser?.isPaid !== undefined && storedUser?.tokenBalance !== undefined) return;
      try {
        const response = await userService.getMe();
        if (response?.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadUserProfile();
  }, [isAuthenticated, setUser, storedUser?.isPaid, storedUser?.tokenBalance]);

  if (isLoading || isPlanChecking) {
    return <LoadingPage message="Loading profile..." />;
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Helper functions
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40';
    if (rating >= 6) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      BEGINNER: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
      INTERMEDIATE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
      ADVANCED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    };
    return colors[difficulty] || colors.BEGINNER;
  };

  const practiceHours = analytics?.totalRecordingMinutes
    ? (analytics.totalRecordingMinutes / 60).toFixed(1)
    : '0';

  const stats = [
    {
      label: 'Concepts Practiced',
      value: analyticsLoading ? '...' : (analytics?.totalConceptsPracticed ?? 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-100 dark:bg-violet-900/40',
    },
    {
      label: 'Total Attempts',
      value: analyticsLoading ? '...' : (analytics?.totalAttempts ?? 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    },
    {
      label: 'Practice Hours',
      value: analyticsLoading ? '...' : practiceHours,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/40',
    },
    {
      label: 'Day Streak',
      value: analyticsLoading ? '...' : (analytics?.currentStreak ?? 0),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/40',
    },
  ];

  const achievements = [
    { id: '1', name: 'First Steps', description: 'Complete your first practice', earned: (analytics?.totalAttempts ?? 0) >= 1, icon: '🎯' },
    { id: '2', name: 'Quick Learner', description: 'Practice 5 concepts', earned: (analytics?.totalConceptsPracticed ?? 0) >= 5, icon: '🚀' },
    { id: '3', name: 'Expert', description: 'Practice 10 concepts', earned: (analytics?.totalConceptsPracticed ?? 0) >= 10, icon: '🏆' },
    { id: '4', name: 'Consistency King', description: '7 day streak', earned: (analytics?.currentStreak ?? 0) >= 7, icon: '👑' },
    { id: '5', name: 'Deep Diver', description: '20 practice attempts', earned: (analytics?.totalAttempts ?? 0) >= 20, icon: '🏊' },
    { id: '6', name: 'Perfectionist', description: 'Rating above 9', earned: (analytics?.averageRating ?? 0) > 9, icon: '💯' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ) },
    { id: 'activity', label: 'Activity', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ) },
    { id: 'achievements', label: 'Achievements', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ) },
  ] as const;

  // Report Detail View
  if (selectedReport) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setSelectedReport(null)}
            className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white mb-6 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Profile</span>
          </button>

          {/* Report Header */}
          <Card className="mb-6 border-0 shadow-xl overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-primary-600 via-primary-500 to-violet-500 relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>
            <CardContent className="-mt-12 relative">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-20 h-20 rounded-2xl ${getRatingColor(selectedReport.overallRating)} flex flex-col items-center justify-center shadow-lg border-4 border-white dark:border-secondary-800`}>
                  <span className="text-2xl font-bold">{selectedReport.overallRating.toFixed(1)}</span>
                  <span className="text-xs opacity-70">/ 10</span>
                </div>
                <div className="flex-1 pt-6">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                      {selectedReport.concept?.title || 'Practice Report'}
                    </h1>
                    {selectedReport.concept && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyBadge(selectedReport.concept.difficulty)}`}>
                        {selectedReport.concept.difficulty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <StarRating rating={selectedReport.overallRating} />
                    <span className="text-sm text-secondary-500 dark:text-secondary-400">
                      {new Date(selectedReport.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-0 shadow-lg">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Strengths</h2>
                </div>
                {selectedReport.strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedReport.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-secondary-700 dark:text-secondary-300 text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm italic">No strengths recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Missed Points */}
            <Card className="border-0 shadow-lg">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Missed Points</h2>
                </div>
                {selectedReport.missedPoints.length > 0 ? (
                  <ul className="space-y-3">
                    {selectedReport.missedPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                        <span className="text-amber-500 mt-0.5 flex-shrink-0">!</span>
                        <span className="text-secondary-700 dark:text-secondary-300 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm italic">No missed points recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Improvements */}
            <Card className="border-0 shadow-lg lg:col-span-2">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Suggestions for Improvement</h2>
                </div>
                {selectedReport.improvements.length > 0 ? (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedReport.improvements.map((improvement, idx) => (
                      <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                        <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
                        <span className="text-secondary-700 dark:text-secondary-300 text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm italic">No improvement suggestions</p>
                )}
              </CardContent>
            </Card>

            {/* Communication Feedback */}
            {selectedReport.communicationFeedback && (
              <Card className="border-0 shadow-lg lg:col-span-2">
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Communication Feedback</h2>
                  </div>
                  <p className="text-secondary-700 dark:text-secondary-300 leading-relaxed bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-100 dark:border-violet-800/30">
                    {selectedReport.communicationFeedback}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Practice Again Button */}
          {selectedReport.concept && (
            <div className="mt-8 text-center">
              <Link href={`/record/${selectedReport.concept.id}`}>
                <Button size="lg" className="gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Practice Again
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Main Profile View
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl">
          {/* Banner */}
          <div className="h-36 sm:h-44 bg-gradient-to-br from-primary-600 via-primary-500 to-violet-500 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Action Buttons on Banner */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Link href="/tokens">
                <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white shadow-lg">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Buy Tokens
                </Button>
              </Link>
              <Link href="/settings">
                <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white shadow-lg">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          <CardContent className="relative">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row gap-5 -mt-16 sm:-mt-20">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'Profile'}
                    width={140}
                    height={140}
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white dark:border-secondary-800 shadow-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900/50"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-4 border-white dark:border-secondary-800 shadow-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center ring-4 ring-primary-100 dark:ring-primary-900/50">
                    <span className="text-4xl sm:text-5xl font-bold text-white">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 pt-2 sm:pt-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white tracking-tight">
                  {user?.name || 'User'}
                </h1>
                <p className="text-secondary-500 dark:text-secondary-400 mt-0.5 text-sm sm:text-base">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    tokenBalance > 0
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                      : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400'
                  }`}>
                    {tokenBalance > 0 && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    {tokenBalance} Tokens
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    accountStatus === 'Active'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${accountStatus === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {accountStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="relative p-4 sm:p-5 rounded-2xl bg-secondary-50/80 dark:bg-secondary-800/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 group border border-secondary-100 dark:border-secondary-700/50"
                >
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-secondary-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1.5 bg-secondary-100/80 dark:bg-secondary-800/80 rounded-2xl backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white shadow-sm'
                  : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-secondary-700/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Reports */}
            <Card className="lg:col-span-2 border-0 shadow-lg">
              <CardContent>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Reports</h3>
                  <span className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2.5 py-1 rounded-full">
                    {reports.length} reports
                  </span>
                </div>
                {reportsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : reports.length > 0 ? (
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-secondary-50/80 dark:bg-secondary-800/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all border border-secondary-100 dark:border-secondary-700/50 group cursor-pointer"
                      >
                        <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${getRatingColor(report.overallRating)} flex flex-col items-center justify-center`}>
                          <span className="text-lg font-bold">{report.overallRating.toFixed(1)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-secondary-900 dark:text-white truncate">
                              {report.concept?.title || 'Unknown Concept'}
                            </h4>
                            {report.concept && (
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${getDifficultyBadge(report.concept.difficulty)}`}>
                                {report.concept.difficulty}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <StarRating rating={report.overallRating} />
                            <span className="text-xs text-secondary-400 dark:text-secondary-500">
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-secondary-300 dark:text-secondary-600 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
                      <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-400 font-medium mb-1">No reports yet</p>
                    <p className="text-sm text-secondary-500 mb-4">Practice concepts to get AI feedback</p>
                    <Link href="/concepts">
                      <Button size="sm">Start Practicing</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="border-0 shadow-lg">
              <CardContent>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-5">Performance</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/30 dark:to-violet-900/30 border border-primary-100 dark:border-primary-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider font-medium">Average Rating</p>
                      <StarRating rating={analytics?.averageRating || 0} />
                    </div>
                    <p className="text-3xl font-bold text-secondary-900 dark:text-white">
                      {analytics?.averageRating ? analytics.averageRating.toFixed(1) : '-'}
                      <span className="text-lg text-secondary-400 dark:text-secondary-500">/10</span>
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700/50">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider font-medium mb-2">Longest Streak</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <p className="text-2xl font-bold text-secondary-900 dark:text-white">
                        {analytics?.longestStreak ?? 0} <span className="text-sm font-normal text-secondary-500">days</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700/50">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wider font-medium mb-2">Member Since</p>
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
          <Card className="border-0 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Practice History</h3>
                <span className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2.5 py-1 rounded-full">
                  {reports.length} sessions
                </span>
              </div>
              {reportsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
              ) : reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="p-5 rounded-2xl bg-secondary-50/80 dark:bg-secondary-800/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all border border-secondary-100 dark:border-secondary-700/50 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-xl ${getRatingColor(report.overallRating)} flex flex-col items-center justify-center`}>
                          <span className="text-xl font-bold">{report.overallRating.toFixed(1)}</span>
                          <span className="text-[10px] opacity-70">/ 10</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-secondary-900 dark:text-white">
                                {report.concept?.title || 'Unknown Concept'}
                              </h4>
                              {report.concept && (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getDifficultyBadge(report.concept.difficulty)}`}>
                                  {report.concept.difficulty}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-secondary-400 dark:text-secondary-500 whitespace-nowrap">
                              {formatDate(report.createdAt)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                            {report.strengths.length > 0 && (
                              <div className="flex items-start gap-1.5 text-xs">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                <span className="text-secondary-600 dark:text-secondary-400 line-clamp-1">{report.strengths[0]}</span>
                              </div>
                            )}
                            {report.missedPoints.length > 0 && (
                              <div className="flex items-start gap-1.5 text-xs">
                                <span className="text-amber-500 mt-0.5">!</span>
                                <span className="text-secondary-600 dark:text-secondary-400 line-clamp-1">{report.missedPoints[0]}</span>
                              </div>
                            )}
                            {report.improvements.length > 0 && (
                              <div className="flex items-start gap-1.5 text-xs">
                                <span className="text-blue-500 mt-0.5">→</span>
                                <span className="text-secondary-600 dark:text-secondary-400 line-clamp-1">{report.improvements[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-secondary-600 dark:text-secondary-400 font-medium mb-1">No activity yet</p>
                  <p className="text-sm text-secondary-500 mb-4">Start practicing to see your history</p>
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
                className={`transition-all duration-300 border-0 shadow-lg ${
                  achievement.earned
                    ? 'bg-gradient-to-br from-primary-50 to-violet-50 dark:from-primary-900/20 dark:to-violet-900/20'
                    : 'opacity-60 grayscale'
                }`}
              >
                <CardContent className="text-center py-6">
                  <div className={`text-5xl mb-4 ${achievement.earned ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }}>
                    {achievement.icon}
                  </div>
                  <h4 className="font-bold text-secondary-900 dark:text-white mb-1 text-lg">{achievement.name}</h4>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">{achievement.description}</p>
                  {achievement.earned ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Earned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary-200 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Locked
                    </span>
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
