'use client';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingSpinner, Badge } from '@/components/ui';
import { AudioRecorder, AudioReportCard } from '@/components/features';
import { useTokenGuard } from '@/hooks';
import { audioService, conceptService } from '@/services';
import { Concept, AudioReport } from '@/types';

export default function RecordPage() {
  const router = useRouter();
  const params = useParams();
  const conceptId = params.conceptId as string;

  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const authLoading = status === 'loading';
  const { isChecking: isPlanChecking } = useTokenGuard();
  
  const [concept, setConcept] = useState<Concept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzeStatus, setAnalyzeStatus] = useState<'idle' | 'analyzing' | 'success' | 'error'>('idle');
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [report, setReport] = useState<AudioReport | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load concept from backend
  useEffect(() => {
    const loadConcept = async () => {
      if (!isAuthenticated || !conceptId) return;
      
      setIsLoading(true);
      try {
        const response = await conceptService.getConcept(conceptId);
        setConcept(response.data || null);
      } catch (error) {
        console.error('Failed to load concept:', error);
        setConcept(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadConcept();
  }, [isAuthenticated, conceptId]);

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedBlob(blob);
    setRecordedDuration(duration);
  };

  // Single-step: send audio → get AI report back
  const handleGetReport = async () => {
    if (!recordedBlob || !conceptId) return;

    setAnalyzeStatus('analyzing');
    setAnalyzeError(null);
    try {
      const response = await audioService.analyzeRecording(conceptId, recordedBlob, recordedDuration);
      setReport(response.data);
      setAnalyzeStatus('success');
    } catch (error: any) {
      console.error('Analysis failed:', error);
      const status = error?.response?.status || error?.status;
      if (status === 402 || error?.message?.includes('402')) {
        setAnalyzeError('Insufficient tokens. Please purchase more tokens to get AI feedback.');
      } else {
        setAnalyzeError('Failed to analyze recording. Please try again.');
      }
      setAnalyzeStatus('error');
    }
  };

  const handleRecordAnother = () => {
    setAnalyzeStatus('idle');
    setAnalyzeError(null);
    setRecordedBlob(null);
    setRecordedDuration(0);
    setReport(null);
  };

  const difficultyColors = {
    BEGINNER: 'success',
    INTERMEDIATE: 'warning',
    ADVANCED: 'danger',
  } as const;

  const difficultyLabels = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
  } as const;

  if (authLoading || isPlanChecking || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!concept) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-secondary-300 dark:text-secondary-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Concept not found</h3>
              <p className="text-secondary-600 dark:text-secondary-400 mb-4">
                The concept you&apos;re looking for doesn&apos;t exist.
              </p>
              <Link href="/concepts">
                <Button>Back to Concepts</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/concepts" className="text-primary-600 dark:text-primary-400 hover:underline">
              Concepts
            </Link>
          </li>
          <li className="text-secondary-400 dark:text-secondary-500">/</li>
          <li className="text-secondary-600 dark:text-secondary-400">{concept.title}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Concept Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={difficultyColors[concept.difficulty]}>
                  {difficultyLabels[concept.difficulty]}
                </Badge>
                <Badge variant="default">{concept.group}</Badge>
              </div>

              <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">
                {concept.title}
              </h1>

              <p className="text-secondary-600 dark:text-secondary-400 mb-6">{concept.description}</p>

              {/* Tips */}
              <div className="mt-6 pt-6 border-t border-secondary-100 dark:border-secondary-700">
                <h3 className="font-medium text-secondary-900 dark:text-white mb-3">Recording Tips</h3>
                <ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Speak clearly and at a steady pace
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Provide examples when possible
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Aim for 1-3 minutes per concept
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recording Area */}
        <div className="lg:col-span-2">
          {analyzeStatus === 'success' && report ? (
            <>
              <AudioReportCard report={report} className="mb-6" />
              <div className="flex justify-center gap-4">
                <Link href="/concepts">
                  <Button variant="outline">Back to Concepts</Button>
                </Link>
                <Button onClick={handleRecordAnother}>
                  Record Another
                </Button>
              </div>
            </>
          ) : (
            <>
              <AudioRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={300}
                disabled={analyzeStatus === 'analyzing'}
              />

              {recordedBlob && (
                <div className="mt-6">
                  <Card>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-secondary-900 dark:text-white">Ready to Analyze</h3>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400">
                            Duration: {Math.floor(recordedDuration / 60)}:
                            {(recordedDuration % 60).toString().padStart(2, '0')}
                          </p>
                        </div>
                        <Button
                          onClick={handleGetReport}
                          isLoading={analyzeStatus === 'analyzing'}
                          disabled={analyzeStatus === 'analyzing'}
                        >
                          {analyzeStatus === 'analyzing' ? 'Analyzing...' : '🤖 Get AI Report'}
                        </Button>
                      </div>

                      {analyzeStatus === 'error' && analyzeError && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
                          {analyzeError}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
