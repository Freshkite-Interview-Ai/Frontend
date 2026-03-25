import apiClient from './api';
import { Concept, ApiResponse, PaginatedResponse, ConceptDifficulty } from '@/types';

export const conceptService = {
  // Get all concepts with pagination and filters
  getConcepts: async (
    page: number = 1,
    limit: number = 10,
    group?: string,
    difficulty?: ConceptDifficulty
  ): Promise<PaginatedResponse<Concept>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (group) {
      params.append('group', group);
    }
    if (difficulty) {
      params.append('difficulty', difficulty);
    }
    const response = await apiClient.get<PaginatedResponse<Concept>>(
      `/concepts?${params.toString()}`
    );
    return response.data;
  },

  // Get single concept by ID
  getConcept: async (id: string): Promise<ApiResponse<Concept>> => {
    const response = await apiClient.get<ApiResponse<Concept>>(`/concepts/${id}`);
    return response.data;
  },

  // Search concepts
  searchConcepts: async (query: string): Promise<PaginatedResponse<Concept>> => {
    const response = await apiClient.get<PaginatedResponse<Concept>>(
      `/concepts?search=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Get available concept groups (categories)
  getGroups: async (): Promise<ApiResponse<string[]>> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/concepts/groups');
    return response.data;
  },
};

export default conceptService;
