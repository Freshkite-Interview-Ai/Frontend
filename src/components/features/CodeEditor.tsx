'use client';

import dynamic from 'next/dynamic';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Badge } from '@/components/ui';
import { recruitmentTestService } from '@/services/recruitmentTestService';

interface CodeEditorProps {
  attemptId: string;
  questionId: string;
  value: string;
  language: string;
  supportedLanguages: string[];
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onExecutionComplete?: (results: TestResult[], allPassed: boolean) => void;
  testCaseCount?: number;
  sampleInput?: string;
  sampleTestCases?: string[];
}

interface TestResult {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime?: number;
  error?: string;
}

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-secondary-900 text-secondary-300 text-sm">
        Loading editor...
      </div>
    ),
  }
);

const MONACO_LANG_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
};

const LANG_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
};

export const CodeEditor = memo(function CodeEditor({
  attemptId,
  questionId,
  value,
  language,
  supportedLanguages,
  onCodeChange,
  onLanguageChange,
  onExecutionComplete,
  testCaseCount = 0,
  sampleInput = '',
  sampleTestCases = [],
}: CodeEditorProps) {
  const initialEditorLoadRef = useRef<number>(
    typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now()
  );
  const codeDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [editorLoadMs, setEditorLoadMs] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionError, setExecutionError] = useState<string>('');
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [localCode, setLocalCode] = useState(value);
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase');
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  const resolvedSampleTestCases = useMemo(
    () => (sampleTestCases.length > 0 ? sampleTestCases : sampleInput ? [sampleInput] : []),
    [sampleInput, sampleTestCases]
  );
  const selectedSampleInput = resolvedSampleTestCases[selectedTestCaseIndex] || '';

  // Reset results/state only when navigating to a different question
  useEffect(() => {
    setSelectedTestCaseIndex(0);
    setLocalCode(value || '');
    setExecutionError('');
    setTestResults(null);
    setActiveTab('testcase');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  // Sync code from parent only if user hasn't started typing (avoids overwriting local edits)
  const lastSyncedValueRef = useRef(value);
  useEffect(() => {
    if (value !== lastSyncedValueRef.current && value !== localCode) {
      // Only sync if this is a genuinely new external value (e.g. question switch)
      // and not our own debounced save echoing back
      lastSyncedValueRef.current = value;
    }
  }, [value, localCode]);

  useEffect(() => {
    return () => {
      if (codeDebounceTimerRef.current) {
        clearTimeout(codeDebounceTimerRef.current);
        codeDebounceTimerRef.current = null;
      }
    };
  }, []);

  const handleEditorChange = useCallback(
    (nextValue: string) => {
      setLocalCode(nextValue);

      if (codeDebounceTimerRef.current) {
        clearTimeout(codeDebounceTimerRef.current);
      }

      codeDebounceTimerRef.current = setTimeout(() => {
        onCodeChange(nextValue);
      }, 250);
    },
    [onCodeChange]
  );

  const handleEditorMounted = useCallback(() => {
    const now = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const loadMs = now - initialEditorLoadRef.current;
    setEditorLoadMs(loadMs);
    if (loadMs > 1500) {
      console.warn(`[CodeEditor] slow editor mount: ${loadMs.toFixed(0)}ms`);
    }
  }, []);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setExecutionError('');
    setTestResults(null);
    setActiveTab('result');

    try {
      // Run executes all test cases for this coding question.
      const res = await recruitmentTestService.executeCode(attemptId, questionId, localCode, language);
      const data = res?.data ?? res;
      const resultArray = Array.isArray(data) ? data : [];
      const results: TestResult[] = resultArray.map((r: TestResult) => ({
        passed: r.passed,
        input: r.input ?? '',
        expectedOutput: r.expectedOutput ?? '',
        actualOutput: r.actualOutput ?? '',
        executionTime: r.executionTime,
        error: r.error,
      }));

      if (results.length === 0) {
        setExecutionError('No test case results returned. The question may not have test cases configured.');
      } else {
        setTestResults(results);
        const allPassed = results.every((result) => result.passed);
        onExecutionComplete?.(results, allPassed);
      }
    } catch (err: unknown) {
      // Extract meaningful error from API response
      let message = 'Failed to execute code. Please try again.';
      if (err && typeof err === 'object') {
        const axiosErr = err as { response?: { data?: { error?: { message?: string }; message?: string }; status?: number } };
        const apiMsg = axiosErr.response?.data?.error?.message || axiosErr.response?.data?.message;
        if (apiMsg) {
          message = apiMsg;
        } else if (axiosErr.response?.status === 400) {
          message = `Invalid request – ensure your selected language is supported.`;
        }
      }
      setExecutionError(message);
    } finally {
      setIsRunning(false);
    }
  }, [attemptId, language, localCode, onExecutionComplete, questionId]);

  const passedCount = testResults?.filter((result) => result.passed).length || 0;
  const totalCount = testResults?.length || 0;
  const allPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="flex flex-col h-full border border-secondary-200 dark:border-secondary-700 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-secondary-50 dark:bg-secondary-800 px-4 py-2.5 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg bg-white dark:bg-secondary-700 border border-secondary-200 dark:border-secondary-600 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>{LANG_DISPLAY[lang] || lang}</option>
            ))}
          </select>
          {editorLoadMs !== null && (
            <span className="text-xs text-secondary-500 dark:text-secondary-400">
              Editor: {editorLoadMs.toFixed(0)}ms
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {testResults && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
              allPassed
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            }`}>
              {passedCount}/{totalCount} passed
            </span>
          )}
          <Button size="sm" variant="primary" onClick={handleRun} isLoading={isRunning} disabled={!localCode.trim()}>
            ▶ Run Code ({testCaseCount || 'All'})
          </Button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-[300px]">
        <MonacoEditor
          height="100%"
          language={MONACO_LANG_MAP[language] || language}
          value={localCode}
          onChange={(val) => handleEditorChange(val || '')}
          onMount={handleEditorMounted}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            lineNumbers: 'on',
            tabSize: 2,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 14, bottom: 14 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
            fontLigatures: true,
            lineHeight: 22,
          }}
        />
      </div>

      {/* Output panel */}
      <div className="border-t-2 border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800">
        {/* Tabs */}
        <div className="flex border-b border-secondary-200 dark:border-secondary-700">
          <button
            onClick={() => setActiveTab('testcase')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'testcase'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 bg-white/50 dark:bg-secondary-700/50'
                : 'text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            Testcase
          </button>
          <button
            onClick={() => setActiveTab('result')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'result'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 bg-white/50 dark:bg-secondary-700/50'
                : 'text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            Test Result {testResults && (
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${
                allPassed ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
              }`}>{passedCount}/{testResults.length}</span>
            )}
          </button>
        </div>

        <div className="max-h-[340px] overflow-y-auto">
          {activeTab === 'testcase' && (
            <div className="p-4 space-y-3">
              {resolvedSampleTestCases.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {resolvedSampleTestCases.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTestCaseIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        selectedTestCaseIndex === idx
                          ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                          : 'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-300 hover:border-secondary-300 dark:hover:border-secondary-500'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="text-sm text-secondary-600 dark:text-secondary-400 block mb-1.5 font-medium">Sample Input</label>
                <textarea
                  value={selectedSampleInput}
                  readOnly
                  className="w-full p-3 text-sm font-mono bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-600 rounded-lg text-secondary-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-primary-500 leading-relaxed"
                  rows={4}
                  placeholder="No sample testcase available"
                />
                <p className="mt-1.5 text-xs text-secondary-500 dark:text-secondary-400">
                  Click &quot;Run Code&quot; to execute against all test cases.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'result' && (
            <div className="p-4 space-y-3">
              {isRunning && (
                <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400 py-4">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running all test cases...
                </div>
              )}

              {executionError && (
                <div className="p-3 rounded-lg text-sm font-mono whitespace-pre-wrap bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                  {executionError}
                </div>
              )}

              {testResults && (
                <div className="space-y-3">
                  <div className={`text-sm font-bold flex items-center gap-2 ${allPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs ${allPassed ? 'bg-green-500' : 'bg-red-500'}`}>
                      {allPassed ? '✓' : '✕'}
                    </span>
                    {allPassed
                      ? `All ${totalCount} Test Cases Passed`
                      : `${passedCount} of ${totalCount} Test Cases Passed`}
                  </div>
                  {testResults.map((result, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${
                      result.passed
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={result.passed ? 'success' : 'danger'}>
                          {result.passed ? '✓ Passed' : '✕ Failed'}
                        </Badge>
                        <span className="text-sm font-medium text-secondary-600 dark:text-secondary-300">Test Case {i + 1}</span>
                        {typeof result.executionTime === 'number' && (
                          <span className="text-xs text-secondary-400 ml-auto">{result.executionTime}ms</span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
                        <div className="bg-white/60 dark:bg-secondary-900/60 rounded-md p-2">
                          <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 block mb-0.5">Input</span>
                          <pre className="text-sm text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap break-all">{result.input || '—'}</pre>
                        </div>
                        <div className="bg-white/60 dark:bg-secondary-900/60 rounded-md p-2">
                          <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 block mb-0.5">Expected</span>
                          <pre className="text-sm text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap break-all">{result.expectedOutput || '—'}</pre>
                        </div>
                        <div className="bg-white/60 dark:bg-secondary-900/60 rounded-md p-2">
                          <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 block mb-0.5">Got</span>
                          <pre className={`text-sm whitespace-pre-wrap break-all ${result.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{result.actualOutput || '(no output)'}</pre>
                        </div>
                      </div>
                      {result.error && (
                        <div className="mt-2 p-2 rounded-md text-sm text-red-700 dark:text-red-300 font-mono bg-red-100 dark:bg-red-900/30 break-all">
                          ⚠ {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isRunning && !executionError && !testResults && (
                <div className="text-sm text-secondary-500 dark:text-secondary-400 py-6 text-center">
                  Click <strong>&quot;Run Code&quot;</strong> to execute all test cases and see results here.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default CodeEditor;
