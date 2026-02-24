'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingSpinner, Badge, Input } from '@/components/ui';
import { ConceptCard } from '@/components/features';
import { useApi, useTokenGuard } from '@/hooks';
import { useAppStore } from '@/store';
import { conceptService, paymentService } from '@/services';
import { Concept, ConceptDifficulty } from '@/types';

// Groups for filtering
const groups = ['All', 'Algorithms', 'Data Structures', 'System Design', 'Backend', 'Frontend', 'Database'];

// Difficulty levels
const difficulties: Array<'All' | ConceptDifficulty> = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const difficultyLabels: Record<string, string> = {
  All: 'All Levels',
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export default function ConceptsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { concepts, setConcepts, conceptsLoading, setConceptsLoading } = useAppStore();
  const { isChecking: isPlanChecking } = useTokenGuard();

  const isAuthenticated = status === 'authenticated';
  const authLoading = status === 'loading';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | ConceptDifficulty>('All');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load token balance and audio practice cost from backend
  useEffect(() => {
    const loadTokenInfo = async () => {
      try {
        const [balanceRes, configRes] = await Promise.all([
          paymentService.getTokenBalance(),
          paymentService.getTokenConfig(),
        ]);
        setTokenBalance(balanceRes.data?.tokenBalance ?? 0);
        setEstimatedCost(configRes.data?.audioAnalysis ?? 0);
      } catch (error) {
        console.error('Failed to load token info:', error);
        setEstimatedCost(0);
      }
    };
    loadTokenInfo();
  }, []);

  // Load concepts from backend
  useEffect(() => {
    const loadConcepts = async () => {
      if (!isAuthenticated) return;
      
      try {
        setConceptsLoading(true);
        const response = await conceptService.getConcepts(
          1, 
          50, 
          selectedGroup === 'All' ? undefined : selectedGroup, 
          selectedDifficulty === 'All' ? undefined : selectedDifficulty
        );
        setConcepts(response.data || []);
      } catch (error) {
        console.error('Failed to load concepts:', error);
        // Fallback to empty array if API fails
        setConcepts([]);
      } finally {
        setConceptsLoading(false);
      }
    };

    loadConcepts();
  }, [isAuthenticated, selectedGroup, selectedDifficulty, setConcepts, setConceptsLoading]);

  // Filter concepts (for local search)
  const filteredConcepts = concepts.filter((concept) => {
    const matchesSearch =
      searchQuery === '' ||
      concept.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      concept.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  if (authLoading || isPlanChecking) {
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
        title="Concepts"
        description="Browse and practice technical concepts to prepare for your interviews."
      />

      {/* Token Information */}
      <Card className="mb-8 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 dark:from-primary-950/20 to-transparent dark:to-transparent">
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 uppercase tracking-wide mb-3">
                Token Information
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Balance Card */}
              <div className="relative overflow-hidden rounded-lg border border-primary-100 dark:border-primary-900 bg-white dark:bg-secondary-900 p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent" />
                <div className="relative">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-400 mb-1">Available</p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{tokenBalance}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-300 mt-1">tokens</p>
                </div>
              </div>

              {/* Cost Card */}
              <div className="relative overflow-hidden rounded-lg border border-amber-100 dark:border-amber-900 bg-white dark:bg-secondary-900 p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                <div className="relative">
                  <p className="text-xs font-medium text-secondary-600 dark:text-secondary-400 mb-1">Per Analysis</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{estimatedCost}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-300 mt-1">tokens</p>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            {estimatedCost <= tokenBalance && tokenBalance > 0 ? (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-emerald-700 dark:text-emerald-200 font-medium">
                  Ready to practice! You have sufficient tokens
                </p>
              </div>
            ) : estimatedCost > tokenBalance ? (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-amber-700 dark:text-amber-200 font-medium">
                    Need {estimatedCost - tokenBalance} more tokens
                  </p>
                </div>
                <Link href="/tokens" className="w-full block">
                  <Button size="sm" className="w-full">
                    Buy Tokens Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 2.522a6 6 0 018.367 8.368zM9 13a4 4 0 100-8 4 4 0 000 8zm4.882-3.118a.75.75 0 10-1.06-1.061A2.25 2.25 0 1112.75 9a.75.75 0 01-1.5 0 3.75 3.75 0 00-3.868-3.868z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-200 font-medium">
                    No tokens available. Start practicing by purchasing tokens
                  </p>
                </div>
                <Link href="/tokens" className="w-full block">
                  <Button size="sm" className="w-full">
                    Get Tokens
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="w-full">
              <Input
                placeholder="Search concepts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Group Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {groups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setSelectedGroup(group)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedGroup === group
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                      }`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="sm:flex-shrink-0">
                <label className="block text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
                  Difficulty
                </label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedDifficulty === difficulty
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                      }`}
                    >
                      {difficultyLabels[difficulty]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concepts Grid */}
      {conceptsLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredConcepts.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">No concepts found</h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConcepts.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      )}

      {/* Results count */}
      {!conceptsLoading && filteredConcepts.length > 0 && (
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-6 text-center">
          Showing {filteredConcepts.length} of {concepts.length} concepts
        </p>
      )}
    </DashboardLayout>
  );
}
