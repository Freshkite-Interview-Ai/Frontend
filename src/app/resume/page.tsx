'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingSpinner, Badge } from '@/components/ui';
import { FileUpload } from '@/components/features';
import { useAppStore } from '@/store';
import { resumeService } from '@/services';

export default function ResumePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resume, setResume, resumeLoading, setResumeLoading } = useAppStore();
  
  const isAuthenticated = status === 'authenticated';
  const authLoading = status === 'loading';

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

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

  if (authLoading) {
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
                  <div className="mt-6 flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-700/50 rounded-xl">
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
                      disabled={uploadStatus === 'uploading'}
                    >
                      Upload Resume
                    </Button>
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
        </div>

        {/* Info Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent>
              <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Why Upload Your Resume?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-primary-600 dark:text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-white">Personalized Questions</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                      Get interview questions tailored to your experience and skills.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-white">Skill Gap Analysis</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                      Identify areas where you need more practice.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-white">Secure & Private</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                      Your resume is encrypted and never shared.
                    </p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-secondary-100 dark:border-secondary-700">
                <h4 className="font-medium text-secondary-900 dark:text-white mb-2">Supported Formats</h4>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  PDF files up to 10MB. We recommend using a clean, ATS-friendly resume format.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
