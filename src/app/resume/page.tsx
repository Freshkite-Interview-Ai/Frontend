'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingSpinner, Badge } from '@/components/ui';
import { FileUpload, ResumeImprovements } from '@/components/features';
import { useAppStore } from '@/store';
import { resumeService, paymentService } from '@/services';
import { useTokenGuard } from '@/hooks';

const POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 24; // 2 minutes max

export default function ResumePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resume, setResume, resumeLoading, setResumeLoading, resumeImprovements, setResumeImprovements, resumeImprovementsLoading, setResumeImprovementsLoading } = useAppStore();
  const { isChecking: isPlanChecking } = useTokenGuard();
  
  const isAuthenticated = status === 'authenticated';
  const authLoading = status === 'loading';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [resumeAnalysisCost, setResumeAnalysisCost] = useState(0);
  const [improvementsGenerating, setImprovementsGenerating] = useState(false);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  const pollForImprovements = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollCountRef.current = 0;
    setImprovementsGenerating(true);

    const poll = async () => {
      pollCountRef.current++;
      try {
        const response = await resumeService.getImprovements();
        if (response.data && response.data.improvements && response.data.improvements.length > 0) {
          setResumeImprovements(response.data);
          setImprovementsGenerating(false);
          return;
        }
      } catch {
        // continue polling
      }

      if (pollCountRef.current < MAX_POLL_ATTEMPTS) {
        pollRef.current = setTimeout(poll, POLL_INTERVAL);
      } else {
        setImprovementsGenerating(false);
      }
    };

    // Start first poll after a short delay to let backend begin processing
    pollRef.current = setTimeout(poll, 3000);
  }, [setResumeImprovements]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load token info
  useEffect(() => {
    const loadTokenInfo = async () => {
      try {
        const [balanceRes, configRes] = await Promise.all([
          paymentService.getTokenBalance(),
          paymentService.getTokenConfig(),
        ]);
        setTokenBalance(balanceRes.data?.tokenBalance ?? 0);
        setResumeAnalysisCost(configRes.data?.resumeAnalysis ?? 0);
      } catch {
        // Silently fail
      }
    };
    loadTokenInfo();
  }, []);

  // Load existing resume from backend
  useEffect(() => {
    const loadResume = async () => {
      if (!isAuthenticated) return;
      
      try {
        setResumeLoading(true);
        const response = await resumeService.getMyResume();
        if (response.data) {
          setResume(response.data);
        }
      } catch (error) {
        console.error('Failed to load resume:', error);
      } finally {
        setResumeLoading(false);
      }
    };

    loadResume();
  }, [isAuthenticated, setResume, setResumeLoading]);

  // Load resume improvements
  useEffect(() => {
    const loadImprovements = async () => {
      if (!isAuthenticated) return;
      try {
        setResumeImprovementsLoading(true);
        const response = await resumeService.getImprovements();
        if (response.data) {
          setResumeImprovements(response.data);
        }
      } catch {
        // Silently fail
      } finally {
        setResumeImprovementsLoading(false);
      }
    };
    loadImprovements();
  }, [isAuthenticated, setResumeImprovements, setResumeImprovementsLoading]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const response = await resumeService.uploadResume(selectedFile);
      setResume(response.data);
      setUploadStatus('success');
      // Clear any existing improvements and start polling for new ones
      setResumeImprovements(null);
      pollForImprovements();
    } catch (error: any) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      setErrorMessage(error?.response?.data?.message || 'Failed to upload resume. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!resume) return;

    try {
      setResumeLoading(true);
      await resumeService.deleteResume(resume.id);
      setResume(null);
      setSelectedFile(null);
      setUploadStatus('idle');
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setResumeLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (authLoading || isPlanChecking) {
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

  return (
    <DashboardLayout>
      <PageHeader
        title="Resume"
        description="Upload your resume to get personalized interview questions."
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          {resume ? (
            <Card>
              <CardContent>
                <div className="flex items-start gap-6">
                  {/* PDF Icon */}
                  <div className="w-16 h-20 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-10 h-10 text-red-500 dark:text-red-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.9,12.35 10.92,12.31M11.57,13.15C11.17,14.45 10.37,15.84 10.37,15.84C11.22,15.5 13.08,15.11 13.08,15.11C11.94,14.11 11.59,13.16 11.57,13.15M14.71,15.32C14.71,15.32 16.46,15.97 16.5,15.71C16.57,15.44 15.17,15.2 14.71,15.32M9.05,16.81C8.28,17.11 7.54,18.39 7.72,18.39C7.9,18.4 8.63,17.79 9.05,16.81M11.57,11.26C11.57,11.21 12,9.58 11.57,9.53C11.27,9.5 11.56,11.22 11.57,11.26Z" />
                    </svg>
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-white">{resume.fileName}</h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                          {formatFileSize(resume.fileSize)} • Uploaded{' '}
                          {new Date(resume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="success">Uploaded</Badge>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resume.fileUrl, '_blank')}
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={resumeLoading}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  accept=".pdf"
                  maxSize={10 * 1024 * 1024}
                  disabled={uploadStatus === 'uploading'}
                  currentFile={selectedFile ? { name: selectedFile.name, size: selectedFile.size } : null}
                />

                {selectedFile && uploadStatus !== 'success' && (
                  <div className="mt-6 space-y-3">
                    {/* Token cost info */}
                    {resumeAnalysisCost > 0 && (
                      <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
                        tokenBalance >= resumeAnalysisCost
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                      }`}>
                        <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a5.389 5.389 0 01-.421-.821H10a1 1 0 100-2H8.014a7.36 7.36 0 010-1H10a1 1 0 100-2H8.315c.128-.29.27-.564.421-.821z" />
                        </svg>
                        <span className={`font-medium ${
                          tokenBalance >= resumeAnalysisCost
                            ? 'text-primary-700 dark:text-primary-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}>
                          Resume analysis costs {resumeAnalysisCost} tokens
                          {tokenBalance < resumeAnalysisCost
                            ? ` — you have ${tokenBalance} (need ${resumeAnalysisCost - tokenBalance} more)`
                            : ` — you have ${tokenBalance}`
                          }
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-red-500 dark:text-red-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleUpload}
                      isLoading={uploadStatus === 'uploading'}
                      disabled={uploadStatus === 'uploading' || (resumeAnalysisCost > 0 && tokenBalance < resumeAnalysisCost)}
                    >
                      Upload Resume
                    </Button>
                  </div>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-400 text-sm">
                    {errorMessage}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resume Improvements Section */}
          {resume && !resumeImprovementsLoading && !improvementsGenerating && resumeImprovements?.improvements && resumeImprovements.improvements.length > 0 && (
            <div className="mt-8">
              <ResumeImprovements improvements={resumeImprovements.improvements} />
            </div>
          )}
          {resume && (resumeImprovementsLoading || improvementsGenerating) && (
            <div className="mt-8">
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                      </div>
                      <LoadingSpinner size="sm" className="absolute -bottom-1 -right-1" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-secondary-900 dark:text-white">
                        AI is analyzing your resume
                      </h4>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 max-w-sm">
                        Our AI is reviewing your resume for ATS optimization, keyword gaps, and impact improvements. This usually takes 15-30 seconds.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-secondary-400 dark:text-secondary-500">
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                      <span>Processing...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Benefits Card */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary-900 dark:text-white">Benefits of Uploading</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 dark:text-white">AI Resume Review</h4>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                      Get AI-powered suggestions to improve ATS compatibility, keywords, and impact statements.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 dark:text-white">Personalized Questions</h4>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                      Interview questions tailored to your specific experience, skills, and seniority level.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 dark:text-white">Skill Gap Analysis</h4>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                      Identify weak areas and get focused practice recommendations based on your background.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 dark:text-white">Better Interview Prep</h4>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
                      Practice answering questions that interviewers are likely to ask based on your resume.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How it Works Card */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">How It Works</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary-600 dark:text-secondary-300">1</span>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Upload your resume (PDF, up to 10MB)</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary-600 dark:text-secondary-300">2</span>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">AI extracts your skills, experience, and role</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary-600 dark:text-secondary-300">3</span>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Get actionable improvement suggestions</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-secondary-600 dark:text-secondary-300">4</span>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">Start practicing with personalized interview questions</p>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700">
            <svg className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              Your resume is encrypted and stored securely. It is never shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
