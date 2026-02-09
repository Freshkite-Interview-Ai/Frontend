import apiClient from './api';
import {
  Interview,
  InterviewSession,
  ApiResponse,
  AudioReport,
  InterviewStartResponse,
  InterviewQuestionResponse,
  InterviewEvaluation,
  InterviewFinalReport,
} from '@/types';

export const interviewService = {
  // Start a new interview session
  startInterview: async (
    resumeId?: string,
    options?: { questionCount: number; difficulty: 'Beginner' | 'Intermediate' | 'Advanced' }
  ): Promise<ApiResponse<InterviewStartResponse>> => {
    const response = await apiClient.post<ApiResponse<InterviewStartResponse>>('/interview/start', {
      resumeId,
      questionCount: options?.questionCount,
      difficulty: options?.difficulty,
    });
    return response.data;
  },

  // Get next interview question
  getNextQuestion: async (
    interviewId: string,
    previousEvaluations: InterviewEvaluation[]
  ): Promise<ApiResponse<InterviewQuestionResponse>> => {
    const response = await apiClient.post<ApiResponse<InterviewQuestionResponse>>('/interview/question', {
      interviewId,
      previousEvaluations,
    }, {
      timeout: 120000,
    });
    return response.data;
  },

  // Submit an interview answer
  submitAnswer: async (
    interviewId: string,
    question: string,
    audioBlob: Blob
  ): Promise<ApiResponse<InterviewEvaluation>> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'answer.webm');
    formData.append('interviewId', interviewId);
    formData.append('question', question);

    const response = await apiClient.post<ApiResponse<InterviewEvaluation>>('/interview/answer', formData, {
      transformRequest: (data, headers) => {
        if (headers) {
          delete headers['Content-Type'];
          delete headers['content-type'];
        }
        return data;
      },
      timeout: 120000,
    });
    return response.data;
  },

  // Finish interview
  finishInterview: async (
    interviewId: string,
    evaluations: InterviewEvaluation[]
  ): Promise<ApiResponse<{ reportJson?: InterviewFinalReport } & InterviewFinalReport>> => {
    const response = await apiClient.post<ApiResponse<{ reportJson?: InterviewFinalReport } & InterviewFinalReport>>(
      '/interview/finish',
      {
        interviewId,
        evaluations,
      },
      {
        timeout: 120000,
      }
    );
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
  analyzeAudio: async (audioId: string, conceptDescription?: string): Promise<ApiResponse<AudioReport>> => {
    const response = await apiClient.post<ApiResponse<AudioReport>>('/interview/analyze', {
      audioId,
      conceptDescription,
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
