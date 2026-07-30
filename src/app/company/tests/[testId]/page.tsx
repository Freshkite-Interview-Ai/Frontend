'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, Input, LoadingSpinner } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { companyTestService } from '@/services/companyTestService';
import {
  RecruitmentTest,
  TestAnalytics,
  TestQuestionFull,
  TestSubmission,
} from '@/types';

type FilterState = {
  passMark: string;
  minScore: string;
  passStatus: 'all' | 'pass' | 'fail';
  topN: string;
  completionStatus: 'all' | 'completed' | 'incomplete';
  minTimeMinutes: string;
  maxTimeMinutes: string;
};

type AppliedFilters = {
  passMark?: number;
  minScore?: number;
  passStatus?: 'pass' | 'fail';
  topN?: number;
  completionStatus?: 'completed' | 'incomplete';
  minTimeMinutes?: number;
  maxTimeMinutes?: number;
};

const DEFAULT_LIMIT = 20;

function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatPercent(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '--';
  }
  return `${Math.round(value)}%`;
}

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) {
    return '--';
  }
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function TestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.testId as string;

  const [test, setTest] = useState<RecruitmentTest & { questions?: TestQuestionFull[] } | null>(null);
  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null);
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    passMark: '',
    minScore: '',
    passStatus: 'all',
    topN: '',
    completionStatus: 'all',
    minTimeMinutes: '',
    maxTimeMinutes: '',
  });
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({});

  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageTargets, setMessageTargets] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageResult, setMessageResult] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const totalMarks = useMemo(() => {
    return test?.questions?.reduce((sum, q) => sum + q.marks, 0) || 0;
  }, [test]);

  const fetchTestDetails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await companyTestService.getTestDetails(testId);
      const { test: testData, questions } = res.data;
      setTest({ ...testData, questions });

      if (!filters.passMark) {
        const initialPassMark = testData.passMark ?? 60;
        setFilters((prev) => ({ ...prev, passMark: String(initialPassMark) }));
        setAppliedFilters((prev) => ({ ...prev, passMark: initialPassMark }));
      }
    } catch {
      setError('Failed to load test details');
    } finally {
      setIsLoading(false);
    }
  }, [testId, filters.passMark]);

  const fetchAnalytics = useCallback(async () => {
    if (!testId) return;
    setIsAnalyticsLoading(true);
    try {
      const passMark = appliedFilters.passMark ?? test?.passMark;
      const res = await companyTestService.getTestAnalytics(testId, passMark);
      setAnalytics(res.data);
    } catch {
      setAnalytics(null);
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, [testId, appliedFilters.passMark, test?.passMark]);

  const fetchSubmissions = useCallback(async () => {
    if (!testId) return;
    setIsSubmissionsLoading(true);
    setSubmissionError('');
    try {
      const res = await companyTestService.getTestSubmissions(testId, {
        page,
        limit,
        minScore: appliedFilters.minScore,
        passStatus: appliedFilters.passStatus,
        topN: appliedFilters.topN,
        completionStatus: appliedFilters.completionStatus,
        minTimeMinutes: appliedFilters.minTimeMinutes,
        maxTimeMinutes: appliedFilters.maxTimeMinutes,
        passMark: appliedFilters.passMark,
      });
      setSubmissions(res.data);
      setTotal(res.pagination.total);
    } catch {
      setSubmissionError('Failed to load candidates');
    } finally {
      setIsSubmissionsLoading(false);
    }
  }, [testId, page, limit, appliedFilters]);

  useEffect(() => {
    fetchTestDetails();
  }, [fetchTestDetails]);

  useEffect(() => {
    if (!test) return;
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, test]);

  useEffect(() => {
    if (!test) return;
    fetchSubmissions();
  }, [fetchSubmissions, test]);

  useEffect(() => {
    setSelectedCandidateIds(new Set());
  }, [submissions]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePublish = async () => {
    try {
      await companyTestService.publishTest(testId);
      fetchTestDetails();
    } catch {
      setError('Failed to publish test');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this draft test? This cannot be undone.')) return;
    try {
      await companyTestService.deleteTest(testId);
      router.push('/company/tests');
    } catch {
      setError('Failed to delete test');
    }
  };

  const applyFilters = () => {
    const parsed: AppliedFilters = {
      passMark: parseOptionalNumber(filters.passMark),
      minScore: parseOptionalNumber(filters.minScore),
      passStatus: filters.passStatus === 'all' ? undefined : filters.passStatus,
      topN: parseOptionalNumber(filters.topN),
      completionStatus: filters.completionStatus === 'all' ? undefined : filters.completionStatus,
      minTimeMinutes: parseOptionalNumber(filters.minTimeMinutes),
      maxTimeMinutes: parseOptionalNumber(filters.maxTimeMinutes),
    };

    setAppliedFilters(parsed);
    setPage(1);
  };

  const resetFilters = () => {
    const passMarkValue = String(test?.passMark ?? 60);
    setFilters({
      passMark: passMarkValue,
      minScore: '',
      passStatus: 'all',
      topN: '',
      completionStatus: 'all',
      minTimeMinutes: '',
      maxTimeMinutes: '',
    });
    setAppliedFilters({ passMark: parseOptionalNumber(passMarkValue) });
    setPage(1);
  };

  const allSelected = submissions.length > 0 && submissions.every((item) => selectedCandidateIds.has(item.candidateId));

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const next = new Set(submissions.map((item) => item.candidateId));
      setSelectedCandidateIds(next);
    } else {
      setSelectedCandidateIds(new Set());
    }
  };

  const toggleSelection = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  };

  const openMessageModal = (candidateIds: string[]) => {
    setMessageTargets(candidateIds);
    setMessageText('');
    setMessageError('');
    setMessageResult('');
    setIsMessageModalOpen(true);
  };

  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed) {
      setMessageError('Message is required.');
      return;
    }
    if (messageTargets.length === 0) {
      setMessageError('Select at least one candidate.');
      return;
    }

    setIsSendingMessage(true);
    setMessageError('');
    setMessageResult('');

    try {
      const res = await companyTestService.sendTestMessage(testId, {
        candidateIds: messageTargets,
        message: trimmed,
      });
      setMessageResult(`Queued ${res.data.queued} of ${res.data.requested} messages.`);
      setSelectedCandidateIds(new Set());
    } catch {
      setMessageError('Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>Back</Button>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">
          {error || 'Test not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Recruitment Test Dashboard" description="Real-time analytics, ranking, and candidate outreach" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/company/tests')}>Back</Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">{test.title}</h1>
              <Badge variant={test.status === 'published' ? 'success' : 'warning'}>{test.status}</Badge>
            </div>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">{test.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {test.status === 'draft' && (
            <>
              <Button onClick={handlePublish}>Publish</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Duration', value: `${test.duration} min` },
          { label: 'Questions', value: test.questionCount },
          { label: 'Total Marks', value: totalMarks || '--' },
          { label: 'Pass Mark', value: `${test.passMark ?? 60}%` },
          { label: 'Start Time', value: formatDate(test.startTime) },
          { label: 'End Time', value: formatDate(test.endTime) },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg font-bold text-secondary-900 dark:text-white mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">Live Analytics</h3>
          {isAnalyticsLoading && !analytics ? (
            <div className="flex justify-center py-6"><LoadingSpinner /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {[
                { label: 'Total Candidates', value: analytics?.totalCandidates ?? 0 },
                { label: 'Total Submissions', value: analytics?.totalSubmissions ?? 0 },
                { label: 'Average Score', value: formatPercent(analytics?.averageScore) },
                { label: 'Highest Score', value: formatPercent(analytics?.highestScore) },
                { label: 'Lowest Score', value: formatPercent(analytics?.lowestScore) },
                { label: 'Pass Rate', value: formatPercent(analytics?.passRate) },
                { label: 'Completion Rate', value: formatPercent(analytics?.completionRate) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-secondary-200/70 dark:border-secondary-700 p-3">
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-lg font-semibold text-secondary-900 dark:text-white mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-4">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400">Pass Mark (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={filters.passMark}
                  onChange={(e) => setFilters((prev) => ({ ...prev, passMark: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400">Minimum Score (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={filters.minScore}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minScore: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400">Pass/Fail</label>
                <select
                  className="w-full mt-1 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-3 py-2 text-sm"
                  value={filters.passStatus}
                  onChange={(e) => setFilters((prev) => ({ ...prev, passStatus: e.target.value as FilterState['passStatus'] }))}
                >
                  <option value="all">All</option>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400">Top N Candidates</label>
                <Input
                  type="number"
                  min={1}
                  value={filters.topN}
                  onChange={(e) => setFilters((prev) => ({ ...prev, topN: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-secondary-500 dark:text-secondary-400">Completion Status</label>
                <select
                  className="w-full mt-1 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-3 py-2 text-sm"
                  value={filters.completionStatus}
                  onChange={(e) => setFilters((prev) => ({ ...prev, completionStatus: e.target.value as FilterState['completionStatus'] }))}
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-secondary-500 dark:text-secondary-400">Min Time (min)</label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.minTimeMinutes}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minTimeMinutes: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary-500 dark:text-secondary-400">Max Time (min)</label>
                  <Input
                    type="number"
                    min={0}
                    value={filters.maxTimeMinutes}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxTimeMinutes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={applyFilters}>Apply</Button>
                <Button size="sm" variant="ghost" onClick={resetFilters}>Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">Submissions</h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">Ranked by score, then fastest time</p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={selectedCandidateIds.size === 0}
                onClick={() => openMessageModal(Array.from(selectedCandidateIds))}
              >
                Send Message ({selectedCandidateIds.size})
              </Button>
            </div>

            {isSubmissionsLoading ? (
              <div className="flex justify-center py-10"><LoadingSpinner /></div>
            ) : submissionError ? (
              <div className="text-sm text-red-600 dark:text-red-300 py-6 text-center">{submissionError}</div>
            ) : submissions.length === 0 ? (
              <p className="text-sm text-secondary-400 py-6 text-center">No candidates found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-secondary-500 dark:text-secondary-400 uppercase tracking-wide border-b border-secondary-100 dark:border-secondary-700">
                      <th className="pb-2 pr-4">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="pb-2 pr-4">Candidate</th>
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2 pr-4">Score (%)</th>
                      <th className="pb-2 pr-4">Rank</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Time Taken</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                        <td className="py-2.5 pr-4">
                          <input
                            type="checkbox"
                            checked={selectedCandidateIds.has(submission.candidateId)}
                            onChange={() => toggleSelection(submission.candidateId)}
                          />
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className="font-medium text-secondary-900 dark:text-white">
                            {submission.candidateName || submission.candidateId}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 text-secondary-600 dark:text-secondary-300">
                          {submission.candidateEmail || '--'}
                        </td>
                        <td className="py-2.5 pr-4 font-mono">
                          {formatPercent(submission.scorePercent)}
                        </td>
                        <td className="py-2.5 pr-4 font-mono">#{submission.rank}</td>
                        <td className="py-2.5 pr-4">
                          {submission.status === 'in_progress' ? (
                            <Badge variant="warning">In Progress</Badge>
                          ) : submission.pass ? (
                            <Badge variant="success">Pass</Badge>
                          ) : (
                            <Badge variant="danger">Fail</Badge>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-secondary-600 dark:text-secondary-300">
                          {formatDuration(submission.timeTakenMs)}
                        </td>
                        <td className="py-2.5">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/company/tests/${testId}/attempts/${submission.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openMessageModal([submission.candidateId])}
                            >
                              Send Message
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                Showing {total === 0 ? 0 : (page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-2 py-1 text-xs"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>{size} / page</option>
                  ))}
                </select>
                <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                  Prev
                </Button>
                <span className="text-xs text-secondary-500 dark:text-secondary-400">Page {page} of {totalPages}</span>
                <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">Eligibility Criteria</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Skills: </span>
                <span className="text-secondary-900 dark:text-white">{test.eligibility?.skills.join(', ') || 'None'}</span>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Degrees: </span>
                <span className="text-secondary-900 dark:text-white">{test.eligibility?.degrees.join(', ') || 'Any'}</span>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Tags: </span>
                <span className="text-secondary-900 dark:text-white">{test.eligibility?.tags.join(', ') || 'Any'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">Test Window</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Start: </span>
                <span className="text-secondary-900 dark:text-white">{formatDate(test.startTime)}</span>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">End: </span>
                <span className="text-secondary-900 dark:text-white">{formatDate(test.endTime)}</span>
              </div>
              <div>
                <span className="text-secondary-500 dark:text-secondary-400">Created: </span>
                <span className="text-secondary-900 dark:text-white">{formatDate(test.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {test.questions && test.questions.length > 0 && (
        <Card>
          <CardContent>
            <h3 className="text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
              Questions ({test.questions.length})
            </h3>
            <div className="space-y-3">
              {test.questions.map((q, i) => (
                <div key={q.id} className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-mono text-secondary-400 mt-0.5 w-6">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={q.type === 'MCQ' ? 'info' : q.type === 'SHORT' ? 'warning' : 'primary'}>
                          {q.type}
                        </Badge>
                        <Badge variant="default">{q.difficulty}</Badge>
                        <span className="text-xs text-secondary-400">{q.marks} marks</span>
                      </div>
                      <p className="text-sm text-secondary-800 dark:text-secondary-200">{q.questionText}</p>
                      {q.type === 'MCQ' && q.options && (
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          {q.options.map((opt, j) => (
                            <span key={j} className={`text-xs px-2 py-1 rounded ${
                              opt === q.correctAnswer
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 font-medium'
                                : 'bg-white dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                            }`}>
                              {String.fromCharCode(65 + j)}. {opt}
                            </span>
                          ))}
                        </div>
                      )}
                      {q.type === 'SHORT' && q.correctAnswer && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                          Expected: {q.correctAnswer}
                        </p>
                      )}
                      {q.type === 'CODE' && q.testCases && (
                        <div className="mt-2 text-xs text-secondary-500 dark:text-secondary-400">
                          {q.testCases.length} test cases - Languages: {q.languageSupport?.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">Send Message</h3>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Recipients: {messageTargets.length}</p>

            <div className="mt-4">
              <label className="text-xs text-secondary-500 dark:text-secondary-400">Message</label>
              <textarea
                className="w-full mt-1 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 px-3 py-2 text-sm min-h-[140px]"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>

            {messageError && (
              <p className="text-xs text-red-600 dark:text-red-300 mt-2">{messageError}</p>
            )}
            {messageResult && (
              <p className="text-xs text-green-600 dark:text-green-300 mt-2">{messageResult}</p>
            )}

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="ghost" onClick={() => setIsMessageModalOpen(false)}>Close</Button>
              <Button onClick={handleSendMessage} isLoading={isSendingMessage}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
