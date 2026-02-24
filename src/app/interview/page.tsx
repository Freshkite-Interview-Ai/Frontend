'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardLayout, PageHeader } from '@/components/layout';
import { Card, CardContent, Button, LoadingSpinner, Badge } from '@/components/ui';
import { useAudioRecorder, useTokenGuard } from '@/hooks';
import { interviewService, paymentService } from '@/services';
import { useAppStore } from '@/store';
import { InterviewEvaluation, InterviewFinalReport, InterviewDifficulty } from '@/types';

const DEFAULT_QUESTION_COUNT = 8;
const MAX_QUESTION_COUNT = 20;
const DIFFICULTY_OPTIONS: InterviewDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];

const formatDuration = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function InterviewPage() {
	const router = useRouter();
	const { status } = useSession();
	const { resume } = useAppStore();
	const { isChecking: isPlanChecking } = useTokenGuard();

	const isAuthenticated = status === 'authenticated';
	const authLoading = status === 'loading';

	const [interviewId, setInterviewId] = useState<string | null>(null);
	const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
	const [questionIndex, setQuestionIndex] = useState(0);
	const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
	const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Intermediate');
	const [targetQuestionCount, setTargetQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
	const [evaluations, setEvaluations] = useState<InterviewEvaluation[]>([]);
	const [finalReport, setFinalReport] = useState<InterviewFinalReport | null>(null);
	const [pendingAnswer, setPendingAnswer] = useState<Blob | null>(null);
	const [loadingStage, setLoadingStage] = useState<'starting' | 'question' | 'answer' | 'finish' | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [tokenBalance, setTokenBalance] = useState(0);
	const [estimatedCost, setEstimatedCost] = useState(0);
	const evaluationsRef = useRef<InterviewEvaluation[]>([]);
	const isInterviewActive = Boolean(interviewId) && !finalReport;

	const isProcessing = loadingStage !== null;

	const updateEvaluations = useCallback((nextEvaluations: InterviewEvaluation[]) => {
		evaluationsRef.current = nextEvaluations;
		setEvaluations(nextEvaluations);
	}, []);

	const {
		isRecording,
		duration,
		startRecording,
		stopRecording,
		resetRecording,
		isSupported,
	} = useAudioRecorder({
		onRecordingComplete: (blob) => {
			setPendingAnswer(blob);
		},
	});

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login');
		}
	}, [authLoading, isAuthenticated, router]);

	// Load token balance and estimate cost
	useEffect(() => {
		const loadTokenInfo = async () => {
			try {
				const [balanceRes, estimateRes] = await Promise.all([
					paymentService.getTokenBalance(),
					paymentService.getEstimate(),
				]);
				setTokenBalance(balanceRes.data?.tokenBalance ?? 0);
				const estimates = (estimateRes.data as any)?.estimates ?? {};
				const perQuestionCost =
					(estimates.generate_question ?? 0) +
					(estimates.transcribe_audio ?? 0) +
					(estimates.evaluate_answer ?? 0);
				const reportCost = estimates.generate_report ?? 0;
				setEstimatedCost(perQuestionCost * questionCount + reportCost);
			} catch (error) {
				console.error('Failed to load token info:', error);
			}
		};
		loadTokenInfo();
	}, [questionCount]);

	const loadNextQuestion = useCallback(
		async (activeInterviewId: string, currentEvaluations: InterviewEvaluation[]) => {
			setLoadingStage('question');
			setErrorMessage(null);
			try {
				const response = await interviewService.getNextQuestion(activeInterviewId, currentEvaluations);
				const questionText = response.data?.question?.trim();

				if (!questionText) {
					throw new Error('No question returned from the interview service.');
				}

				const nextIndex = currentEvaluations.length + 1;
				setCurrentQuestion(questionText);
				setQuestionIndex(nextIndex);
			} catch (error: any) {
				console.error('Failed to load question:', error);
				const status = error?.response?.status || error?.status;
				if (status === 402 || error?.message?.includes('402')) {
					setErrorMessage('Insufficient tokens. Please purchase more tokens to continue.');
				} else {
					setErrorMessage('We could not fetch the next question. Please try again.');
				}
			} finally {
				setLoadingStage(null);
			}
		},
		[]
	);

	const finishInterview = useCallback(
		async (activeInterviewId: string, currentEvaluations: InterviewEvaluation[]) => {
			setLoadingStage('finish');
			setErrorMessage(null);
			try {
				const response = await interviewService.finishInterview(activeInterviewId, currentEvaluations);
				const reportFromApi = response.data?.reportJson ?? null;
				const fallbackReport: InterviewFinalReport = {
					overallScore: response.data?.overallScore ?? 0,
					strengths: reportFromApi?.strengths ?? [],
					weaknesses: reportFromApi?.weaknesses ?? [],
					skillAuthenticity: reportFromApi?.skillAuthenticity ?? 'unknown',
					decision: reportFromApi?.decision ?? response.data?.decision ?? 'No Hire',
				};
				setFinalReport(reportFromApi ?? fallbackReport);
				setCurrentQuestion(null);
			} catch (error) {
				console.error('Failed to finish interview:', error);
				setErrorMessage('We could not finish the interview. Please try again.');
			} finally {
				setLoadingStage(null);
			}
		},
		[]
	);

	const submitAnswer = useCallback(
		async (blob: Blob) => {
			if (!interviewId || !currentQuestion) return;
			if (!blob || blob.size === 0) {
				setErrorMessage('Please record your answer before submitting.');
				return;
			}

			setLoadingStage('answer');
			setErrorMessage(null);
			try {
				const response = await interviewService.submitAnswer(interviewId, currentQuestion, blob);

				const evaluationResponse = response.data || {
					technical: 0,
					clarity: 0,
					confidence: 0,
					summary: 'Evaluation unavailable. Please try again.',
				};
				const evaluation: InterviewEvaluation = {
					question: currentQuestion,
					technical: evaluationResponse.technical ?? 0,
					clarity: evaluationResponse.clarity ?? 0,
					confidence: evaluationResponse.confidence ?? 0,
					summary: evaluationResponse.summary ?? '',
				};

				const updatedEvaluations = [...evaluationsRef.current, evaluation];
				updateEvaluations(updatedEvaluations);
				resetRecording();

				if (updatedEvaluations.length >= targetQuestionCount) {
					await finishInterview(interviewId, updatedEvaluations);
				} else {
					await loadNextQuestion(interviewId, updatedEvaluations);
				}
			} catch (error: any) {
				console.error('Failed to submit answer:', error);
				// Check if error is 402 Payment Required (insufficient tokens)
				const status = error?.response?.status || error?.status;
				if (status === 402 || error?.message?.includes('402') || error?.message?.toLowerCase()?.includes('insufficient')) {
					setErrorMessage('Insufficient tokens. Please buy more tokens to continue with the interview.');
				} else {
					setErrorMessage('We could not submit your answer. Please try again.');
				}
				setLoadingStage(null);
			}
		},
		[currentQuestion, finishInterview, interviewId, loadNextQuestion, resetRecording, targetQuestionCount, updateEvaluations]
	);

	useEffect(() => {
		if (!pendingAnswer || !interviewId || !currentQuestion) return;
		void submitAnswer(pendingAnswer);
		setPendingAnswer(null);
	}, [currentQuestion, interviewId, pendingAnswer, submitAnswer]);

	const startInterviewFlow = useCallback(async () => {
		if (!resume?.id) return;
		if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > MAX_QUESTION_COUNT) {
			setErrorMessage(`Please choose between 1 and ${MAX_QUESTION_COUNT} questions.`);
			return;
		}
		if (!difficulty) {
			setErrorMessage('Please select a difficulty level.');
			return;
		}

		setLoadingStage('starting');
		setErrorMessage(null);
		setFinalReport(null);
		setCurrentQuestion(null);
		setQuestionIndex(0);
		setInterviewId(null);
		updateEvaluations([]);
		try {
			const response = await interviewService.startInterview(resume.id, {
				questionCount,
				difficulty,
			});
			const nextInterviewId = response.data?.interviewId ?? (response.data as { id?: string } | null)?.id;
			const nextQuestionCount = response.data?.questionCount;

			if (!nextInterviewId) {
				throw new Error('Interview ID missing from start response.');
			}

			setTargetQuestionCount(typeof nextQuestionCount === 'number' ? nextQuestionCount : questionCount);
			setInterviewId(nextInterviewId);
			await loadNextQuestion(nextInterviewId, []);
		} catch (error: any) {
			console.error('Failed to start interview:', error);
			const status = error?.response?.status || error?.status;
			if (status === 402 || error?.message?.includes('402')) {
				setErrorMessage('Insufficient tokens to start an interview. Please purchase more tokens.');
			} else {
				setErrorMessage('We could not start the interview. Please try again.');
			}
			setLoadingStage(null);
		}
	}, [difficulty, loadNextQuestion, questionCount, resume?.id, updateEvaluations]);

	const statusLabel = useMemo(() => {
		switch (loadingStage) {
			case 'starting':
				return 'Starting your interview...';
			case 'question':
				return 'Preparing the next question...';
			case 'answer':
				return 'Evaluating your answer...';
			case 'finish':
				return 'Finalizing your interview report...';
			default:
				return null;
		}
	}, [loadingStage]);

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
				title="Interview"
				description="Answer resume-based questions one at a time with audio responses."
			/>

			<div className="grid lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					{!resume ? (
						<Card>
							<CardContent>
								<div className="text-center py-12">
									<div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
										<svg
											className="w-10 h-10 text-yellow-600 dark:text-yellow-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 16h-1v-4h-1m1-4h.01M12 4a8 8 0 100 16 8 8 0 000-16z"
											/>
										</svg>
									</div>
									<h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
										Upload your resume to begin
									</h2>
									<p className="text-secondary-600 dark:text-secondary-400 mb-6">
										We tailor interview questions to your experience. Upload your resume first.
									</p>
									<Link href="/resume">
										<Button>Upload Resume</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					) : finalReport ? (
						<Card>
							<CardContent>
								<div className="py-8">
									<div className="flex items-center justify-between flex-wrap gap-4 mb-6">
										<div>
											<h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
												Interview Report
											</h2>
											<p className="text-secondary-500 dark:text-secondary-400">
												{evaluations.length} questions completed
											</p>
										</div>
										<Badge variant="success">
											{finalReport.decision ? finalReport.decision.toUpperCase() : 'COMPLETED'}
										</Badge>
									</div>

									<div className="grid sm:grid-cols-2 gap-6">
										<div className="bg-secondary-50 dark:bg-secondary-800 rounded-xl p-5">
											<p className="text-sm text-secondary-500 dark:text-secondary-400">Overall Score</p>
											<p className="text-3xl font-bold text-secondary-900 dark:text-white mt-2">
												{finalReport.overallScore ?? 'N/A'}
											</p>
										</div>
										<div className="bg-secondary-50 dark:bg-secondary-800 rounded-xl p-5">
											<p className="text-sm text-secondary-500 dark:text-secondary-400">Decision</p>
											<p className="text-2xl font-semibold text-secondary-900 dark:text-white mt-2">
												{finalReport.decision ?? 'Pending review'}
											</p>
										</div>
									</div>

									<div className="grid sm:grid-cols-2 gap-6 mt-6">
										<div className="bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl p-5">
											<h3 className="font-semibold text-secondary-900 dark:text-white mb-3">Strengths</h3>
											{finalReport.strengths && finalReport.strengths.length > 0 ? (
												<ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
													{finalReport.strengths.map((item, index) => (
														<li key={`strength-${index}`} className="flex items-start gap-2">
															<span className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
															<span>{item}</span>
														</li>
													))}
												</ul>
											) : (
												<p className="text-sm text-secondary-500 dark:text-secondary-400">No strengths provided.</p>
											)}
										</div>
										<div className="bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-700 rounded-xl p-5">
											<h3 className="font-semibold text-secondary-900 dark:text-white mb-3">Weaknesses</h3>
											{finalReport.weaknesses && finalReport.weaknesses.length > 0 ? (
												<ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
													{finalReport.weaknesses.map((item, index) => (
														<li key={`weakness-${index}`} className="flex items-start gap-2">
															<span className="w-2 h-2 bg-red-500 rounded-full mt-1.5" />
															<span>{item}</span>
														</li>
													))}
												</ul>
											) : (
												<p className="text-sm text-secondary-500 dark:text-secondary-400">No weaknesses provided.</p>
											)}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					) : interviewId ? (
						<Card>
							<CardContent>
								<div className="py-8">
									<div className="flex items-start justify-between flex-wrap gap-4 mb-6">
										<div>
											<h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
												Interview Question
											</h2>
											<p className="text-secondary-500 dark:text-secondary-400">
												Question {questionIndex || 1} of {targetQuestionCount}
											</p>
										</div>
										<Badge variant="info">Session {interviewId.slice(0, 8)}</Badge>
									</div>

									<div className="bg-secondary-50 dark:bg-secondary-800 rounded-xl p-6 mb-6">
										{currentQuestion ? (
											<p className="text-lg text-secondary-900 dark:text-white leading-relaxed">
												{currentQuestion}
											</p>
										) : (
											<div className="flex items-center gap-3 text-secondary-500 dark:text-secondary-400">
												<LoadingSpinner size="sm" />
												<span>Loading question...</span>
											</div>
										)}
									</div>

									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
										<div>
											<p className="text-sm text-secondary-500 dark:text-secondary-400">
												{isRecording ? `Recording ${formatDuration(duration)}` : 'Ready when you are.'}
											</p>
											{!isSupported && (
												<p className="text-sm text-red-500 mt-2">Audio recording is not supported in this browser.</p>
											)}
										</div>
										<Button
											size="lg"
											variant={isRecording ? 'danger' : 'primary'}
											onClick={isRecording ? stopRecording : startRecording}
											disabled={!currentQuestion || isProcessing || !isSupported}
										>
											{isRecording ? 'Stop Recording' : 'Record Answer'}
										</Button>
									</div>

									{statusLabel && (
										<div className="mt-6 flex items-center gap-3 text-secondary-500 dark:text-secondary-400">
											<LoadingSpinner size="sm" />
											<span>{statusLabel}</span>
										</div>
									)}

									{errorMessage && (
										<div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
											<p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
											{resume && (
												<Button
													variant="outline"
													size="sm"
													className="mt-3"
													onClick={() => void startInterviewFlow()}
													disabled={isProcessing}
												>
													Retry
												</Button>
											)}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent>
								<div className="text-center py-12">
									<div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-700 rounded-full flex items-center justify-center mx-auto mb-6">
										<svg
											className="w-10 h-10 text-secondary-400 dark:text-secondary-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
											/>
										</svg>
									</div>
									<h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
										Ready to start?
									</h2>
									<p className="text-secondary-600 dark:text-secondary-400 max-w-md mx-auto mb-8">
										Click start to begin your resume-based mock interview.
									</p>
									<div className="grid sm:grid-cols-2 gap-4 mb-8 text-left">
										<div>
											<label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
												Number of questions
											</label>
											<input
												type="number"
												min={1}
												max={MAX_QUESTION_COUNT}
												value={questionCount}
												onChange={(event) => {
													const nextValue = Number(event.target.value);
													setQuestionCount(Number.isNaN(nextValue) ? 1 : nextValue);
												}}
												disabled={isProcessing || isInterviewActive}
												className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 px-3 py-2 text-secondary-900 dark:text-white"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
												Difficulty
											</label>
											<div className="grid grid-cols-3 gap-2">
												{DIFFICULTY_OPTIONS.map((option) => (
													<button
														key={option}
														type="button"
														onClick={() => setDifficulty(option)}
														disabled={isProcessing || isInterviewActive}
														className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
														difficulty === option
															? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-primary-200'
															: 'border-secondary-200 bg-white text-secondary-700 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-300'
													}`}
													>
														{option}
													</button>
												))}
											</div>
										</div>
									</div>
									<Button
										size="lg"
										onClick={() => void startInterviewFlow()}
										isLoading={loadingStage === 'starting'}
										disabled={isProcessing}
										leftIcon={
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
												/>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										}
									>
										Start Interview
									</Button>
									{errorMessage && (
										<p className="text-sm text-red-600 dark:text-red-400 mt-4">{errorMessage}</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="lg:col-span-1 space-y-6">
					<Card className="border-primary-200 dark:border-primary-800">
						<CardContent>
							<h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Token Information</h3>
							<div className="space-y-3 text-sm">
								<div className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800/50">
									<span className="text-secondary-600 dark:text-secondary-300">Available Tokens</span>
									<span className="font-bold text-lg text-primary-600 dark:text-primary-400">{tokenBalance}</span>
								</div>
								<div className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800/50">
									<span className="text-secondary-600 dark:text-secondary-300">Estimated Cost</span>
									<span className="font-bold text-lg text-secondary-900 dark:text-white">{estimatedCost}</span>
								</div>
								{estimatedCost <= tokenBalance && tokenBalance > 0 ? (
									<div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
										<p className="text-xs text-emerald-700 dark:text-emerald-200 font-medium">
											✓ Sufficient tokens for {questionCount} questions
										</p>
									</div>
								) : estimatedCost > tokenBalance ? (
									<div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
										<p className="text-xs text-amber-700 dark:text-amber-200 font-medium">
											⚠ Need {estimatedCost - tokenBalance} more tokens
										</p>
										<Link href="/tokens">
											<Button size="sm" className="mt-2 w-full" variant="outline">
												Buy Tokens
											</Button>
										</Link>
									</div>
								) : (
									<div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
										<p className="text-xs text-red-700 dark:text-red-200 font-medium">
											Get tokens to practice
										</p>
										<Link href="/tokens">
											<Button size="sm" className="mt-2 w-full">
												Buy Tokens
											</Button>
										</Link>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent>
							<h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Interview Tips</h3>
							<ul className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
								<li className="flex items-start gap-2">
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									Keep answers structured and concise
								</li>
								<li className="flex items-start gap-2">
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									Mention relevant experience from your resume
								</li>
								<li className="flex items-start gap-2">
									<svg
										className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									Pause briefly before starting to answer
								</li>
							</ul>
						</CardContent>
					</Card>

					<Card>
						<CardContent>
							<h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Progress</h3>
							<div className="space-y-3 text-sm text-secondary-600 dark:text-secondary-400">
								<div className="flex items-center justify-between">
									<span>Questions answered</span>
									<span className="font-medium text-secondary-900 dark:text-white">
										{evaluations.length} / {targetQuestionCount}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Difficulty</span>
									<span className="font-medium text-secondary-900 dark:text-white">
										{difficulty}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Status</span>
									<span className="font-medium text-secondary-900 dark:text-white">
										{finalReport ? 'Completed' : currentQuestion ? 'In progress' : 'Preparing'}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</DashboardLayout>
	);
}