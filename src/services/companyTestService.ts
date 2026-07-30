import axios from 'axios';
import { companyAuthService } from './companyAuthService';
import {
  RecruitmentTest,
  TestQuestionFull,
  TestAttemptWithCandidate,
  TestAnswer,
  TestAnalytics,
  TestSubmission,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_COMPANY_API_URL || 'http://localhost:3002/api/v1';

const withAuthHeader = () => {
  const token = companyAuthService.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CreateTestPayload {
  title: string;
  description: string;
  passMark?: number;
  duration: number;
  startTime: string;
  endTime: string;
  eligibility?: {
    degrees?: string[];
    skills?: string[];
    tags?: string[];
  };
  questions: {
    type: 'MCQ' | 'SHORT' | 'CODE';
    question: string;
    options?: string[];
    correctAnswer?: string;
    languageSupport?: string[];
    testCases?: { input: string; output: string }[];
  }[];
}

export const companyTestService = {
  createTest: async (data: CreateTestPayload) => {
    const response = await axios.post<{ success: boolean; data: { test: RecruitmentTest; questions: TestQuestionFull[] } }>(
      `${API_URL}/company/tests`,
      data,
      { headers: withAuthHeader() }
    );
    return response.data;
  },

  getTests: async (page = 1, limit = 20) => {
    const response = await axios.get<{
      success: boolean;
      data: RecruitmentTest[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`${API_URL}/company/tests`, {
      params: { page, limit },
      headers: withAuthHeader(),
    });
    return response.data;
  },

  getTestDetails: async (testId: string) => {
    const response = await axios.get<{
      success: boolean;
      data: { test: RecruitmentTest; questions: TestQuestionFull[] };
    }>(`${API_URL}/company/tests/${testId}`, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  publishTest: async (testId: string) => {
    const response = await axios.patch<{ success: boolean; data: RecruitmentTest }>(
      `${API_URL}/company/tests/${testId}/publish`,
      {},
      { headers: withAuthHeader() }
    );
    return response.data;
  },

  deleteTest: async (testId: string) => {
    await axios.delete(`${API_URL}/company/tests/${testId}`, {
      headers: withAuthHeader(),
    });
  },

  getTestAttempts: async (testId: string, page = 1, limit = 20) => {
    const response = await axios.get<{
      success: boolean;
      data: TestAttemptWithCandidate[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`${API_URL}/company/tests/${testId}/attempts`, {
      params: { page, limit },
      headers: withAuthHeader(),
    });
    return response.data;
  },

  getAttemptDetail: async (attemptId: string) => {
    const response = await axios.get<{
      success: boolean;
      data: {
        attempt: TestAttemptWithCandidate;
        answers: TestAnswer[];
        questions: TestQuestionFull[];
      };
    }>(`${API_URL}/company/tests/attempts/${attemptId}`, {
      headers: withAuthHeader(),
    });
    return response.data;
  },

  getTestAnalytics: async (testId: string, passMark?: number) => {
    const response = await axios.get<{
      success: boolean;
      data: TestAnalytics;
    }>(`${API_URL}/company/tests/${testId}/analytics`, {
      params: passMark !== undefined ? { passMark } : undefined,
      headers: withAuthHeader(),
    });
    return response.data;
  },

  getTestSubmissions: async (testId: string, params: {
    page?: number;
    limit?: number;
    minScore?: number;
    passStatus?: 'pass' | 'fail';
    topN?: number;
    completionStatus?: 'completed' | 'incomplete';
    minTimeMinutes?: number;
    maxTimeMinutes?: number;
    passMark?: number;
  }) => {
    const response = await axios.get<{
      success: boolean;
      data: TestSubmission[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`${API_URL}/company/tests/${testId}/submissions`, {
      params,
      headers: withAuthHeader(),
    });
    return response.data;
  },

  sendTestMessage: async (testId: string, payload: { candidateIds: string[]; message: string }) => {
    const response = await axios.post<{
      success: boolean;
      data: { requested: number; queued: number; skipped: number };
    }>(`${API_URL}/company/tests/${testId}/messages`, payload, {
      headers: withAuthHeader(),
    });
    return response.data;
  },
};

export default companyTestService;
