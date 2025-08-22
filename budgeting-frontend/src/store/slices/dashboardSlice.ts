import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardOverview, AccountBalance, MonthlyTrend } from '../../types';
import { dashboardApi } from '../../services/api';

interface DashboardState {
  overview: DashboardOverview | null;
  accountBalances: AccountBalance[];
  monthlyTrends: MonthlyTrend[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  overview: null,
  accountBalances: [],
  monthlyTrends: [],
  loading: false,
  error: null,
};

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async () => {
    const response = await dashboardApi.getOverview();
    return response.data;
  }
);

export const fetchAccountBalances = createAsyncThunk(
  'dashboard/fetchAccountBalances',
  async () => {
    const response = await dashboardApi.getAccountBalances();
    return response.data;
  }
);

export const fetchMonthlyTrends = createAsyncThunk(
  'dashboard/fetchMonthlyTrends',
  async () => {
    const response = await dashboardApi.getMonthlyTrends();
    return response.data;
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action: PayloadAction<DashboardOverview>) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard overview';
      })
      // Fetch account balances
      .addCase(fetchAccountBalances.fulfilled, (state, action: PayloadAction<AccountBalance[]>) => {
        state.accountBalances = action.payload;
      })
      // Fetch monthly trends
      .addCase(fetchMonthlyTrends.fulfilled, (state, action: PayloadAction<MonthlyTrend[]>) => {
        state.monthlyTrends = action.payload;
      });
  },
});

export default dashboardSlice.reducer;