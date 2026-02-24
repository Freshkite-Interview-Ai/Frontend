'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge, Button, Card, CardContent, LoadingSpinner } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { companyAuthService, companyCandidatesService } from '@/services';
import { CompanyCandidateDetails } from '@/types';

type DetailSection = 'overview' | 'reports' | 'problems';

export default function CandidateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const [details, setDetails] = useState<CompanyCandidateDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<DetailSection>('overview');

  useEffect(() => {
    if (!companyAuthService.isAuthenticated()) {
      router.replace('/login?mode=company');
      return;
    }

    if (!candidateId) {
      setError('Candidate not found.');
      setIsLoading(false);
      return;
    }

    let isActive = true;
    setIsLoading(true);
    setError('');

    companyCandidatesService
      .getCandidateDetails(candidateId)
      .then((response) => {
        if (!isActive) return;
        if (!response.data) {
          setError('Candidate details are unavailable.');
          setDetails(null);
          return;
        }
        setDetails(response.data);
      })
      .catch(() => {
        if (!isActive) return;
        setError('Unable to load candidate details.');
        setDetails(null);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [candidateId, router]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Profile"
        description="Review performance signals, interview history, and problem-solving patterns."
        titleClassName="font-brand"
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/company/dashboard')}>
              Back to dashboard
            </Button>
          </div>
        }
      />

      {isLoading && (
        <Card>
          <CardContent className="flex items-center gap-3 text-secondary-500 dark:text-secondary-400">
            <LoadingSpinner size="sm" />
            <span>Loading candidate profile...</span>
          </CardContent>
        </Card>
      )}

      {!isLoading && error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
          <CardContent>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && details && (
        <>
          <Card className="border-primary-100 dark:border-primary-900/40">
            <CardContent>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-secondary-900 dark:text-white">
                    {details.name}
                  </h2>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    {details.role || 'Role not specified'}
                  </p>
                  {details.profileSummary && (
                    <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-300">
                      {details.profileSummary}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {details.contact.email && <Badge variant="info">{details.contact.email}</Badge>}
                  {details.contact.location && <Badge variant="primary">{details.contact.location}</Badge>}
                </div>
              </div>

              {details.skills.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase text-secondary-400 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {details.skills.map((skill) => (
                      <Badge key={skill} variant="primary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {(['overview', 'reports', 'problems'] as DetailSection[]).map((section) => (
              <Button
                key={section}
                variant={activeSection === section ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(section)}
              >
                {section === 'overview' && 'Overview'}
                {section === 'reports' && 'Interview & Audio'}
                {section === 'problems' && 'Problem Solving'}
              </Button>
            ))}
          </div>

          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent>
                  <p className="text-xs uppercase text-secondary-400">Experience</p>
                  <p className="mt-2 text-2xl font-semibold text-secondary-900 dark:text-white">
                    {typeof details.experience === 'number' ? `${details.experience} yrs` : 'N/A'}
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Education: {details.education.join(', ') || 'Not listed'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-xs uppercase text-secondary-400">Overall rating</p>
                  {details.visibility.showAchievements && details.analytics ? (
                    <>
                      <p className="mt-2 text-2xl font-semibold text-secondary-900 dark:text-white">
                        {details.analytics.averageRating ?? 'N/A'}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        Current streak: {details.analytics.currentStreak}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                      Candidate has hidden achievements.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <p className="text-xs uppercase text-secondary-400">Interview count</p>
                  {details.visibility.showAchievements && details.analytics ? (
                    <>
                      <p className="mt-2 text-2xl font-semibold text-secondary-900 dark:text-white">
                        {details.analytics.interviewsCompleted}
                      </p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        Longest streak: {details.analytics.longestStreak}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                      Candidate has hidden achievements.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardContent>
                  <p className="text-xs uppercase text-secondary-400 mb-2">Interview summaries</p>
                  {details.visibility.showActivity ? (
                    details.interviews && details.interviews.length > 0 ? (
                      <div className="space-y-3">
                        {details.interviews.map((interview) => (
                          <div
                            key={interview.id}
                            className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                                {interview.role || 'Interview'}
                              </p>
                              <Badge variant="info">{interview.overallScore ?? 'N/A'}</Badge>
                            </div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                              {interview.completedAt
                                ? new Date(interview.completedAt).toLocaleDateString()
                                : 'Completed date unavailable'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        No interview summaries available.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Candidate has hidden activity.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <p className="text-xs uppercase text-secondary-400 mb-2">Audio reports</p>
                  {details.visibility.showActivity ? (
                    details.audioReports && details.audioReports.length > 0 ? (
                      <div className="space-y-3">
                        {details.audioReports.map((report) => (
                          <div
                            key={report.id}
                            className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                                {report.concept?.title || 'Concept'}
                              </p>
                              <Badge variant="primary">{report.overallRating}</Badge>
                            </div>
                            <p className="text-xs text-secondary-500 dark:text-secondary-400">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        No audio reports available.
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Candidate has hidden activity.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'problems' && (
            <Card>
              <CardContent>
                <p className="text-xs uppercase text-secondary-400 mb-3">Problem solving stats</p>
                {details.visibility.showAchievements && details.problemStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                      <p className="text-xs text-secondary-400">Passed</p>
                      <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                        {details.problemStats.pass}
                      </p>
                    </div>
                    <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                      <p className="text-xs text-secondary-400">Failed</p>
                      <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                        {details.problemStats.fail}
                      </p>
                    </div>
                    <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                      <p className="text-xs text-secondary-400">Completed</p>
                      <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                        {details.problemStats.completed}
                      </p>
                    </div>
                    <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                      <p className="text-xs text-secondary-400">Total</p>
                      <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                        {details.problemStats.total}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Candidate has hidden achievements.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
