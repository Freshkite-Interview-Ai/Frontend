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
    <Link
      href={`/record/${concept.id}`}
      className="group block h-full rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-secondary-900"
    >
      <Card
        hover
        className="h-full transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-elevated group-active:translate-y-0 group-active:shadow-card"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-4">
            <Badge variant={difficultyColors[concept.difficulty]}>
              {difficultyLabels[concept.difficulty]}
            </Badge>
            <Badge variant="default" className="max-w-[55%] truncate">
              {concept.group}
            </Badge>
          </div>

          <h3 className="text-lg font-semibold leading-snug tracking-tight text-secondary-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
            {concept.title}
          </h3>

          <p className="text-sm leading-relaxed text-secondary-600 dark:text-secondary-400 flex-grow line-clamp-3">
            {concept.description}
          </p>

          <div className="mt-5 pt-4 border-t border-secondary-100 dark:border-secondary-700/80 flex items-center justify-between">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
              Record Answer
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
