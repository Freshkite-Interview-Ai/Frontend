'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, Input, Textarea, LoadingSpinner } from '@/components/ui';
import { useAuthStatus } from '@/hooks';
import { conceptService } from '@/services';
import { ConceptDifficulty } from '@/types';

const difficulties: ConceptDifficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

const difficultyLabels: Record<ConceptDifficulty, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const EXAMPLE_QUESTION =
  'Explain the four pillars of Object-Oriented Programming with practical examples.';

interface FormErrors {
  title?: string;
  description?: string;
}

export default function CreateConceptPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [group, setGroup] = useState('');
  const [difficulty, setDifficulty] = useState<ConceptDifficulty>('INTERMEDIATE');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (!title.trim()) {
      nextErrors.title = 'Concept name is required.';
    }
    if (!description.trim()) {
      nextErrors.description = 'Interview question is required.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return; // guard against duplicate submissions

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitError('');
    setIsSubmitting(true);
    try {
      await conceptService.createConcept({
        title: title.trim(),
        description: description.trim(),
        group: group.trim() || undefined,
        difficulty,
      });
      // Concepts page reads ?created=1 to refresh the list and show a success toast.
      router.push('/concepts?created=1');
    } catch (error) {
      console.error('Failed to create concept:', error);
      setSubmitError('Could not create the concept. Please try again.');
      setIsSubmitting(false);
    }
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
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/concepts"
                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Concepts
              </Link>
            </li>
            <li className="text-secondary-400 dark:text-secondary-600" aria-hidden="true">
              /
            </li>
            <li className="text-secondary-600 dark:text-secondary-400">New concept</li>
          </ol>
        </nav>

        <PageHeader
          title="Create Concept"
          description="Add your own interview topic and the question you want to practice answering."
        />

        <form onSubmit={handleSubmit} noValidate>
          <Card padding="lg" className="rounded-3xl">
            <CardContent>
              <div className="space-y-8">
                {/* Error banner */}
                {submitError && (
                  <div className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {submitError}
                  </div>
                )}

                {/* Concept name */}
                <div>
                  <Input
                    label="Concept Name"
                    placeholder="e.g. Java OOP"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    error={errors.title}
                    helperText="A short title you'll recognise in your concepts list."
                    maxLength={200}
                    autoFocus
                  />
                </div>

                {/* Interview question */}
                <div>
                  <Textarea
                    label="Interview Question"
                    placeholder={EXAMPLE_QUESTION}
                    value={description}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                    }}
                    error={errors.description}
                    helperText="Write a complete interview question. This question will be used by AI to evaluate the recorded answer."
                    rows={8}
                    maxLength={5000}
                  />

                  {/* Why this field matters */}
                  <div className="mt-4 rounded-2xl border border-primary-100 dark:border-primary-900/60 bg-primary-50/70 dark:bg-primary-900/20 p-4">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 flex-shrink-0 text-primary-600 dark:text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-secondary-900 dark:text-white">
                          Why this matters
                        </p>
                        <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
                          The AI evaluates your recorded answer by comparing it against this
                          question. The clearer and more complete the question, the more accurate
                          your feedback will be.
                        </p>
                        <p className="text-secondary-500 dark:text-secondary-400">
                          Example:{' '}
                          <span className="italic text-secondary-700 dark:text-secondary-200">
                            {EXAMPLE_QUESTION}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-secondary-100 dark:border-secondary-700">
                  <div className="pt-6">
                    <Input
                      label="Category"
                      placeholder="e.g. Programming Fundamentals"
                      value={group}
                      onChange={(event) => setGroup(event.target.value)}
                      helperText="Optional. Defaults to General."
                      maxLength={100}
                    />
                  </div>

                  <div className="pt-6">
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
                      Difficulty
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          aria-pressed={difficulty === level}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            difficulty === level
                              ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25'
                              : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
                          }`}
                        >
                          {difficultyLabels[level]}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                      Optional. Helps you filter your concepts later.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/concepts')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Concept'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
