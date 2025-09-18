import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cashflow } from '@/types/money';
import { LoadingState } from '@/types/common';
import { dataService } from '@/services/dataService';

// Async thunks for data operations
const fetchCashflows = createAsyncThunk(
  'cashflows/fetchCashflows',
  async () => {
    return await dataService.getCashflows();
  }
);

const createCashflow = createAsyncThunk(
  'cashflows/createCashflow',
  async (cashflow: Cashflow) => {
    return await dataService.saveCashflow(cashflow);
  }
);

const updateCashflowThunk = createAsyncThunk(
  'cashflows/updateCashflow',
  async (cashflow: Cashflow) => {
    return await dataService.saveCashflow(cashflow);
  }
);

const deleteCashflowThunk = createAsyncThunk(
  'cashflows/deleteCashflow',
  async (id: string) => {
    await dataService.deleteCashflow(id);
    return id;
  }
);

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
    selectCashflow: (state, action: PayloadAction<string | null>) => {
      state.selectedCashflowId = action.payload;
    },
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
    },
    clearFilters: state => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cashflows
      .addCase(fetchCashflows.pending, (state) => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(fetchCashflows.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.cashflows = action.payload;
      })
      .addCase(fetchCashflows.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch cashflows';
      })
      // Create cashflow
      .addCase(createCashflow.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(createCashflow.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.cashflows.push(action.payload);
      })
      .addCase(createCashflow.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to create cashflow';
      })
      // Update cashflow
      .addCase(updateCashflowThunk.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(updateCashflowThunk.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const index = state.cashflows.findIndex(cf => cf.id === action.payload.id);
        if (index !== -1) {
          state.cashflows[index] = action.payload;
        }
      })
      .addCase(updateCashflowThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to update cashflow';
      })
      // Delete cashflow
      .addCase(deleteCashflowThunk.pending, (state) => {
        state.loading = 'loading';
      })
      .addCase(deleteCashflowThunk.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.cashflows = state.cashflows.filter(cf => cf.id !== action.payload);
        if (state.selectedCashflowId === action.payload) {
          state.selectedCashflowId = null;
        }
      })
      .addCase(deleteCashflowThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to delete cashflow';
      });
  },
});

export const {
  setLoading,
  setError,
  setCashflows,
  selectCashflow,
  setFilters,
  clearFilters,
} = cashflowsSlice.actions;

export {
  fetchCashflows,
  createCashflow,
  updateCashflowThunk,
  deleteCashflowThunk,
};

export default cashflowsSlice.reducer;
