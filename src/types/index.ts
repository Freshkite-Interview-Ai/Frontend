// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  createdAt?: string;
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

