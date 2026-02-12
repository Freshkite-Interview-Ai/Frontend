import axios from 'axios';
import { CompanyCandidateSummary, CompanyCandidateDetails } from '@/types';
import { companyAuthService } from './companyAuthService';

const COMPANY_API_URL = process.env.NEXT_PUBLIC_COMPANY_API_URL || 'http://localhost:3002/api/v1';

export interface CandidateSearchFilters {
  skills?: string[];
  education?: string;
  minYears?: number | null;
  maxYears?: number | null;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface CompanyCandidatesResponse {
  success?: boolean;
  data?: CompanyCandidateSummary[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CompanyCandidateDetailsResponse {
  success?: boolean;
  data?: CompanyCandidateDetails;
}

const buildParams = (filters: CandidateSearchFilters) => {
  const params: Record<string, string | number> = {};

  if (filters.skills && filters.skills.length > 0) {
    params.skills = filters.skills.join(',');
  }

  if (filters.education) params.education = filters.education;
  if (filters.role) params.role = filters.role;
  if (filters.search) params.search = filters.search;
  if (typeof filters.minYears === 'number') params.minYears = filters.minYears;
  if (typeof filters.maxYears === 'number') params.maxYears = filters.maxYears;
  if (typeof filters.page === 'number') params.page = filters.page;
  if (typeof filters.limit === 'number') params.limit = filters.limit;

  return params;
};

const withAuthHeader = () => {
  const token = companyAuthService.getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const companyCandidatesService = {
  searchCandidates: async (filters: CandidateSearchFilters) => {
    const response = await axios.get<CompanyCandidatesResponse>(
      `${COMPANY_API_URL}/company/candidates`,
      {
        params: buildParams(filters),
        headers: withAuthHeader(),
      }
    );

    return response.data;
  },
  getCandidateDetails: async (candidateId: string) => {
    const response = await axios.get<CompanyCandidateDetailsResponse>(
      `${COMPANY_API_URL}/company/candidates/${candidateId}`,
      {
        headers: withAuthHeader(),
      }
    );

    return response.data;
  },
};

export default companyCandidatesService;
