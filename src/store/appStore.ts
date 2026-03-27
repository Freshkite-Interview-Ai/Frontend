import { create } from 'zustand';
import { Concept, Resume, Interview, ResumeImprovements } from '@/types';

interface AppState {
  // Concepts
  concepts: Concept[];
  selectedConcept: Concept | null;
  conceptsLoading: boolean;

  // Resume
  resume: Resume | null;
  resumeLoading: boolean;
  resumeImprovements: ResumeImprovements | null;
  resumeImprovementsLoading: boolean;

  // Interview
  currentInterview: Interview | null;
  interviews: Interview[];
  interviewLoading: boolean;

  // UI State
  sidebarOpen: boolean;
  modalOpen: string | null;
}

interface AppActions {
  // Concepts
  setConcepts: (concepts: Concept[]) => void;
  setSelectedConcept: (concept: Concept | null) => void;
  setConceptsLoading: (loading: boolean) => void;

  // Resume
  setResume: (resume: Resume | null) => void;
  setResumeLoading: (loading: boolean) => void;
  setResumeImprovements: (improvements: ResumeImprovements | null) => void;
  setResumeImprovementsLoading: (loading: boolean) => void;

  // Interview
  setCurrentInterview: (interview: Interview | null) => void;
  setInterviews: (interviews: Interview[]) => void;
  setInterviewLoading: (loading: boolean) => void;

  // UI State
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;

  // Reset
  reset: () => void;
}

const initialState: AppState = {
  concepts: [],
  selectedConcept: null,
  conceptsLoading: false,
  resume: null,
  resumeLoading: false,
  resumeImprovements: null,
  resumeImprovementsLoading: false,
  currentInterview: null,
  interviews: [],
  interviewLoading: false,
  sidebarOpen: true,
  modalOpen: null,
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  // Concepts
  setConcepts: (concepts) => set({ concepts }),
  setSelectedConcept: (concept) => set({ selectedConcept: concept }),
  setConceptsLoading: (loading) => set({ conceptsLoading: loading }),

  // Resume
  setResume: (resume) => set({ resume }),
  setResumeLoading: (loading) => set({ resumeLoading: loading }),
  setResumeImprovements: (improvements) => set({ resumeImprovements: improvements }),
  setResumeImprovementsLoading: (loading) => set({ resumeImprovementsLoading: loading }),

  // Interview
  setCurrentInterview: (interview) => set({ currentInterview: interview }),
  setInterviews: (interviews) => set({ interviews }),
  setInterviewLoading: (loading) => set({ interviewLoading: loading }),

  // UI State
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null }),

  // Reset
  reset: () => set(initialState),
}));

export default useAppStore;
