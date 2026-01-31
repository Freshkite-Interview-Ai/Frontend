import api from './api';
import {
  UserAnalytics,
  UserAnalyticsWithDetails,
  ConceptPractice,
  ConceptPracticeWithDetails,
} from '../types';

/**
 * Analytics Service
 * Handles all analytics-related API calls
 */
export const analyticsService = {
  /**
   * Get user analytics (for dashboard)
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await api.get<{ success: boolean; data: UserAnalytics }>('/analytics');
    return response.data.data;
  },

  /**
   * Get user analytics with practiced concepts details (for profile page)
   */
  async getUserAnalyticsWithDetails(): Promise<UserAnalyticsWithDetails> {
    const response = await api.get<{ success: boolean; data: UserAnalyticsWithDetails }>(
      '/analytics/details'
    );
    return response.data.data;
  },

  /**
   * Get all practiced concepts for a user
   */
  async getPracticedConcepts(): Promise<ConceptPracticeWithDetails[]> {
    const response = await api.get<{
      success: boolean;
      data: { practicedConcepts: ConceptPracticeWithDetails[] };
    }>('/analytics/practiced-concepts');
    return response.data.data.practicedConcepts;
  },

  /**
   * Get practice status for a specific concept
   */
  async getConceptPracticeStatus(conceptId: string): Promise<ConceptPractice> {
    const response = await api.get<{ success: boolean; data: ConceptPractice }>(
      `/analytics/concepts/${conceptId}`
    );
    return response.data.data;
  },
};
