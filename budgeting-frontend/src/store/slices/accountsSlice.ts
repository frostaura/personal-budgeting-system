import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Account } from '../../types';
import { accountsApi } from '../../services/api';

interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async () => {
    const response = await accountsApi.getAll();
    return response.data;
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (account: Partial<Account>) => {
    const response = await accountsApi.create(account);
    return response.data;
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ id, account }: { id: number; account: Partial<Account> }) => {
    await accountsApi.update(id, account);
    return { id, ...account };
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: number) => {
    await accountsApi.delete(id);
    return id;
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<Account[]>) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      // Create account
      .addCase(createAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.accounts.push(action.payload);
      })
      // Update account
      .addCase(updateAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(acc => acc.id === action.payload.id);
        if (index !== -1) {
          state.accounts[index] = { ...state.accounts[index], ...action.payload };
        }
      })
      // Delete account
      .addCase(deleteAccount.fulfilled, (state, action: PayloadAction<number>) => {
        state.accounts = state.accounts.filter(acc => acc.id !== action.payload);
      });
  },
});

export default accountsSlice.reducer;