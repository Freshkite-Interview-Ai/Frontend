'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input, LoadingSpinner, Badge } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { companyAuthService, companyCandidatesService } from '@/services';
import { CompanyCandidateDetails, CompanyCandidateSummary } from '@/types';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState('');
  const [role, setRole] = useState('');
  const [experienceMin, setExperienceMin] = useState<number | null>(null);
  const [experienceMax, setExperienceMax] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<CompanyCandidateSummary[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CompanyCandidateSummary | null>(null);
  const [candidateDetails, setCandidateDetails] = useState<CompanyCandidateDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');

  const company = companyAuthService.getCompany();

  const handleLogout = () => {
    companyAuthService.logout();
    router.replace('/login?mode=company');
  };

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await companyCandidatesService.searchCandidates({
        search: search.trim(),
        skills,
        education: education.trim(),
        role: role.trim(),
        minYears: experienceMin,
        maxYears: experienceMax,
        page: 1,
        limit: 25,
      });

      setCandidates(response.data || []);
    } catch (err) {
      setError('Unable to load candidates. Please adjust filters or try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, skills, education, role, experienceMin, experienceMax]);

  useEffect(() => {
    if (!companyAuthService.isAuthenticated()) {
      router.replace('/login?mode=company');
      return;
    }

    const debounceId = window.setTimeout(() => {
      fetchCandidates();
    }, 350);

    return () => window.clearTimeout(debounceId);
  }, [fetchCandidates, router]);

  useEffect(() => {
    if (!selectedCandidate) {
      setProfileMessage('Select a candidate to view their profile.');
    }
  }, [selectedCandidate]);

  useEffect(() => {
    if (!selectedCandidate?.id) {
      setCandidateDetails(null);
      return;
    }

    let isActive = true;
    setDetailsLoading(true);
    setDetailsError('');

    companyCandidatesService
      .getCandidateDetails(selectedCandidate.id)
      .then((response) => {
        if (!isActive) return;
        if (!response.data) {
          setCandidateDetails(null);
          setDetailsError('Candidate details are unavailable.');
          return;
        }
        setCandidateDetails(response.data);
      })
      .catch(() => {
        if (!isActive) return;
        setCandidateDetails(null);
        setDetailsError('Unable to load candidate details.');
      })
      .finally(() => {
        if (!isActive) return;
        setDetailsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [selectedCandidate?.id]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  };

  const handleSkillKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSkill();
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const totalResults = candidates.length;
  const averageExperience =
    totalResults > 0
      ? Math.round(
          candidates.reduce((sum, candidate) => sum + (candidate.experience ?? 0), 0) / totalResults
        )
      : 0;
  const topSkills = Array.from(
    candidates
      .flatMap((candidate) => candidate.skills || [])
      .reduce((map, skill) => map.set(skill, (map.get(skill) || 0) + 1), new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Dashboard"
        description="Curate high-signal candidate profiles and share shortlists with your team."
        titleClassName="font-brand"
        action={
          <div className="flex items-center gap-3">
            {company && (
              <div className="text-right">
                <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                  {company.companyName}
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400">Company account</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary-100 dark:border-primary-900/40 bg-gradient-to-br from-white via-white to-primary-50/70 dark:from-secondary-800 dark:via-secondary-800 dark:to-primary-900/30">
          <CardContent>
            <p className="text-xs uppercase text-secondary-400">Candidates in view</p>
            <p className="mt-2 text-2xl font-semibold text-secondary-900 dark:text-white">
              {totalResults}
            </p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              Updated with your latest filters
            </p>
          </CardContent>
        </Card>
        <Card className="border-secondary-200 dark:border-secondary-700 bg-gradient-to-br from-white via-white to-secondary-50/60 dark:from-secondary-800 dark:via-secondary-800 dark:to-secondary-900/40">
          <CardContent>
            <p className="text-xs uppercase text-secondary-400">Average experience</p>
            <p className="mt-2 text-2xl font-semibold text-secondary-900 dark:text-white">
              {averageExperience} yrs
            </p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              Based on listed experience
            </p>
          </CardContent>
        </Card>
        <Card className="border-secondary-200 dark:border-secondary-700 bg-gradient-to-br from-white via-white to-primary-50/40 dark:from-secondary-800 dark:via-secondary-800 dark:to-primary-900/20">
          <CardContent>
            <p className="text-xs uppercase text-secondary-400">Trending skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topSkills.length > 0 ? (
                topSkills.map((skill) => (
                  <Badge key={skill} variant="primary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-secondary-500 dark:text-secondary-400">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-2 border-secondary-200/70 dark:border-secondary-700/70 bg-gradient-to-br from-white via-white to-secondary-50/40 dark:from-secondary-800 dark:via-secondary-800 dark:to-secondary-900/40">
        <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              <div className="lg:col-span-4">
                <Input
                  label="Search candidates"
                  placeholder="Name, role, or keywords"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <div className="lg:col-span-4">
                <Input
                  label="Skills"
                  placeholder="Add a skill and press Enter"
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  onKeyDown={handleSkillKeyDown}
                />
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium hover:bg-primary-100"
                      >
                        {skill}
                        <span className="text-primary-500">&times;</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="Education"
                  placeholder="e.g. Bachelor's Degree"
                  value={education}
                  onChange={(event) => setEducation(event.target.value)}
                />
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="Role"
                  placeholder="e.g. Frontend Engineer"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
              <div className="md:col-span-2">
                <Input
                  label="Experience min (years)"
                  type="number"
                  min={0}
                  value={experienceMin ?? ''}
                  onChange={(event) =>
                    setExperienceMin(event.target.value ? Number(event.target.value) : null)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Experience max (years)"
                  type="number"
                  min={0}
                  value={experienceMax ?? ''}
                  onChange={(event) =>
                    setExperienceMax(event.target.value ? Number(event.target.value) : null)
                  }
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <Button variant="secondary" fullWidth onClick={fetchCandidates}>
                  Refresh results
                </Button>
              </div>
            </div>
          </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Candidate Results</h2>
            {isLoading && <LoadingSpinner size="sm" />}
          </div>

          {isLoading ? (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-secondary-500 dark:text-secondary-400">
                <LoadingSpinner size="sm" />
                <span>Searching candidates...</span>
              </div>
            </Card>
          ) : candidates.length === 0 ? (
            <Card className="p-6">
              <p className="text-secondary-600 dark:text-secondary-400">
                No candidates match your filters. Try widening your search.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate, index) => {
                const candidateName = candidate.name || 'Candidate';

                return (
                  <Card
                    key={candidate.id || `${candidateName}-${index}`}
                    hover
                    onClick={() => setSelectedCandidate(candidate)}
                    className={
                      selectedCandidate?.id === candidate.id
                        ? 'border-primary-400 dark:border-primary-500 ring-1 ring-primary-200/60 dark:ring-primary-900/40'
                        : 'border-secondary-200/70 dark:border-secondary-700/70'
                    }
                  >
                    <CardContent>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                            {candidateName}
                          </h3>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            {candidate.role || 'Role not specified'}
                          </p>
                        </div>
                        {typeof candidate.experience === 'number' && (
                          <Badge variant="info">{candidate.experience} yrs exp</Badge>
                        )}
                      </div>
                      {candidate.skills && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="primary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          {candidate.profileSummary || 'Profile summary coming soon.'}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/company/candidates/${candidate.id}`);
                          }}
                        >
                          View profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Profile Preview</h2>
          </div>

          <Card className="border-primary-100/80 dark:border-primary-900/30 bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-secondary-800 dark:via-secondary-800 dark:to-primary-900/20">
            <CardContent>
              {selectedCandidate ? (
                <div className="space-y-4">
                  {detailsLoading && (
                    <div className="flex items-center gap-2 text-secondary-500 dark:text-secondary-400">
                      <LoadingSpinner size="sm" />
                      <span>Loading candidate details...</span>
                    </div>
                  )}

                  {detailsError && (
                    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                      {detailsError}
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">
                      {candidateDetails?.name || selectedCandidate.name || 'Candidate'}
                    </h3>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      {candidateDetails?.role || selectedCandidate.role || 'Role not specified'}
                    </p>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/company/candidates/${selectedCandidate.id}`)}
                      >
                        Open full profile
                      </Button>
                    </div>
                  </div>

                  {(candidateDetails?.profileSummary || selectedCandidate.profileSummary) && (
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">
                      {candidateDetails?.profileSummary || selectedCandidate.profileSummary}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(candidateDetails?.education || selectedCandidate.education)?.length ? (
                      <div>
                        <p className="text-xs uppercase text-secondary-400">Education</p>
                        <p className="text-sm text-secondary-700 dark:text-secondary-300">
                          {(candidateDetails?.education || selectedCandidate.education || []).join(', ')}
                        </p>
                      </div>
                    ) : null}
                    {typeof (candidateDetails?.experience ?? selectedCandidate.experience) === 'number' && (
                      <div>
                        <p className="text-xs uppercase text-secondary-400">Experience</p>
                        <p className="text-sm text-secondary-700 dark:text-secondary-300">
                          {candidateDetails?.experience ?? selectedCandidate.experience} years
                        </p>
                      </div>
                    )}
                  </div>

                  {(candidateDetails?.skills || selectedCandidate.skills)?.length ? (
                    <div>
                      <p className="text-xs uppercase text-secondary-400 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {(candidateDetails?.skills || selectedCandidate.skills || []).map((skill) => (
                          <Badge key={skill} variant="info">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {candidateDetails?.contact && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {candidateDetails.contact.email && (
                        <div>
                          <p className="text-xs uppercase text-secondary-400">Email</p>
                          <p className="text-sm text-secondary-700 dark:text-secondary-300">
                            {candidateDetails.contact.email}
                          </p>
                        </div>
                      )}
                      {candidateDetails.contact.location && (
                        <div>
                          <p className="text-xs uppercase text-secondary-400">Location</p>
                          <p className="text-sm text-secondary-700 dark:text-secondary-300">
                            {candidateDetails.contact.location}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {candidateDetails && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase text-secondary-400 mb-2">Analytics</p>
                        {candidateDetails.visibility.showAchievements && candidateDetails.analytics ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                              <p className="text-xs text-secondary-400">Overall rating</p>
                              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                                {candidateDetails.analytics.averageRating ?? 'N/A'}
                              </p>
                            </div>
                            <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                              <p className="text-xs text-secondary-400">Current streak</p>
                              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                                {candidateDetails.analytics.currentStreak}
                              </p>
                            </div>
                            <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                              <p className="text-xs text-secondary-400">Longest streak</p>
                              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                                {candidateDetails.analytics.longestStreak}
                              </p>
                            </div>
                            <div className="rounded-xl border border-secondary-200 dark:border-secondary-700 p-3">
                              <p className="text-xs text-secondary-400">Interviews completed</p>
                              <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                                {candidateDetails.analytics.interviewsCompleted}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            Candidate has hidden achievements.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-secondary-500 dark:text-secondary-400">
                  {profileMessage || 'Select a candidate to view their profile.'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
