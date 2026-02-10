'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/layout';
import {
  CollapsibleCategory,
  EmptyState,
  LoadingSkeleton,
} from '@/components/features/problems';
import { problemService } from '@/services/problemService';
import {
  Problem,
  ProblemDifficulty,
  ProblemStatusValue,
  ProblemsByCategory,
} from '@/types';

export default function ProblemsPage() {
  const router = useRouter();
  const { status } = useSession();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, ProblemStatusValue>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<ProblemDifficulty | ''>('');
  const [statusFilter, setStatusFilter] = useState<ProblemStatusValue | 'none' | ''>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [problemsRes, statusesRes] = await Promise.all([
          problemService.getProblems(),
          problemService.getUserStatuses(),
        ]);

        if (problemsRes.success) {
          setProblems(problemsRes.data);
        }

        if (statusesRes.success) {
          const map: Record<string, ProblemStatusValue> = {};
          statusesRes.data.forEach((s) => {
            map[s.problemId] = s.status;
          });
          setStatusMap(map);
        }
      } catch (err) {
        setError('Failed to load problems. Please try again.');
        console.error('Failed to load problems:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [status, router]);

  const handleStatusChange = useCallback(
    async (problemId: string, newStatus: ProblemStatusValue) => {
      const previousStatus = statusMap[problemId];
      setStatusMap((prev) => ({ ...prev, [problemId]: newStatus }));

      try {
        await problemService.updateStatus(problemId, newStatus);
      } catch (err) {
        setStatusMap((prev) => {
          const updated = { ...prev };
          if (previousStatus) {
            updated[problemId] = previousStatus;
          } else {
            delete updated[problemId];
          }
          return updated;
        });
        console.error('Failed to update status:', err);
      }
    },
    [statusMap]
  );

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(query) &&
          !p.category.toLowerCase().includes(query) &&
          !p.tags.some((t) => t.toLowerCase().includes(query))
        ) {
          return false;
        }
      }
      if (difficultyFilter && p.difficulty !== difficultyFilter) {
        return false;
      }
      if (statusFilter === 'none') {
        if (statusMap[p.id]) return false;
      } else if (statusFilter && statusMap[p.id] !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [problems, searchQuery, difficultyFilter, statusFilter, statusMap]);

  const groupedProblems = useMemo(() => {
    const groups: ProblemsByCategory = {};
    filteredProblems.forEach((p) => {
      if (!groups[p.category]) {
        groups[p.category] = [];
      }
      groups[p.category].push(p);
    });
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => a.order - b.order);
    });
    return groups;
  }, [filteredProblems]);

  const stats = useMemo(() => {
    const completed = Object.values(statusMap).filter(s => s === 'completed' || s === 'pass').length;
    const pass = Object.values(statusMap).filter(s => s === 'pass').length;
    const fail = Object.values(statusMap).filter(s => s === 'fail').length;
    const easy = problems.filter(p => p.difficulty === 'Easy' && (statusMap[p.id] === 'completed' || statusMap[p.id] === 'pass')).length;
    const medium = problems.filter(p => p.difficulty === 'Medium' && (statusMap[p.id] === 'completed' || statusMap[p.id] === 'pass')).length;
    const hard = problems.filter(p => p.difficulty === 'Hard' && (statusMap[p.id] === 'completed' || statusMap[p.id] === 'pass')).length;
    const totalEasy = problems.filter(p => p.difficulty === 'Easy').length;
    const totalMedium = problems.filter(p => p.difficulty === 'Medium').length;
    const totalHard = problems.filter(p => p.difficulty === 'Hard').length;

    return { completed, pass, fail, easy, medium, hard, totalEasy, totalMedium, totalHard };
  }, [problems, statusMap]);

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary-500 dark:bg-primary-600 flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
              Problem Solving Tracker
            </h1>
            <p className="text-secondary-600 dark:text-secondary-400 mt-1">
              Track your progress on coding problems
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          {/* Total Solved */}
          <div className="col-span-2 md:col-span-2 lg:col-span-3 bg-white dark:bg-secondary-800 rounded-xl p-5 border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Total Solved</p>
                <p className="text-3xl font-bold text-secondary-900 dark:text-white">
                  {stats.completed}
                  <span className="text-lg text-secondary-500 dark:text-secondary-400 font-normal ml-1">/ {problems.length}</span>
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 dark:bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${problems.length > 0 ? (stats.completed / problems.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
                    {problems.length > 0 ? Math.round((stats.completed / problems.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Easy */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Easy</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.easy}
              <span className="text-sm text-secondary-500 dark:text-secondary-400 font-normal">/{stats.totalEasy}</span>
            </p>
          </div>

          {/* Medium */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Medium</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.medium}
              <span className="text-sm text-secondary-500 dark:text-secondary-400 font-normal">/{stats.totalMedium}</span>
            </p>
          </div>

          {/* Hard */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Hard</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.hard}
              <span className="text-sm text-secondary-500 dark:text-secondary-400 font-normal">/{stats.totalHard}</span>
            </p>
          </div>

          {/* Accuracy */}
          <div className="bg-white dark:bg-secondary-800 rounded-xl p-4 border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Accuracy</span>
            </div>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {stats.pass + stats.fail > 0 ? Math.round((stats.pass / (stats.pass + stats.fail)) * 100) : 0}
              <span className="text-sm text-secondary-500 dark:text-secondary-400 font-normal">%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-secondary-100 placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Difficulty Filter */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value as ProblemDifficulty | '')}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent transition-all duration-200 cursor-pointer"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProblemStatusValue | 'none' | '')}
          className="px-4 py-2.5 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent transition-all duration-200 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
          <option value="completed">Completed</option>
          <option value="none">Not Attempted</option>
        </select>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border-2 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          {error}
        </div>
      )}

      {isLoading && <LoadingSkeleton />}

      {!isLoading && !error && (
        <div className="space-y-5">
          {Object.keys(groupedProblems).length > 0 ? (
            Object.entries(groupedProblems).map(([category, categoryProblems]) => (
              <CollapsibleCategory
                key={category}
                category={category}
                problems={categoryProblems}
                statusMap={statusMap}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
