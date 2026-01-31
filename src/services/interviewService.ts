import apiClient from './api';
import { Interview, InterviewSession, ApiResponse, AudioReport } from '@/types';

export const interviewService = {
  // Start a new interview session
  startInterview: async (): Promise<ApiResponse<InterviewSession>> => {
    const response = await apiClient.post<ApiResponse<InterviewSession>>('/interview/start');
    return response.data;
  },

  // End interview session
  endInterview: async (sessionId: string): Promise<ApiResponse<InterviewSession>> => {
    const response = await apiClient.post<ApiResponse<InterviewSession>>('/interview/end', {
      sessionId,
    });
    return response.data;
  },

  // Get current active session
  getActiveSession: async (): Promise<ApiResponse<InterviewSession | null>> => {
    const response = await apiClient.get<ApiResponse<InterviewSession | null>>('/interview/active');
    return response.data;
  },

  // Get interview by ID
  getInterview: async (interviewId: string): Promise<ApiResponse<InterviewSession>> => {
    const response = await apiClient.get<ApiResponse<InterviewSession>>(`/interview/${interviewId}`);
    return response.data;
  },

  // Get all interviews for current user
  getMyInterviews: async (): Promise<ApiResponse<InterviewSession[]>> => {
    const response = await apiClient.get<ApiResponse<InterviewSession[]>>('/interview/my');
    return response.data;
  },

  // Analyze an audio recording and generate a report
  analyzeAudio: async (audioId: string): Promise<ApiResponse<AudioReport>> => {
    const response = await apiClient.post<ApiResponse<AudioReport>>('/interview/analyze', {
      audioId,
    });
    return response.data;
  },

  // Get report for an audio recording
  getAudioReport: async (audioId: string): Promise<ApiResponse<AudioReport>> => {
    const response = await apiClient.get<ApiResponse<AudioReport>>(`/interview/${audioId}/report`);
    return response.data;
  },
};

export default interviewService;
