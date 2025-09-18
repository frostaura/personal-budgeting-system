import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account } from '@/types/money';
import { LoadingState } from '@/types/common';

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
    addAccount: (state, action: PayloadAction<Account>) => {
      state.accounts.push(action.payload);
    },
    updateAccount: (state, action: PayloadAction<Account>) => {
      const index = state.accounts.findIndex(
        acc => acc.id === action.payload.id
      );
      if (index !== -1) {
        state.accounts[index] = action.payload;
      }
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      state.accounts = state.accounts.filter(acc => acc.id !== action.payload);
      if (state.selectedAccountId === action.payload) {
        state.selectedAccountId = null;
      }
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
});

export const {
  setLoading,
  setError,
  setAccounts,
  addAccount,
  updateAccount,
  removeAccount,
  selectAccount,
  updateAccountBalance,
} = accountsSlice.actions;

export default accountsSlice.reducer;
