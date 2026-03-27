import apiClient from './api';
import { ApiResponse, User, TargetGoal } from '@/types';

interface BackendUserResponse {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  bio?: string;
  location?: string;
  themePreference?: 'light' | 'dark';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyDigest?: boolean;
  interviewReminders?: boolean;
  practiceReminders?: boolean;
  profileVisibility?: 'public' | 'private';
  showActivity?: boolean;
  showAchievements?: boolean;
  isPaid?: boolean;
  tokenBalance?: number;
  targetGoal?: TargetGoal;
  onboardingCompleted?: boolean;
  createdAt?: string;
}

export interface UpdateUserSettingsPayload {
  name?: string;
  displayName?: string;
  bio?: string;
  location?: string;
  themePreference?: 'light' | 'dark';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyDigest?: boolean;
  interviewReminders?: boolean;
  practiceReminders?: boolean;
  profileVisibility?: 'public' | 'private';
  showActivity?: boolean;
  showAchievements?: boolean;
  targetGoal?: TargetGoal;
  onboardingCompleted?: boolean;
}

const mapBackendUserToUser = (backendUser: BackendUserResponse): User => {
  const [firstName, ...lastNameParts] = backendUser.name?.split(' ') || [''];
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: firstName || '',
    lastName: lastNameParts.join(' ') || '',
    username: backendUser.email?.split('@')[0] || '',
    displayName: backendUser.displayName,
    bio: backendUser.bio,
    location: backendUser.location,
    themePreference: backendUser.themePreference,
    emailNotifications: backendUser.emailNotifications,
    pushNotifications: backendUser.pushNotifications,
    weeklyDigest: backendUser.weeklyDigest,
    interviewReminders: backendUser.interviewReminders,
    practiceReminders: backendUser.practiceReminders,
    profileVisibility: backendUser.profileVisibility,
    showActivity: backendUser.showActivity,
    showAchievements: backendUser.showAchievements,
    isPaid: backendUser.isPaid ?? false,
    tokenBalance: backendUser.tokenBalance ?? 0,
    targetGoal: backendUser.targetGoal,
    onboardingCompleted: backendUser.onboardingCompleted ?? false,
    createdAt: backendUser.createdAt,
  };
};

export const userService = {
  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<BackendUserResponse>>('/me');
    return {
      ...response.data,
      data: mapBackendUserToUser(response.data.data),
    };
  },
  updateMe: async (payload: UpdateUserSettingsPayload): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<BackendUserResponse>>('/me', payload);
    return {
      ...response.data,
      data: mapBackendUserToUser(response.data.data),
    };
  },
  exportMyData: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>('/me/export');
    return response.data;
  },
  clearPracticeHistory: async (): Promise<ApiResponse<{ cleared: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ cleared: boolean }>>('/me/practice-history');
    return response.data;
  },
  deleteAccount: async (): Promise<ApiResponse<{ deleted: boolean }>> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>('/me');
    return response.data;
  },
};

export default userService;
