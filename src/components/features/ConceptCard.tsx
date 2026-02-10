import React from 'react';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui';
import { Concept } from '@/types';

interface ConceptCardProps {
  concept: Concept;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept }) => {
  const difficultyColors = {
    BEGINNER: 'success',
    INTERMEDIATE: 'warning',
    ADVANCED: 'danger',
  } as const;

  const difficultyLabels = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
  };

  return (
    <Link href={`/record/${concept.id}`}>
      <Card hover className="h-full">
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge variant={difficultyColors[concept.difficulty]}>
              {difficultyLabels[concept.difficulty]}
            </Badge>
            <Badge variant="default">{concept.group}</Badge>
          </div>

          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
            {concept.title}
          </h3>

          <p className="text-secondary-600 dark:text-secondary-400 text-sm flex-grow line-clamp-3">
            {concept.description}
          </p>

          <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700 flex items-center justify-between">
            <span className="text-sm text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
              Record Answer
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ConceptCard;
