import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectionResult, AuditEntry } from '@/types/money';
import { LoadingState } from '@/types/common';

interface ProjectionsState {
  currentProjection: ProjectionResult | null;
  loading: LoadingState;
  error: string | null;
  auditTrail: AuditEntry[];
  projectionParameters: {
    startDate: string; // ISO date
    endDate: string; // ISO date
    scenarioId: string;
  };
  lastCalculated: string | null; // ISO timestamp
}

const initialState: ProjectionsState = {
  currentProjection: null,
  loading: 'idle',
  error: null,
  auditTrail: [],
  projectionParameters: {
    startDate: new Date().toISOString().split('T')[0]!, // Today
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5)
      .toISOString()
      .split('T')[0]!, // 5 years from now
    scenarioId: 'baseline',
  },
  lastCalculated: null,
};

const projectionsSlice = createSlice({
  name: 'projections',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<LoadingState>) => {
      state.loading = action.payload;
      if (action.payload === 'loading') {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = 'failed';
    },
    setProjection: (state, action: PayloadAction<ProjectionResult>) => {
      state.currentProjection = action.payload;
      state.loading = 'succeeded';
      state.error = null;
      state.lastCalculated = new Date().toISOString();
    },
    setProjectionParameters: (
      state,
      action: PayloadAction<Partial<typeof initialState.projectionParameters>>
    ) => {
      state.projectionParameters = {
        ...state.projectionParameters,
        ...action.payload,
      };
    },
    addAuditEntry: (state, action: PayloadAction<AuditEntry>) => {
      state.auditTrail.push(action.payload);
      // Keep only the last 100 entries to prevent memory issues
      if (state.auditTrail.length > 100) {
        state.auditTrail = state.auditTrail.slice(-100);
      }
    },
    clearProjection: state => {
      state.currentProjection = null;
      state.loading = 'idle';
      state.error = null;
      state.lastCalculated = null;
    },
    clearAuditTrail: state => {
      state.auditTrail = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setProjection,
  setProjectionParameters,
  addAuditEntry,
  clearProjection,
  clearAuditTrail,
} = projectionsSlice.actions;

export default projectionsSlice.reducer;
