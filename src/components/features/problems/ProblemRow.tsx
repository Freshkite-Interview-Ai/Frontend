'use client';

import React from 'react';
import { Problem, ProblemStatusValue } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';
import { StatusDropdown } from './StatusDropdown';

interface ProblemRowProps {
  problem: Problem;
  status?: ProblemStatusValue;
  onStatusChange: (problemId: string, status: ProblemStatusValue) => void;
}

export const ProblemRow: React.FC<ProblemRowProps> = ({
  problem,
  status,
  onStatusChange,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white dark:bg-secondary-800/50 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors duration-150 group border border-secondary-200 dark:border-secondary-700">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Status indicator icon */}
        <div className="flex-shrink-0">
          {status === 'completed' ? (
            <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
          ) : status === 'pass' ? (
            <div className="w-6 h-6 rounded-md bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
          ) : status === 'fail' ? (
            <div className="w-6 h-6 rounded-md bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 rounded-md bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-secondary-400 dark:border-secondary-500" />
            </div>
          )}
        </div>

        {/* Problem title as link */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={problem.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-secondary-800 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 truncate transition-colors duration-150 flex items-center gap-1.5 group/link"
              title={problem.title}
            >
              {problem.title}
              <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* New badge */}
            {problem.isNew && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400">
                NEW
              </span>
            )}
          </div>

          {/* Tags */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              {problem.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400"
                >
                  {tag}
                </span>
              ))}
              {problem.tags.length > 2 && (
                <span className="text-[10px] text-secondary-400 dark:text-secondary-500">
                  +{problem.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <DifficultyBadge difficulty={problem.difficulty} />
        <StatusDropdown
          currentStatus={status}
          onStatusChange={(newStatus) => onStatusChange(problem.id, newStatus)}
        />
      </div>
    </div>
  );
};

export default ProblemRow;
