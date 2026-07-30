'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import { SolvableProblem, ProblemTestCaseVisible } from '@/types';

interface ProblemDescriptionProps {
  problem: SolvableProblem;
  visibleTestCases: ProblemTestCaseVisible[];
}

export function ProblemDescription({ problem, visibleTestCases }: ProblemDescriptionProps) {
  return (
    <div className="p-5 space-y-6">
      {/* Title & Difficulty */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant={
              problem.difficulty === 'Easy'
                ? 'success'
                : problem.difficulty === 'Medium'
                ? 'warning'
                : 'danger'
            }
          >
            {problem.difficulty}
          </Badge>
          {problem.tags?.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="text-xl font-bold text-secondary-900 dark:text-white mt-2">
          {problem.title}
        </h1>
      </div>

      {/* Description */}
      {problem.description && (
        <div className="prose dark:prose-invert max-w-none text-sm">
          <div className="whitespace-pre-wrap text-secondary-700 dark:text-secondary-300 leading-relaxed">
            {problem.description}
          </div>
        </div>
      )}

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="space-y-4">
          {problem.examples.map((example, index) => (
            <div key={index} className="rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
              <div className="px-3 py-1.5 bg-secondary-50 dark:bg-secondary-800 text-xs font-semibold text-secondary-600 dark:text-secondary-400">
                Example {index + 1}
              </div>
              <div className="p-3 bg-secondary-25 dark:bg-secondary-850 font-mono text-sm space-y-1">
                <div>
                  <span className="text-secondary-500 dark:text-secondary-400">Input: </span>
                  <span className="text-secondary-900 dark:text-white">{example.input}</span>
                </div>
                <div>
                  <span className="text-secondary-500 dark:text-secondary-400">Output: </span>
                  <span className="text-secondary-900 dark:text-white">{example.output}</span>
                </div>
                {example.explanation && (
                  <div className="mt-2 text-secondary-600 dark:text-secondary-400 text-xs leading-relaxed font-sans">
                    <span className="font-semibold">Explanation: </span>
                    {example.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && (
        <div>
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-2">Constraints</h3>
          <div className="whitespace-pre-wrap text-sm text-secondary-600 dark:text-secondary-400 font-mono bg-secondary-50 dark:bg-secondary-800 p-3 rounded-lg">
            {problem.constraints}
          </div>
        </div>
      )}

      {/* Visible Test Cases */}
      {visibleTestCases.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-white mb-2">
            Test Cases ({visibleTestCases.length} visible)
          </h3>
          <div className="space-y-2">
            {visibleTestCases.map((tc, index) => (
              <div
                key={index}
                className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-3 font-mono text-xs space-y-1 border border-secondary-200 dark:border-secondary-700"
              >
                <div>
                  <span className="text-secondary-500 dark:text-secondary-400">Input: </span>
                  <span className="text-secondary-900 dark:text-white">{tc.input}</span>
                </div>
                <div>
                  <span className="text-secondary-500 dark:text-secondary-400">Expected: </span>
                  <span className="text-green-600 dark:text-green-400">{tc.expectedOutput}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
