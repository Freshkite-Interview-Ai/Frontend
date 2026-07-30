'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout, PageHeader } from '@/components/layout';
import {
  Card,
  CardContent,
  Button,
  LoadingSpinner,
  LoadingPage,
  Badge,
  Input,
  Toast,
  TokenCostBadge,
} from '@/components/ui';
import { ConceptCard } from '@/components/features';
import { useApi, useTokenGuard, useAuthStatus } from '@/hooks';
import { useAppStore } from '@/store';
import { conceptService, paymentService } from '@/services';
import { Concept, ConceptDifficulty, RecommendedConcept } from '@/types';

// Difficulty levels
const difficulties: Array<'All' | ConceptDifficulty> = ['All', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const difficultyLabels: Record<string, string> = {
  All: 'All Levels',
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

function ConceptsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const { concepts, setConcepts, conceptsLoading, setConceptsLoading } = useAppStore();
  const { isChecking: isPlanChecking } = useTokenGuard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | ConceptDifficulty>('All');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [groups, setGroups] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedConcept[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Show the success snackbar after returning from the create page, then drop the flag
  useEffect(() => {
    if (searchParams?.get('created') === '1') {
      setToastMessage('Concept created successfully.');
      router.replace('/concepts');
    }
  }, [searchParams, router]);

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

  // Load available groups from backend
  useEffect(() => {
    const loadGroups = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await conceptService.getGroups();
        if (response.success && Array.isArray(response.data)) {
          setGroups(response.data);
        }
      } catch (error) {
        console.error('Failed to load concept groups:', error);
      }
    };
    loadGroups();
  }, [isAuthenticated]);

  // Load recommended concepts
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!isAuthenticated) return;
      try {
        setRecommendationsLoading(true);
        const response = await conceptService.getRecommendations();
        if (response.success && Array.isArray(response.data)) {
          setRecommendations(response.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setRecommendationsLoading(false);
      }
    };
    loadRecommendations();
  }, [isAuthenticated]);

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

  // Distinguishes "you haven't created anything yet" from "filters matched nothing"
  const hasNoConcepts =
    concepts.length === 0 &&
    searchQuery === '' &&
    selectedGroup === 'All' &&
    selectedDifficulty === 'All';

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
        description="Your personal interview topics. Practice them by recording an answer."
        action={
          <Link href="/concepts/new">
            <Button
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                </svg>
              }
            >
              New Concept
            </Button>
          </Link>
        }
      />

      {/* Token summary - compact, informative, visually lightweight */}
      <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <TokenCostBadge cost={estimatedCost} />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/70 px-3 py-1 text-xs font-medium text-secondary-600 dark:text-secondary-300">
          <span className="text-secondary-500/80 dark:text-secondary-400">Balance</span>
          <span className="font-semibold tabular-nums text-secondary-900 dark:text-white">
            {tokenBalance} Tokens
          </span>
        </span>
        {estimatedCost > tokenBalance && (
          <Link
            href="/tokens"
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Need {estimatedCost - tokenBalance} more &mdash; buy tokens
          </Link>
        )}
      </div>

      {/* Recommended for You */}
      {recommendations.length > 0 && (
        <Card className="mb-8">
          <CardContent>
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 pt-4">
              Recommended for You
            </h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">
              Based on your target goal and practice history
            </p>
            {recommendationsLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recommendations.map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/record/${rec.id}`}
                    className="flex items-start gap-3 p-3 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 dark:text-white text-sm truncate">
                        {rec.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            rec.difficulty === 'ADVANCED'
                              ? 'danger'
                              : rec.difficulty === 'INTERMEDIATE'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {rec.difficulty}
                        </Badge>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400 truncate">
                          {rec.reason}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                  {['All', ...groups].map((group) => (
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
        <Card padding="lg">
          <CardContent>
            <div className="text-center py-12 max-w-md mx-auto">
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
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                {hasNoConcepts ? 'No concepts yet' : 'No concepts found'}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {hasNoConcepts
                  ? 'Create your first concept and start practicing with a question of your own.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {hasNoConcepts && (
                <Link href="/concepts/new" className="inline-block mt-6">
                  <Button>Create Concept</Button>
                </Link>
              )}
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

      {toastMessage && (
        <Toast message={toastMessage} variant="success" onClose={() => setToastMessage('')} />
      )}
    </DashboardLayout>
  );
}

export default function ConceptsPage() {
  return (
    <Suspense fallback={<LoadingPage message="Loading concepts..." />}>
      <ConceptsPageContent />
    </Suspense>
  );
}
