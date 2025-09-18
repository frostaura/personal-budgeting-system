import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Account } from '@/types/money';
import { LoadingState } from '@/types/common';
import { dataService } from '@/services/dataService';

// Async thunks for data operations
const fetchAccounts = createAsyncThunk('accounts/fetchAccounts', async () => {
  return await dataService.getAccounts();
});

const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (account: Account) => {
    return await dataService.saveAccount(account);
  }
);

const updateAccountThunk = createAsyncThunk(
  'accounts/updateAccount',
  async (account: Account) => {
    return await dataService.saveAccount(account);
  }
);

const deleteAccountThunk = createAsyncThunk(
  'accounts/deleteAccount',
  async (id: string) => {
    await dataService.deleteAccount(id);
    return id;
  }
);

interface AccountsState {
  accounts: Account[];
  loading: LoadingState;
  error: string | null;
  selectedAccountId: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  loading: 'idle',
  error: null,
  selectedAccountId: null,
};

const accountsSlice = createSlice({
  name: 'accounts',
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
    setAccounts: (state, action: PayloadAction<Account[]>) => {
      state.accounts = action.payload;
      state.loading = 'succeeded';
      state.error = null;
    },
    selectAccount: (state, action: PayloadAction<string | null>) => {
      state.selectedAccountId = action.payload;
    },
    updateAccountBalance: (
      state,
      action: PayloadAction<{ id: string; balanceCents: number; asOf: string }>
    ) => {
      const account = state.accounts.find(acc => acc.id === action.payload.id);
      if (account) {
        account.openingBalanceCents = action.payload.balanceCents;
        account.currentBalanceAsOf = action.payload.asOf;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, state => {
        state.loading = 'loading';
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      // Create account
      .addCase(createAccount.pending, state => {
        state.loading = 'loading';
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.accounts.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to create account';
      })
      // Update account
      .addCase(updateAccountThunk.pending, state => {
        state.loading = 'loading';
      })
      .addCase(updateAccountThunk.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        const index = state.accounts.findIndex(
          acc => acc.id === action.payload.id
        );
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(updateAccountThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to update account';
      })
      // Delete account
      .addCase(deleteAccountThunk.pending, state => {
        state.loading = 'loading';
      })
      .addCase(deleteAccountThunk.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.accounts = state.accounts.filter(
          acc => acc.id !== action.payload
        );
        if (state.selectedAccountId === action.payload) {
          state.selectedAccountId = null;
        }
      })
      .addCase(deleteAccountThunk.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to delete account';
      });
  },
});

export const {
  setLoading,
  setError,
  setAccounts,
  selectAccount,
  updateAccountBalance,
} = accountsSlice.actions;

export { fetchAccounts, createAccount, updateAccountThunk, deleteAccountThunk };

export default accountsSlice.reducer;
