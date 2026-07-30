'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import { SolvableProblem, ProblemSubmission } from '@/types';

interface SubmissionLockProps {
  problem: SolvableProblem;
  submission: ProblemSubmission;
}

export function SubmissionLock({ problem, submission }: SubmissionLockProps) {
  const allPassed = submission.status === 'passed';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-secondary-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
            {problem.title}
          </h2>
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
        </div>
        <Badge variant={allPassed ? 'success' : 'danger'}>
          {allPassed ? 'Accepted' : 'Failed'} — Submitted
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
              allPassed
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}
          >
            <span className="text-3xl">{allPassed ? '✓' : '✗'}</span>
          </div>

          <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
            {allPassed ? 'Solution Accepted' : 'Solution Failed'}
          </h3>

          <p className="text-secondary-500 dark:text-secondary-400 mb-6">
            You have already submitted your solution for this problem.
            {submission.context !== 'practice' && ' This submission is locked and cannot be changed.'}
          </p>

          {/* Score */}
          <div className="inline-flex items-center gap-4 bg-secondary-50 dark:bg-secondary-800 rounded-xl px-6 py-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-900 dark:text-white">
                {submission.passedCount}/{submission.totalCount}
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                Test Cases Passed
              </div>
            </div>
            <div className="h-10 w-px bg-secondary-200 dark:bg-secondary-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary-900 dark:text-white capitalize">
                {submission.language}
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                Language
              </div>
            </div>
          </div>

          {/* Submitted Code */}
          <div className="text-left mt-4">
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-2">
              Your Submitted Code
            </h4>
            <pre className="bg-secondary-900 dark:bg-secondary-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono leading-relaxed max-h-80 overflow-y-auto">
              {submission.code}
            </pre>
          </div>

          {/* Results */}
          {submission.results && submission.results.length > 0 && (
            <div className="text-left mt-6">
              <h4 className="text-sm font-semibold text-secondary-900 dark:text-white mb-2">
                Test Results
              </h4>
              <div className="space-y-2">
                {submission.results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs font-mono ${
                      result.passed
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <span
                      className={`font-semibold ${
                        result.passed
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}
                    >
                      {result.passed ? '✓' : '✗'} Case {result.testCaseIndex + 1}
                    </span>
                    <span className="text-secondary-500 ml-2">
                      Output: {result.actualOutput}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
