import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { signOut } from 'next-auth/react';
import { backendAuthService } from './backendAuth';
import logger from '@/lib/logger';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Request interceptor - attach our backend JWT to all requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get our backend JWT (with auto-refresh if expired)
    const accessToken = await backendAuthService.getAccessToken();
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    logger.error('api', 'Request interceptor error', {
      message: error.message,
      code: error.code,
    });
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await backendAuthService.refreshAccessToken();
        
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        logger.warn('api', 'Token refresh failed during retry', refreshError);
      }

      // Refresh failed, logout
      backendAuthService.clearTokens();
      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/login' });
      }
    }

    logger.error('api', 'API request failed', {
      status: error.response?.status,
      path: originalRequest?.url,
      method: originalRequest?.method,
      message: error.message,
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;
