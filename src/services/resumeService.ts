import apiClient from './api';
import { Resume, ApiResponse } from '@/types';

export const resumeService = {
  // Upload resume PDF
  uploadResume: async (file: File): Promise<ApiResponse<Resume>> => {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await apiClient.post<ApiResponse<Resume>>('/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get current user's resume
  getMyResume: async (): Promise<ApiResponse<Resume | null>> => {
    const response = await apiClient.get<ApiResponse<Resume | null>>('/resume/me');
    return response.data;
  },

  // Get all resumes
  getAllResumes: async (page = 1, limit = 10): Promise<ApiResponse<Resume[]>> => {
    const response = await apiClient.get<ApiResponse<Resume[]>>(`/resume/all?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Delete resume
  deleteResume: async (resumeId: string): Promise<void> => {
    await apiClient.delete(`/resume/${resumeId}`);
  },
};

export default resumeService;
