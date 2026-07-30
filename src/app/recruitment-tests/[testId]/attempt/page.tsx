'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardContent, Badge, LoadingSpinner } from '@/components/ui';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useAuthStatus } from '@/hooks';
import { recruitmentTestService } from '@/services/recruitmentTestService';
import { TestQuestion } from '@/types';

const LazyCodeEditor = dynamic(
  () => import('@/components/features/CodeEditor').then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[560px] flex items-center justify-center rounded-xl border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/30 text-secondary-500 dark:text-secondary-400 text-sm">
        Loading coding workspace...
      </div>
    ),
  }
);

interface AttemptData {
  attemptId: string;
  questions: TestQuestion[];
  duration: number;
  startedAt: string;
  testTitle: string;
}

interface AnswerMap {
  [questionId: string]: {
    answer: string;
    language?: string;
  };
}

interface CodingPromptSections {
  title: string;
  description: string;
  constraints: string[];
}

function parseCodingPrompt(questionText: unknown, fallbackTitle: string): CodingPromptSections {
  const safeText = typeof questionText === 'string' ? questionText : '';
  const lines = safeText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      title: fallbackTitle,
      description: '',
      constraints: [],
    };
  }

  const title = lines[0].length <= 100 ? lines[0] : fallbackTitle;
  const description = lines.join('\n\n');

  const constraints = lines.filter((line) => {
    const lower = line.toLowerCase();
    return (
      lower.startsWith('constraints') ||
      lower.includes('<=') ||
      lower.includes('>=') ||
      /^-\s/.test(line)
    );
  });

  return {
    title,
    description,
    constraints,
  };
}

export default function TestAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [codeCompletionMap, setCodeCompletionMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [terminated, setTerminated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Anti-cheat
  const { violations, isFullscreen, enterFullscreen } = useAntiCheat({
    attemptId: attemptData?.attemptId || '',
    enabled: !!attemptData && !terminated,
    onTerminated: () => setTerminated(true),
  });

  // Auto-save
  const { markDirty, flushNow } = useAutoSave({
    attemptId: attemptData?.attemptId || '',
    enabled: !!attemptData && !terminated,
    intervalMs: 10000,
  });

  // Start test
  const startTest = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!testId) {
        throw new Error('Missing test id.');
      }
      const res = await recruitmentTestService.startTest(testId);
      const data = res?.data;

      if (!data?.attempt || !Array.isArray(data.questions) || !data.test) {
        throw new Error('Invalid test response received.');
      }
      const attemptId = data.attempt.id;
      const questions = data.questions;
      const duration = data.test.duration;
      const startedAt = data.attempt.startTime;
      const testTitle = data.test.title;

      // If resuming an existing attempt, restore saved answers
      const timeSinceStart = Date.now() - new Date(startedAt).getTime();
      if (timeSinceStart > 5000) {
        // Attempt was started more than 5s ago, likely a resume
        try {
          const statusRes = await recruitmentTestService.getAttemptStatus(attemptId);
          if (statusRes.data.answers?.length) {
            const restored: AnswerMap = {};
            const restoredCodeCompletion: Record<string, boolean> = {};
            for (const a of statusRes.data.answers) {
              const answerText = a.codeSubmission || a.answer || '';
              restored[a.questionId] = { answer: answerText, language: a.language };

              if (a.codeSubmission && a.isCorrect) {
                restoredCodeCompletion[a.questionId] = true;
              }
            }
            setAnswers(restored);
            setCodeCompletionMap(restoredCodeCompletion);
          }
        } catch {
          // Non-critical: continue without restored answers
        }
      }

      setAttemptData({ attemptId, questions, duration, startedAt, testTitle });

      // Calculate remaining time
      const elapsed = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
      const remaining = Math.max(0, duration * 60 - elapsed);
      setTimeLeft(remaining);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      const message = e.response?.data?.error?.message;
      setError(message || 'Failed to start test. Please check your eligibility.');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    startTest();
  }, [authLoading, isAuthenticated, router, startTest]);

  // Enter fullscreen once we have attempt data
  useEffect(() => {
    if (attemptData && !isFullscreen) {
      enterFullscreen();
    }
  }, [attemptData, isFullscreen, enterFullscreen]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !attemptData) return;
    setIsSubmitting(true);
    try {
      await flushNow();
      await recruitmentTestService.submitTest(attemptData.attemptId);
      if (timerRef.current) clearInterval(timerRef.current);
      router.push('/recruitment-tests?submitted=true');
    } catch {
      setError('Failed to submit test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptData, flushNow, isSubmitting, router]);

  // Countdown timer
  useEffect(() => {
    if (!attemptData || terminated) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when timer runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attemptData, handleSubmit, terminated]);

  const handleAnswerChange = useCallback(
    (questionId: string, answer: string, language?: string, mode: 'answer' | 'code' = 'answer') => {
      let changed = false;

      setAnswers((prev) => {
        const prevAnswer = prev[questionId];
        const resolvedLanguage = language ?? prevAnswer?.language;

        if (
          prevAnswer &&
          prevAnswer.answer === answer &&
          prevAnswer.language === resolvedLanguage
        ) {
          return prev;
        }

        changed = true;
        return {
          ...prev,
          [questionId]: {
            answer,
            language: resolvedLanguage,
          },
        };
      });

      if (changed) {
        markDirty(questionId, answer, language, mode === 'code');
      }
    },
    [markDirty]
  );

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const questions = attemptData?.questions ?? [];
  const testTitle = attemptData?.testTitle ?? '';
  const currentQuestion = questions[currentIndex];
  const currentOptions = currentQuestion && Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : [];
  const currentTestCases = currentQuestion && Array.isArray(currentQuestion.testCases)
    ? currentQuestion.testCases
    : [];
  const answeredCount = questions.filter((question) => {
    if (question.type === 'CODE') {
      return !!codeCompletionMap[question.id];
    }
    return !!answers[question.id]?.answer?.trim();
  }).length;
  const isUrgent = timeLeft < 300; // Less than 5 min

  const codingPrompt = useMemo(() => {
    if (!currentQuestion || currentQuestion.type !== 'CODE') {
      return null;
    }
    return parseCodingPrompt(
      currentQuestion.questionText,
      `Coding Question ${currentIndex + 1}`
    );
  }, [currentIndex, currentQuestion]);

  const currentCodeLanguage =
    (currentQuestion?.type === 'CODE' &&
      (answers[currentQuestion.id]?.language || currentQuestion.languageSupport?.[0])) ||
    'javascript';

  const handleCodeChange = useCallback(
    (code: string) => {
      if (!currentQuestion || currentQuestion.type !== 'CODE') {
        return;
      }
      handleAnswerChange(currentQuestion.id, code, currentCodeLanguage, 'code');
    },
    [currentCodeLanguage, currentQuestion, handleAnswerChange]
  );

  const handleCodeLanguageChange = useCallback(
    (language: string) => {
      if (!currentQuestion || currentQuestion.type !== 'CODE') {
        return;
      }
      handleAnswerChange(
        currentQuestion.id,
        answers[currentQuestion.id]?.answer || '',
        language,
        'code'
      );
    },
    [answers, currentQuestion, handleAnswerChange]
  );

  const handleCodeExecutionComplete = useCallback(
    (_results: Array<{ passed: boolean }>, allPassed: boolean) => {
      if (!currentQuestion || currentQuestion.type !== 'CODE') {
        return;
      }

      setCodeCompletionMap((prev) => {
        if (prev[currentQuestion.id] === allPassed) {
          return prev;
        }
        return {
          ...prev,
          [currentQuestion.id]: allPassed,
        };
      });
    },
    [currentQuestion]
  );

  // Terminated state
  if (terminated) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-secondary-900 flex items-center justify-center p-8">
        <Card>
          <CardContent>
            <div className="text-center space-y-4 max-w-md">
              <div className="text-4xl">🚫</div>
              <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Test Terminated</h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">
                Your test has been terminated due to too many violations ({violations}).
                Your submitted answers have been saved.
              </p>
              <Button onClick={() => router.push('/recruitment-tests')}>Back to Tests</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-secondary-900">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-sm text-secondary-500">Preparing test environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-secondary-900 p-8">
        <Card>
          <CardContent>
            <div className="text-center space-y-4 max-w-md">
              <div className="text-4xl">⚠️</div>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button variant="secondary" onClick={() => router.push('/recruitment-tests')}>Back to Tests</Button>
                <Button onClick={() => { setError(''); startTest(); }}>Retry</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!attemptData) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 flex flex-col select-none">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-secondary-900 dark:text-white truncate max-w-[300px]">
            {testTitle}
          </h1>
          {violations > 0 && (
            <Badge variant={violations >= 3 ? 'danger' : 'warning'}>
              {violations} violation{violations !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-secondary-500 dark:text-secondary-400">
            {answeredCount}/{questions.length} answered
          </span>
          <span className={`font-mono text-sm font-bold px-3 py-1 rounded-lg ${
            isUrgent
              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 animate-pulse'
              : 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
          }`}>
            {formatTime(timeLeft)}
          </span>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm('Are you sure you want to submit? You cannot change your answers after submitting.')) {
                handleSubmit();
              }
            }}
            isLoading={isSubmitting}
          >
            Submit Test
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: question navigator */}
        <div className="w-16 md:w-20 bg-secondary-50 dark:bg-secondary-800/50 border-r border-secondary-200 dark:border-secondary-700 overflow-y-auto py-2 flex flex-col items-center gap-1">
          {questions.map((q, i) => {
            const hasInput = !!answers[q.id]?.answer?.trim();
            const isCompleted = q.type === 'CODE' ? !!codeCompletionMap[q.id] : hasInput;
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-10 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
                  isCurrent
                    ? 'bg-primary-500 text-white shadow-md'
                    : isCompleted
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    : hasInput
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-white dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-600'
                }`}
                title={`Question ${i + 1} (${q.type})${isCompleted ? ' - Completed' : hasInput ? ' - In Progress' : ''}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentQuestion && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Question header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-secondary-400">Q{currentIndex + 1}/{questions.length}</span>
                    <Badge variant={currentQuestion.type === 'MCQ' ? 'info' : currentQuestion.type === 'SHORT' ? 'warning' : 'primary'}>
                      {currentQuestion.type}
                    </Badge>
                    <Badge variant="default">{currentQuestion.difficulty}</Badge>
                    <span className="text-xs text-secondary-400">{currentQuestion.marks} marks</span>
                    {currentQuestion.type === 'CODE' && codeCompletionMap[currentQuestion.id] && (
                      <Badge variant="success">Completed</Badge>
                    )}
                  </div>
                  <h2 className="text-base md:text-lg font-medium text-secondary-900 dark:text-white">
                    {currentQuestion.type === 'CODE' ? codingPrompt?.title || `Coding Question ${currentIndex + 1}` : currentQuestion.questionText}
                  </h2>
                </div>
              </div>

              {/* MCQ */}
              {currentQuestion.type === 'MCQ' && currentOptions.length > 0 && (
                <div className="grid gap-2">
                  {currentOptions.map((opt, j) => {
                    const selected = answers[currentQuestion.id]?.answer === opt;
                    return (
                      <button
                        key={j}
                        onClick={() => handleAnswerChange(currentQuestion.id, opt)}
                        className={`text-left p-3 rounded-xl border-2 transition-all text-sm ${
                          selected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:border-secondary-300 dark:hover:border-secondary-500'
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + j)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SHORT */}
              {currentQuestion.type === 'SHORT' && (
                <textarea
                  value={answers[currentQuestion.id]?.answer || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={8}
                  className="w-full p-4 rounded-xl border border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y text-sm"
                />
              )}

              {/* CODE */}
              {currentQuestion.type === 'CODE' && (
                <div className="h-[calc(100vh-200px)] min-h-[700px] rounded-xl border border-secondary-200 dark:border-secondary-700 overflow-hidden bg-white dark:bg-secondary-900">
                  <div className="flex flex-col lg:flex-row h-full min-h-0">
                    <aside className="lg:w-[30%] lg:min-w-[300px] lg:max-w-[420px] border-b lg:border-b-0 lg:border-r border-secondary-200 dark:border-secondary-700 overflow-y-auto">
                      <div className="p-5 space-y-5">
                        <div>
                          <h3 className="text-base font-semibold text-secondary-900 dark:text-white mb-1">Problem</h3>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">Solve using the selected language. Run executes all test cases.</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400 mb-1.5">Description</h4>
                          <p className="text-sm text-secondary-700 dark:text-secondary-300 whitespace-pre-wrap leading-relaxed">
                            {codingPrompt?.description || currentQuestion.questionText || ''}
                          </p>
                        </div>

                        {currentTestCases.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400 mb-2">Examples</h4>
                            <div className="space-y-2.5">
                              {currentTestCases.slice(0, 5).map((testCase, index) => (
                                <div
                                  key={index}
                                  className="rounded-lg border border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/60 p-3"
                                >
                                  <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 mb-1.5">Example {index + 1}</div>
                                  <div className="space-y-2">
                                    <div>
                                      <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 block mb-0.5">Input:</span>
                                      <pre className="text-sm font-mono text-secondary-700 dark:text-secondary-200 break-all whitespace-pre-wrap bg-white dark:bg-secondary-900/60 rounded px-2 py-1.5">{testCase.input}</pre>
                                    </div>
                                    {testCase.output && (
                                      <div>
                                        <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 block mb-0.5">Output:</span>
                                        <pre className="text-sm font-mono text-green-700 dark:text-green-300 break-all whitespace-pre-wrap bg-green-50 dark:bg-green-900/20 rounded px-2 py-1.5">{testCase.output}</pre>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {codingPrompt && codingPrompt.constraints.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400 mb-1.5">Constraints</h4>
                            <ul className="space-y-1.5">
                              {codingPrompt.constraints.slice(0, 8).map((constraint, index) => (
                                <li key={index} className="text-sm text-secondary-700 dark:text-secondary-300 break-words">
                                  • {constraint}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </aside>

                    <div className="flex-1 min-w-0 h-full">
                      <LazyCodeEditor
                        attemptId={attemptData.attemptId}
                        questionId={currentQuestion.id}
                        value={answers[currentQuestion.id]?.answer || ''}
                        language={currentCodeLanguage}
                        supportedLanguages={currentQuestion.languageSupport || ['javascript']}
                        onCodeChange={handleCodeChange}
                        onLanguageChange={handleCodeLanguageChange}
                        onExecutionComplete={handleCodeExecutionComplete}
                        testCaseCount={currentQuestion.testCaseCount || currentTestCases.length || 0}
                        sampleInput={currentTestCases[0]?.input || ''}
                        sampleTestCases={currentTestCases.map((tc) => tc.input)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-secondary-100 dark:border-secondary-700">
                <Button
                  variant="secondary"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                >
                  ← Previous
                </Button>
                <span className="text-xs text-secondary-400">
                  {currentIndex + 1} of {questions.length}
                </span>
                <Button
                  variant="secondary"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
