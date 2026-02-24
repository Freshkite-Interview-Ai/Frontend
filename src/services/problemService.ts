import apiClient from './api';
import { ApiResponse, Problem, UserProblemStatus, ProblemStatusValue } from '@/types';

export const problemService = {
  getProblems: async (): Promise<ApiResponse<Problem[]>> => {
    const response = await apiClient.get<ApiResponse<Problem[]>>('/problems');
    return response.data;
  },

  getUserStatuses: async (): Promise<ApiResponse<UserProblemStatus[]>> => {
    const response = await apiClient.get<ApiResponse<UserProblemStatus[]>>('/problems/status');
    return response.data;
  },

  updateStatus: async (
    problemId: string,
    status: ProblemStatusValue
  ): Promise<ApiResponse<UserProblemStatus>> => {
    const response = await apiClient.put<ApiResponse<UserProblemStatus>>(
      `/problems/status/${problemId}`,
      { status }
    );
    return response.data;
  },
};

export default problemService;
