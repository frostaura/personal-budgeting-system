import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Scenario } from '@/types/money';
import { LoadingState } from '@/types/common';

interface ScenariosState {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  loading: LoadingState;
  error: string | null;
}

const initialState: ScenariosState = {
  scenarios: [
    {
      id: 'baseline',
      name: 'Baseline',
      spendAdjustmentPct: 0,
      scope: 'all',
      inflationPct: 0.06, // 6% annual inflation
      salaryGrowthPct: 0.05, // 5% annual salary growth
    },
  ],
  activeScenarioId: 'baseline',
  loading: 'idle',
  error: null,
};

const scenariosSlice = createSlice({
  name: 'scenarios',
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
    setScenarios: (state, action: PayloadAction<Scenario[]>) => {
      state.scenarios = action.payload;
      state.loading = 'succeeded';
      state.error = null;
    },
    addScenario: (state, action: PayloadAction<Scenario>) => {
      state.scenarios.push(action.payload);
    },
    updateScenario: (state, action: PayloadAction<Scenario>) => {
      const index = state.scenarios.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.scenarios[index] = action.payload;
      }
    },
    removeScenario: (state, action: PayloadAction<string>) => {
      // Don't allow removing the baseline scenario
      if (action.payload === 'baseline') return;

      state.scenarios = state.scenarios.filter(s => s.id !== action.payload);
      if (state.activeScenarioId === action.payload) {
        state.activeScenarioId = 'baseline';
      }
    },
    setActiveScenario: (state, action: PayloadAction<string>) => {
      const scenarioExists = state.scenarios.some(s => s.id === action.payload);
      if (scenarioExists) {
        state.activeScenarioId = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setScenarios,
  addScenario,
  updateScenario,
  removeScenario,
  setActiveScenario,
} = scenariosSlice.actions;

export default scenariosSlice.reducer;
