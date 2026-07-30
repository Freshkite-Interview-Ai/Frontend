import apiClient from './api';
import {
  RecruitmentTest,
  TestQuestion,
  TestAttempt,
  TestAnswer,
  CodeExecutionResult,
} from '@/types';

interface StartTestResponse {
  attempt: TestAttempt;
  questions: TestQuestion[];
  test: RecruitmentTest;
}

interface AttemptStatusResponse {
  attempt: TestAttempt;
  answers: TestAnswer[];
  remainingTime: number;
  questions: TestQuestion[];
  test: RecruitmentTest;
}

interface SubmitTestResponse {
  attempt: TestAttempt;
  score: number;
  maxScore: number;
}

interface ViolationResponse {
  violations: number;
  terminated: boolean;
}

export const recruitmentTestService = {
  // Get eligible tests for candidate
  getEligibleTests: async (page = 1, limit = 20) => {
    const response = await apiClient.get<{
      success: boolean;
      data: RecruitmentTest[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/recruitment-tests', { params: { page, limit } });
    return response.data;
  },

  // Start a test
  startTest: async (testId: string) => {
    const response = await apiClient.post<{ success: boolean; data: StartTestResponse }>(
      `/recruitment-tests/${testId}/start`
    );
    return response.data;
  },

  // Get attempt status (also returns current answers)
  getAttemptStatus: async (attemptId: string) => {
    const response = await apiClient.get<{ success: boolean; data: AttemptStatusResponse }>(
      `/recruitment-tests/attempts/${attemptId}`
    );
    return response.data;
  },

  // Save answer (autosave)
  saveAnswer: async (attemptId: string, data: { questionId: string; answer?: string; codeSubmission?: string; language?: string }) => {
    const response = await apiClient.post<{ success: boolean; data: TestAnswer }>(
      `/recruitment-tests/attempts/${attemptId}/answers`,
      data
    );
    return response.data;
  },

  // Bulk save answers
  bulkSaveAnswers: async (attemptId: string, answers: { questionId: string; answer?: string; codeSubmission?: string; language?: string }[]) => {
    const response = await apiClient.post<{ success: boolean; data: TestAnswer[] }>(
      `/recruitment-tests/attempts/${attemptId}/answers/bulk`,
      { answers }
    );
    return response.data;
  },

  // Report violation
  reportViolation: async (attemptId: string, violationType: string) => {
    const response = await apiClient.post<{ success: boolean; data: ViolationResponse }>(
      `/recruitment-tests/attempts/${attemptId}/violations`,
      { violationType }
    );
    return response.data;
  },

  // Submit test
  submitTest: async (attemptId: string) => {
    const response = await apiClient.post<{ success: boolean; data: SubmitTestResponse }>(
      `/recruitment-tests/attempts/${attemptId}/submit`
    );
    return response.data;
  },

  // Run code (playground)
  runCode: async (code: string, language: string, input = '') => {
    const response = await apiClient.post<{
      success: boolean;
      data: { output: string; error?: string; executionTime: number };
    }>('/recruitment-tests/code/run', { code, language, input });
    return response.data;
  },

  // Execute code for a question's test cases
  executeCode: async (attemptId: string, questionId: string, code: string, language: string) => {
    const response = await apiClient.post<{ success: boolean; data: CodeExecutionResult[] }>(
      `/recruitment-tests/attempts/${attemptId}/questions/${questionId}/execute`,
      { code, language }
    );
    return response.data;
  },
};

export default recruitmentTestService;
