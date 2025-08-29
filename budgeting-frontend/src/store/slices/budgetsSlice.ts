import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Budget } from '../../types';
import { budgetsApi } from '../../services/api';

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  loading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchBudgets',
  async () => {
    const response = await budgetsApi.getAll();
    return response.data;
  }
);

export const createBudget = createAsyncThunk(
  'budgets/createBudget',
  async (budget: Partial<Budget>) => {
    const response = await budgetsApi.create(budget);
    return response.data;
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budget }: { id: number; budget: Partial<Budget> }) => {
    await budgetsApi.update(id, budget);
    return { id, ...budget };
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: number) => {
    await budgetsApi.delete(id);
    return id;
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
      })
      // Create budget
      .addCase(createBudget.fulfilled, (state, action: PayloadAction<Budget>) => {
        state.budgets.push(action.payload);
      })
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
        if (index !== -1) {
          state.budgets[index] = { ...state.budgets[index], ...action.payload };
        }
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action: PayloadAction<number>) => {
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
      });
  },
});

export default budgetsSlice.reducer;