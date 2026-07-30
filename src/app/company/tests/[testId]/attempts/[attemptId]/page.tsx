'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, CardContent, Badge, LoadingSpinner } from '@/components/ui';
import { companyTestService } from '@/services/companyTestService';
import { TestAttempt, TestAnswer, TestQuestionFull } from '@/types';

interface AttemptDetail {
  attempt: TestAttempt & { candidateName?: string };
  answers: TestAnswer[];
  questions: TestQuestionFull[];
}

export default function AttemptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;
  const attemptId = params.attemptId as string;

  const [data, setData] = useState<AttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await companyTestService.getAttemptDetail(attemptId);
      setData(res.data);
    } catch {
      setError('Failed to load attempt details');
    } finally {
      setIsLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>← Back</Button>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
          {error || 'Attempt not found'}
        </div>
      </div>
    );
  }

  const { attempt, answers, questions } = data;

  const getQuestionById = (questionId: string) => questions.find(q => q.id === questionId);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/company/tests/${testId}`)}>← Back</Button>
          <div>
            <h1 className="text-xl font-bold text-secondary-900 dark:text-white">
              Attempt by {attempt.candidateName || attempt.candidateId}
            </h1>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              Started {formatDate(attempt.startTime)}
              {attempt.submittedAt && ` • Submitted ${formatDate(attempt.submittedAt)}`}
            </p>
          </div>
        </div>
        <Badge variant={
          attempt.status === 'completed' ? 'success' :
          attempt.status === 'auto_submitted' ? 'info' :
          attempt.status === 'violation_terminated' ? 'danger' : 'warning'
        }>
          {attempt.status}
        </Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase">Score</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">
              {attempt.score !== undefined && attempt.score !== null ? attempt.score : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase">Answered</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1">
              {answers.filter(a => a.answer?.trim()).length}/{questions.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase">Violations</p>
            <p className={`text-2xl font-bold mt-1 ${attempt.violations > 2 ? 'text-red-600' : 'text-secondary-900 dark:text-white'}`}>
              {attempt.violations}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase">Status</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white mt-1 capitalize">
              {attempt.status.replace('_', ' ')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Answers */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
          Answer Review ({answers.length} answers)
        </h3>
        {questions.map((q, i) => {
          const answer = answers.find(a => a.questionId === q.id);
          return (
            <Card key={q.id}>
              <CardContent>
                <div className="space-y-3">
                  {/* Question header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-secondary-400">#{i + 1}</span>
                      <Badge variant={q.type === 'MCQ' ? 'info' : q.type === 'SHORT' ? 'warning' : 'primary'}>
                        {q.type}
                      </Badge>
                      <Badge variant="default">{q.difficulty}</Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-secondary-900 dark:text-white">
                        {answer?.score ?? '—'} / {q.marks}
                      </span>
                    </div>
                  </div>

                  {/* Question text */}
                  <p className="text-sm text-secondary-800 dark:text-secondary-200">{q.questionText}</p>

                  {/* MCQ options */}
                  {q.type === 'MCQ' && q.options && (
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, j) => {
                        const isCorrect = opt === q.correctAnswer;
                        const isSelected = answer?.answer === opt;
                        return (
                          <div key={j} className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                            isCorrect
                              ? 'border-green-300 bg-green-50 dark:bg-green-900/30 dark:border-green-700 text-green-700 dark:text-green-300'
                              : isSelected && !isCorrect
                              ? 'border-red-300 bg-red-50 dark:bg-red-900/30 dark:border-red-700 text-red-700 dark:text-red-300'
                              : 'border-secondary-200 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400'
                          }`}>
                            {isCorrect && '✓ '}{isSelected && !isCorrect && '✕ '}
                            {String.fromCharCode(65 + j)}. {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Answer display */}
                  <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-3">
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">Candidate&apos;s Answer:</p>
                    {answer?.answer ? (
                      <pre className="text-sm text-secondary-800 dark:text-secondary-200 whitespace-pre-wrap font-mono">
                        {answer.answer}
                      </pre>
                    ) : (
                      <p className="text-sm text-secondary-400 italic">Not answered</p>
                    )}
                  </div>

                  {/* Expected answer for short answer */}
                  {q.type === 'SHORT' && q.correctAnswer && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-xs text-green-600 dark:text-green-400 mb-1">Expected Answer:</p>
                      <p className="text-sm text-green-800 dark:text-green-200">{q.correctAnswer}</p>
                    </div>
                  )}

                  {/* Code execution results */}
                  {q.type === 'CODE' && answer?.codeResults && (
                    <div className="space-y-2">
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        Language: {answer.language || 'N/A'} • Test Results:
                      </p>
                      <div className="grid gap-1.5">
                        {answer.codeResults.map((result, j) => (
                          <div key={j} className={`text-xs px-2.5 py-1.5 rounded-lg ${
                            result.passed
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            <span className="font-medium">{result.passed ? '✓' : '✕'} Test {j + 1}:</span>
                            <span className="ml-2">Input: {result.input}</span>
                            <span className="ml-2">Expected: {result.expectedOutput}</span>
                            <span className="ml-2">Got: {result.actualOutput || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
