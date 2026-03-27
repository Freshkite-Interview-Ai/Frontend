// User Types
export type TargetGoalType = 'product' | 'service' | 'faang' | 'custom';

export interface CustomCriteria {
  minRating?: number;
  focusAreas?: string[];
}

export interface TargetGoal {
  type: TargetGoalType;
  customCriteria?: CustomCriteria;
}

export type AuthProvider = 'google' | 'local';

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName: string;
  lastName?: string;
  mobile?: string;
  username?: string;
  authProvider?: AuthProvider;
  emailVerified?: boolean;
  avatar?: string;
  picture?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  themePreference?: 'light' | 'dark';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyDigest?: boolean;
  interviewReminders?: boolean;
  practiceReminders?: boolean;
  profileVisibility?: 'public' | 'private';
  showActivity?: boolean;
  showAchievements?: boolean;
  isPaid?: boolean;
  tokenBalance?: number;
  targetGoal?: TargetGoal;
  onboardingCompleted?: boolean;
  createdAt?: string;
}

// Company Types
export interface CompanyProfile {
  id: string;
  companyName: string;
  email: string;
  industry?: string;
  createdAt?: string;
}

export interface CompanyCandidateSummary {
  id: string;
  name: string;
  role?: string | null;
  skills?: string[];
  education?: string[];
  experience?: number | null;
  profileSummary?: string | null;
}

export interface CompanyCandidateProfile extends CompanyCandidateSummary {
  highlights?: string[];
  location?: string;
  experienceSummary?: string;
}

export interface CompanyCandidateAnalyticsSummary {
  averageRating: number | null;
  currentStreak: number;
  longestStreak: number;
  interviewsCompleted: number;
  totalAttempts: number;
  lastActivityAt: string | null;
}

export interface CompanyCandidateInterviewSummary {
  id: string;
  role?: string | null;
  overallScore?: number | null;
  decision?: string | null;
  completedAt?: string | null;
}

export interface CompanyCandidateAudioReportSummary {
  id: string;
  overallRating: number;
  createdAt: string;
  concept?: {
    id?: string;
    title?: string;
    difficulty?: string;
  };
}

export interface CompanyCandidateProblemStats {
  pass: number;
  fail: number;
  completed: number;
  total: number;
  lastUpdatedAt: string | null;
}

export interface CompanyCandidateDetails {
  id: string;
  name: string;
  role?: string | null;
  skills: string[];
  education: string[];
  experience?: number | null;
  profileSummary?: string | null;
  contact: {
    email?: string;
    location?: string;
  };
  analytics?: CompanyCandidateAnalyticsSummary | null;
  interviews?: CompanyCandidateInterviewSummary[];
  audioReports?: CompanyCandidateAudioReportSummary[];
  problemStats?: CompanyCandidateProblemStats | null;
  visibility: {
    showActivity: boolean;
    showAchievements: boolean;
  };
}

// Token Types
export interface TokenPack {
  id: string;
  name: string;
  tokens: number;
  priceINR: number;
  displayPriceINR: number;
  popular?: boolean;
  description: string;
}

export interface TokenBalance {
  tokenBalance: number;
  isPaid: boolean;
}

export interface TokenTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  operation: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Concept Types
export type ConceptDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Concept {
  id: string;
  title: string;
  description: string;
  group: string; // Category/Group (e.g., "Algorithms", "Data Structures")
  difficulty: ConceptDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptAnswer {
  id: string;
  conceptId: string;
  userId: string;
  audioUrl: string;
  duration: number;
  status: 'pending' | 'processed' | 'reviewed';
  createdAt: string;
}

// Resume Types
export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  status: 'pending' | 'processed' | 'analyzed';
}

// Interview Types
export type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Interview {
  id: string;
  userId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  interviewId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  status: 'active' | 'paused' | 'completed';
}

export interface InterviewStartResponse {
  interviewId?: string;
  role?: string;
  status?: string;
  startedAt?: string;
  createdAt?: string;
  id?: string;
  questionCount?: number;
  difficulty?: InterviewDifficulty;
  currentQuestionIndex?: number;
}

export interface InterviewQuestionResponse {
  question: string;
}

export interface InterviewEvaluation {
  question: string;
  technical: number;
  clarity: number;
  confidence: number;
  summary: string;
}

export interface InterviewFinalReport {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  skillAuthenticity: string;
  decision: 'Hire' | 'No Hire';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Audio Types
export interface AudioUpload {
  id: string;
  conceptId: string;
  audioBlob: Blob;
  duration: number;
}

export interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
}

// Audio Report Types
export interface AudioReport {
  id: string;
  audioId: string;
  overallRating: number;
  strengths: string[];
  missedPoints: string[];
  improvements: string[];
  communicationFeedback: string;
  transcript: string | null;
  createdAt: string;
}

// Analytics Types
export interface UserAnalytics {
  totalConceptsPracticed: number;
  totalAttempts: number;
  totalRecordingMinutes: number;
  averageRating: number | null;
  interviewsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
}

export interface ConceptPractice {
  isPracticed: boolean;
  bestRating: number | null;
  totalAttempts: number;
  lastAttemptAt: string | null;
  firstPracticedAt: string | null;
}

export interface PracticedConcept {
  id: string;
  title: string;
  bestRating: number;
  totalAttempts: number;
  lastAttemptAt: string | null;
  firstPracticedAt: string | null;
}

export interface ConceptPracticeWithDetails extends ConceptPractice {
  concept: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    group: string;
  };
}

export interface UserAnalyticsWithDetails extends UserAnalytics {
  practicedConcepts: PracticedConcept[];
}

// Problem Solving Types
export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemStatusValue = 'pass' | 'fail' | 'completed';

export interface Problem {
  id: string;
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  leetcodeUrl: string;
  tags: string[];
  isNew: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProblemStatus {
  id: string;
  userId: string;
  problemId: string;
  status: ProblemStatusValue;
  updatedAt: string;
}

export interface ProblemsByCategory {
  [category: string]: Problem[];
}

// Resume Improvement Types
export type ImprovementType = 'keyword' | 'format' | 'impact' | 'ats';
export type ImprovementPriority = 'high' | 'medium' | 'low';

export interface Improvement {
  type: ImprovementType;
  priority: ImprovementPriority;
  section: string;
  currentText?: string;
  suggestedText: string;
  reason: string;
}

export interface ResumeImprovements {
  id: string;
  userId: string;
  resumeId: string;
  improvements: Improvement[];
  createdAt: string;
  updatedAt: string;
}

// Recommended Concept Types
export interface RecommendedConcept extends Concept {
  relevanceScore: number;
  reason: string;
}

