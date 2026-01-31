import apiClient from './api';
import { ConceptAnswer, ApiResponse } from '@/types';

export const audioService = {
  // Upload audio recording for a concept
  uploadAudio: async (
    conceptId: string,
    audioBlob: Blob,
    duration: number
  ): Promise<ApiResponse<ConceptAnswer>> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('conceptId', conceptId);
    formData.append('duration', duration.toString());

    const response = await apiClient.post<ApiResponse<ConceptAnswer>>(
      '/audio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Get audio by ID
  getAudio: async (audioId: string): Promise<ApiResponse<ConceptAnswer>> => {
    const response = await apiClient.get<ApiResponse<ConceptAnswer>>(`/audio/${audioId}`);
    return response.data;
  },

  // Get all audio recordings for current user
  getMyRecordings: async (): Promise<ApiResponse<ConceptAnswer[]>> => {
    const response = await apiClient.get<ApiResponse<ConceptAnswer[]>>('/audio/my');
    return response.data;
  },

  // Delete audio recording
  deleteAudio: async (audioId: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(
      `/audio/${audioId}`
    );
    return response.data;
  },

  // Get audio stream URL
  getAudioStreamUrl: (audioId: string): string => {
    return `${process.env.NEXT_PUBLIC_API_URL}/audio/${audioId}/stream`;
  },
};

export default audioService;
