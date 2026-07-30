'use client';

import React from 'react';
import { SubmissionTestResult, ProblemSubmission } from '@/types';

interface TestCaseConsoleProps {
  activeTab: 'run' | 'submit';
  onTabChange: (tab: 'run' | 'submit') => void;
  runResults: SubmissionTestResult[] | null;
  submitResults: SubmissionTestResult[] | null;
  submission: ProblemSubmission | null;
  isRunning: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export function TestCaseConsole({
  activeTab,
  onTabChange,
  runResults,
  submitResults,
  submission,
  isRunning,
  isSubmitting,
  error,
}: TestCaseConsoleProps) {
  const results = activeTab === 'run' ? runResults : submitResults;
  const isProcessing = activeTab === 'run' ? isRunning : isSubmitting;

  const passedCount = results?.filter((r) => r.passed).length ?? 0;
  const totalCount = results?.length ?? 0;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-secondary-900">
      {/* Tabs */}
      <div className="flex items-center border-b border-secondary-200 dark:border-secondary-700 px-3 flex-shrink-0">
        <button
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'run'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
          }`}
          onClick={() => onTabChange('run')}
        >
          Run Results
          {runResults && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-700">
              {runResults.filter((r) => r.passed).length}/{runResults.length}
            </span>
          )}
        </button>
        <button
          className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'submit'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
          }`}
          onClick={() => onTabChange('submit')}
        >
          Submission
          {submission && (
            <span
              className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                submission.status === 'passed'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}
            >
              {submission.status === 'passed' ? 'Accepted' : 'Failed'}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {/* Processing */}
        {isProcessing && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2" />
              <p className="text-secondary-500 dark:text-secondary-400 text-sm">
                {activeTab === 'run' ? 'Running code...' : 'Submitting...'}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!isProcessing && error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-red-500 text-sm">✗</span>
              <div className="text-sm text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap break-all">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* No results yet */}
        {!isProcessing && !error && !results && (
          <div className="flex items-center justify-center h-full text-secondary-400 dark:text-secondary-500 text-sm">
            {activeTab === 'run'
              ? 'Click "Run" to test your code against visible test cases'
              : 'Click "Submit" to test against all test cases'}
          </div>
        )}

        {/* Results */}
        {!isProcessing && !error && results && results.length > 0 && (
          <div className="space-y-2">
            {/* Summary Banner */}
            <div
              className={`rounded-lg p-2.5 text-sm font-medium ${
                allPassed
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {allPassed ? (
                <span>✓ All {totalCount} test cases passed!</span>
              ) : (
                <span>
                  ✗ {passedCount}/{totalCount} test cases passed
                </span>
              )}
            </div>

            {/* Individual Results */}
            {results.map((result, index) => (
              <div
                key={index}
                className={`rounded-lg border text-xs overflow-hidden ${
                  result.passed
                    ? 'border-green-200 dark:border-green-800'
                    : 'border-red-200 dark:border-red-800'
                }`}
              >
                {/* Result Header */}
                <div
                  className={`px-3 py-1.5 flex items-center justify-between ${
                    result.passed
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <span
                    className={`font-medium ${
                      result.passed
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-red-700 dark:text-red-300'
                    }`}
                  >
                    {result.passed ? '✓' : '✗'} Test Case {result.testCaseIndex + 1}
                  </span>
                  {result.executionTime !== undefined && (
                    <span className="text-secondary-400">{result.executionTime}ms</span>
                  )}
                </div>

                {/* Result Details */}
                <div className="p-3 space-y-1.5 font-mono bg-white dark:bg-secondary-900">
                  <div>
                    <span className="text-secondary-500">Input: </span>
                    <span className="text-secondary-900 dark:text-white">{result.input}</span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Expected: </span>
                    <span className="text-green-600 dark:text-green-400">{result.expectedOutput}</span>
                  </div>
                  <div>
                    <span className="text-secondary-500">Output: </span>
                    <span
                      className={
                        result.passed
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {result.actualOutput}
                    </span>
                  </div>
                  {result.error && (
                    <div className="mt-1 text-red-600 dark:text-red-400 whitespace-pre-wrap">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
