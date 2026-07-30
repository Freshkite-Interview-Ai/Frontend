import apiClient from './api';
import {
  ApiResponse,
  ProblemSolveData,
  RunCodeResponse,
  ProblemSubmission,
  SubmissionContext,
} from '@/types';

export const problemSolverService = {
  /**
   * Get problem data for solving (description, examples, boilerplate, visible test cases)
   */
  getSolveData: async (
    problemId: string,
    context: SubmissionContext = 'practice',
    contextId?: string
  ): Promise<ApiResponse<ProblemSolveData>> => {
    const params: Record<string, string> = { context };
    if (contextId) params.contextId = contextId;

    const response = await apiClient.get<ApiResponse<ProblemSolveData>>(
      `/problems/${problemId}/solve`,
      { params }
    );
    return response.data;
  },

  /**
   * Run code against visible test cases only
   */
  runCode: async (
    problemId: string,
    code: string,
    language: string
  ): Promise<ApiResponse<RunCodeResponse>> => {
    const response = await apiClient.post<ApiResponse<RunCodeResponse>>(
      `/problems/${problemId}/run`,
      { code, language }
    );
    return response.data;
  },

  /**
   * Submit code against all test cases (including hidden)
   */
  submitCode: async (
    problemId: string,
    code: string,
    language: string,
    context: SubmissionContext = 'practice',
    contextId?: string
  ): Promise<ApiResponse<ProblemSubmission>> => {
    const response = await apiClient.post<ApiResponse<ProblemSubmission>>(
      `/problems/${problemId}/submit`,
      { code, language, context, contextId }
    );
    return response.data;
  },

  /**
   * Get user's existing submission for a problem
   */
  getSubmission: async (
    problemId: string,
    context: SubmissionContext = 'practice',
    contextId?: string
  ): Promise<ApiResponse<ProblemSubmission | null>> => {
    const params: Record<string, string> = { context };
    if (contextId) params.contextId = contextId;

    const response = await apiClient.get<ApiResponse<ProblemSubmission | null>>(
      `/problems/${problemId}/submission`,
      { params }
    );
    return response.data;
  },
};

export default problemSolverService;
