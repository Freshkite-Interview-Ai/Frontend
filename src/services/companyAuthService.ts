import axios from 'axios';
import { CompanyProfile } from '@/types';

const COMPANY_API_URL = process.env.NEXT_PUBLIC_COMPANY_API_URL || 'http://localhost:3002/api/v1';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'company_access_token',
  COMPANY: 'company_profile',
};

interface CompanyAuthResponse {
  success?: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    company?: {
      id: string;
      companyName: string;
      email: string;
      industry?: string;
      createdAt?: string;
    };
  };
}

const resolveAuthPayload = (payload: CompanyAuthResponse) => {
  const token = payload.data?.accessToken || '';
  const company = payload.data?.company || null;

  return { token, company };
};

export const companyAuthService = {
  login: async (email: string, password: string) => {
    const response = await axios.post<CompanyAuthResponse>(
      `${COMPANY_API_URL}/company/login`,
      { email, password }
    );

    const { token, company } = resolveAuthPayload(response.data || {});
    if (!token || !company) {
      throw new Error('Invalid company login response');
    }

    companyAuthService.setSession(token, company);
    return { token, company };
  },

  signup: async (companyName: string, email: string, password: string) => {
    const response = await axios.post<CompanyAuthResponse>(
      `${COMPANY_API_URL}/company/signup`,
      { companyName, email, password }
    );

    const { token, company } = resolveAuthPayload(response.data || {});
    if (!token || !company) {
      throw new Error('Invalid company signup response');
    }

    companyAuthService.setSession(token, company);
    return { token, company };
  },

  setSession: (token: string, company: CompanyProfile) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
  },

  clearSession: () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.COMPANY);
  },

  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  getCompany: (): CompanyProfile | null => {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(STORAGE_KEYS.COMPANY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  logout: () => {
    companyAuthService.clearSession();
  },
};

export default companyAuthService;
