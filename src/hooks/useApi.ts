'use client';

import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '@/types';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface UseApiReturn<T, P extends any[]> extends UseApiState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export function useApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<{ data: T } | T>
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await apiFunction(...params);
        const data = (typeof result === 'object' && result !== null && 'data' in result) 
          ? (result as { data: T }).data 
          : result as T;
        setState({ data, isLoading: false, error: null });
        return data;
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        const apiError: ApiError = {
          success: false,
          message:
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred',
          code: error.code,
        };
        setState({ data: null, isLoading: false, error: apiError });
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

export default useApi;
