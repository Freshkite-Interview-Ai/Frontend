import apiClient from './api';
import { ApiResponse, User, Plan } from '@/types';

interface BackendUserResponse {
  id: string;
  email: string;
  name: string;
  isPaid?: boolean;
  plan?: Plan | null;
  createdAt?: string;
}

const mapBackendUserToUser = (backendUser: BackendUserResponse): User => {
  const [firstName, ...lastNameParts] = backendUser.name?.split(' ') || [''];
  return {
    id: backendUser.id,
    email: backendUser.email,
    firstName: firstName || '',
    lastName: lastNameParts.join(' ') || '',
    username: backendUser.email?.split('@')[0] || '',
    isPaid: backendUser.isPaid ?? false,
    plan: backendUser.plan ?? null,
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
};

export default userService;
