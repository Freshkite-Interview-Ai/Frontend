'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ProblemDescription } from './ProblemDescription';
import { MonacoCodeEditor } from './MonacoCodeEditor';
import { TestCaseConsole } from './TestCaseConsole';
import { SubmissionLock } from './SubmissionLock';
import { problemSolverService } from '@/services/problemSolverService';
import { Button, Badge } from '@/components/ui';
import {
  SolvableProblem,
  ProblemTestCaseVisible,
  ProblemSubmission,
  SubmissionTestResult,
  SubmissionContext,
} from '@/types';

export interface ProblemSolverProps {
  problemId: string;
  context?: SubmissionContext;
  contextId?: string;
  onSubmitSuccess?: (submission: ProblemSubmission) => void;
}

export function ProblemSolver({
  problemId,
  context = 'practice',
  contextId,
  onSubmitSuccess,
}: ProblemSolverProps) {
  // Data state
  const [problem, setProblem] = useState<SolvableProblem | null>(null);
  const [visibleTestCases, setVisibleTestCases] = useState<ProblemTestCaseVisible[]>([]);
  const [submission, setSubmission] = useState<ProblemSubmission | null>(null);
  const [locked, setLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState<SubmissionTestResult[] | null>(null);
  const [submitResults, setSubmitResults] = useState<SubmissionTestResult[] | null>(null);
  const [activeTab, setActiveTab] = useState<'run' | 'submit'>('run');
  const [runError, setRunError] = useState<string | null>(null);

  // Panel resize state
  const [leftPanelWidth, setLeftPanelWidth] = useState(45); // percentage
  const [bottomPanelHeight, setBottomPanelHeight] = useState(250); // pixels
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingHorizontal = useRef(false);
  const isResizingVertical = useRef(false);

  // Load problem data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await problemSolverService.getSolveData(problemId, context, contextId);
        if (res.success) {
          setProblem(res.data.problem);
          setVisibleTestCases(res.data.visibleTestCases);
          setSubmission(res.data.submission);
          setLocked(res.data.locked);

          // Set initial boilerplate
          const boilerplate = res.data.problem.boilerplate;
          if (boilerplate) {
            const lang = Object.keys(boilerplate)[0] || 'javascript';
            setLanguage(lang);
            setCode(boilerplate[lang] || '');
          }
        }
      } catch {
        setError('Failed to load problem. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [problemId, context, contextId]);

  // Language change handler
  const handleLanguageChange = useCallback(
    (lang: string) => {
      setLanguage(lang);
      if (problem?.boilerplate?.[lang]) {
        setCode(problem.boilerplate[lang]);
      }
    },
    [problem]
  );

  // Run code
  const handleRun = useCallback(async () => {
    if (!code.trim() || !problem) return;
    setIsRunning(true);
    setRunResults(null);
    setRunError(null);
    setActiveTab('run');
    try {
      const res = await problemSolverService.runCode(problemId, code, language);
      if (res.success) {
        setRunResults(res.data.results);
      }
    } catch (err: any) {
      setRunError(err.response?.data?.error?.message || 'Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  }, [code, language, problemId, problem]);

  // Submit code
  const handleSubmit = useCallback(async () => {
    if (!code.trim() || !problem) return;
    setIsSubmitting(true);
    setSubmitResults(null);
    setRunError(null);
    setActiveTab('submit');
    try {
      const res = await problemSolverService.submitCode(problemId, code, language, context, contextId);
      if (res.success) {
        setSubmission(res.data);
        setSubmitResults(res.data.results);
        if (context !== 'practice') {
          setLocked(true);
        }
        onSubmitSuccess?.(res.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Submission failed';
      setRunError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }, [code, language, problemId, context, contextId, problem, onSubmitSuccess]);

  // Horizontal resize
  const handleHorizontalResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingHorizontal.current = true;
    const startX = e.clientX;
    const startWidth = leftPanelWidth;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingHorizontal.current || !containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width;
      const delta = e.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + (delta / containerWidth) * 100, 20), 70);
      setLeftPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizingHorizontal.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftPanelWidth]);

  // Vertical resize
  const handleVerticalResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingVertical.current = true;
    const startY = e.clientY;
    const startHeight = bottomPanelHeight;

    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingVertical.current) return;
      const delta = startY - e.clientY;
      const newHeight = Math.min(Math.max(startHeight + delta, 100), 500);
      setBottomPanelHeight(newHeight);
    };

    const onMouseUp = () => {
      isResizingVertical.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [bottomPanelHeight]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-white dark:bg-secondary-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4" />
          <p className="text-secondary-500 dark:text-secondary-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !problem) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-white dark:bg-secondary-900">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 text-lg font-medium mb-2">
            {error || 'Problem not found'}
          </p>
          <p className="text-secondary-500 dark:text-secondary-400 text-sm">
            Please check the problem ID and try again.
          </p>
        </div>
      </div>
    );
  }

  // Locked state (already submitted in test/interview)
  if (locked && submission) {
    return (
      <SubmissionLock
        problem={problem}
        submission={submission}
      />
    );
  }

  const availableLanguages = problem.boilerplate ? Object.keys(problem.boilerplate) : ['javascript'];

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white dark:bg-secondary-900">
      {/* Sticky Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary-50 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white truncate max-w-md">
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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleRun}
            isLoading={isRunning}
            disabled={!code.trim() || isSubmitting}
          >
            ▶ Run
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={!code.trim() || isRunning}
          >
            Submit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel - Problem Description */}
        <div
          className="overflow-y-auto border-r border-secondary-200 dark:border-secondary-700"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <ProblemDescription
            problem={problem}
            visibleTestCases={visibleTestCases}
          />
        </div>

        {/* Horizontal Resize Handle */}
        <div
          className="w-1.5 cursor-col-resize bg-secondary-100 dark:bg-secondary-700 hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors flex-shrink-0"
          onMouseDown={handleHorizontalResizeStart}
        />

        {/* Right Panel - Editor + Console */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Code Editor */}
          <div className="flex-1 min-h-0" style={{ marginBottom: `${bottomPanelHeight}px` }}>
            <MonacoCodeEditor
              code={code}
              language={language}
              availableLanguages={availableLanguages}
              onCodeChange={setCode}
              onLanguageChange={handleLanguageChange}
            />
          </div>

          {/* Vertical Resize Handle */}
          <div
            className="h-1.5 cursor-row-resize bg-secondary-100 dark:bg-secondary-700 hover:bg-primary-300 dark:hover:bg-primary-600 transition-colors flex-shrink-0"
            style={{ position: 'absolute', bottom: `${bottomPanelHeight}px`, left: `${leftPanelWidth}%`, right: 0, zIndex: 10 }}
            onMouseDown={handleVerticalResizeStart}
          />

          {/* Bottom Panel - Test Cases Console */}
          <div
            className="border-t border-secondary-200 dark:border-secondary-700 flex-shrink-0 overflow-hidden"
            style={{ position: 'absolute', bottom: 0, left: `${leftPanelWidth}%`, right: 0, height: `${bottomPanelHeight}px` }}
          >
            <TestCaseConsole
              activeTab={activeTab}
              onTabChange={setActiveTab}
              runResults={runResults}
              submitResults={submitResults}
              submission={submission}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
              error={runError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
