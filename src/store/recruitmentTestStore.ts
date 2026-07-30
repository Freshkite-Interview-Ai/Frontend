import { create } from 'zustand';
import { RecruitmentTest } from '@/types';

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

interface RecruitmentTestState {
  tests: RecruitmentTest[];
  total: number;
  fetchedAt: number | null;
  isLoading: boolean;
  error: string;
}

interface RecruitmentTestActions {
  setLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  setTests: (tests: RecruitmentTest[], total?: number) => void;
  clearCache: () => void;
  isCacheFresh: (ttlMs?: number) => boolean;
}

const initialState: RecruitmentTestState = {
  tests: [],
  total: 0,
  fetchedAt: null,
  isLoading: false,
  error: '',
};

export const useRecruitmentTestStore = create<RecruitmentTestState & RecruitmentTestActions>((set, get) => ({
  ...initialState,

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setTests: (tests, total) =>
    set({
      tests,
      total: total ?? tests.length,
      fetchedAt: Date.now(),
      error: '',
      isLoading: false,
    }),

  clearCache: () => set({ ...initialState }),

  isCacheFresh: (ttlMs = DEFAULT_CACHE_TTL_MS) => {
    const { fetchedAt } = get();
    if (!fetchedAt) {
      return false;
    }
    return Date.now() - fetchedAt < ttlMs;
  },
}));

export default useRecruitmentTestStore;
