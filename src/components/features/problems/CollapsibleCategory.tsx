'use client';

import React, { useState } from 'react';
import { Problem, ProblemStatusValue} from '@/types';
import { ProblemRow } from './ProblemRow';

interface CollapsibleCategoryProps {
  category: string;
  problems: Problem[];
  statusMap: Record<string, ProblemStatusValue>;
  onStatusChange: (problemId: string, status: ProblemStatusValue) => void;
  defaultExpanded?: boolean;
}

const categoryColors: Record<string, { bg: string; iconColor: string; iconPath: string }> = {
  Sorting: {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconPath: 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4',
  },
  Graphs: {
    bg: 'bg-indigo-100 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    iconPath: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  'Dynamic Programming': {
    bg: 'bg-orange-100 dark:bg-orange-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    iconPath: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  },
  default: {
    bg: 'bg-green-100 dark:bg-green-500/20',
    iconColor: 'text-green-600 dark:text-green-400',
    iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
};

export const CollapsibleCategory: React.FC<CollapsibleCategoryProps> = ({
  category,
  problems,
  statusMap,
  onStatusChange,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const completedCount = problems.filter(
    (p) => statusMap[p.id] === 'completed' || statusMap[p.id] === 'pass'
  ).length;

  const categoryStyle = categoryColors[category] || categoryColors.default;
  const percentage = problems.length > 0 ? (completedCount / problems.length) * 100 : 0;

  return (
    <div className="rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-700/30 transition-colors duration-150 group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {/* Category Icon */}
          <div className={`w-10 h-10 rounded-lg ${categoryStyle.bg} flex items-center justify-center`}>
            <svg
              className={`w-5 h-5 ${categoryStyle.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={categoryStyle.iconPath}
              />
            </svg>
          </div>

          {/* Category Info */}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-secondary-900 dark:text-white">
                {category}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400">
                {problems.length}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-secondary-500 dark:text-secondary-400">
                {completedCount} / {problems.length} solved
              </span>
              <span className="text-secondary-300 dark:text-secondary-600">•</span>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Bar */}
          <div className="hidden sm:block w-24 h-2 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 dark:bg-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Chevron */}
          <svg
            className={`w-5 h-5 text-secondary-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Problems List */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-secondary-100 dark:border-secondary-700 pt-3">
          {problems.map((problem) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              status={statusMap[problem.id]}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollapsibleCategory;
