import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Cashflow } from '@/types/money';
import { LoadingState } from '@/types/common';

interface CashflowsState {
  cashflows: Cashflow[];
  loading: LoadingState;
  error: string | null;
  selectedCashflowId: string | null;
  filters: {
    accountId?: string;
    frequency?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

const initialState: CashflowsState = {
  cashflows: [],
  loading: 'idle',
  error: null,
  selectedCashflowId: null,
  filters: {},
};

const cashflowsSlice = createSlice({
  name: 'cashflows',
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
    setCashflows: (state, action: PayloadAction<Cashflow[]>) => {
      state.cashflows = action.payload;
      state.loading = 'succeeded';
      state.error = null;
    },
    addCashflow: (state, action: PayloadAction<Cashflow>) => {
      state.cashflows.push(action.payload);
    },
    updateCashflow: (state, action: PayloadAction<Cashflow>) => {
      const index = state.cashflows.findIndex(cf => cf.id === action.payload.id);
      if (index !== -1) {
        state.cashflows[index] = action.payload;
      }
    },
    removeCashflow: (state, action: PayloadAction<string>) => {
      state.cashflows = state.cashflows.filter(cf => cf.id !== action.payload);
      if (state.selectedCashflowId === action.payload) {
        state.selectedCashflowId = null;
      }
    },
    selectCashflow: (state, action: PayloadAction<string | null>) => {
      state.selectedCashflowId = action.payload;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setLoading,
  setError,
  setCashflows,
  addCashflow,
  updateCashflow,
  removeCashflow,
  selectCashflow,
  setFilters,
  clearFilters,
} = cashflowsSlice.actions;

export default cashflowsSlice.reducer;