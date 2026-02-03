'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingSpinner, Badge, Input } from '@/components/ui';
import { ConceptCard } from '@/components/features';
import { useApi, usePlanGuard } from '@/hooks';
import { useAppStore } from '@/store';
import { conceptService } from '@/services';
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
  const { isChecking: isPlanChecking } = usePlanGuard('basic');

  const isAuthenticated = status === 'authenticated';
  const authLoading = status === 'loading';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | ConceptDifficulty>('All');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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
