import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeMode, ToastMessage, LoadingState } from '@/types/common';

interface AppState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  toasts: ToastMessage[];
  globalLoading: LoadingState;
  errors: string[];
  lastActivity: string; // ISO timestamp
  isOnline: boolean;
}

const initialState: AppState = {
  theme: 'system',
  sidebarOpen: true,
  toasts: [],
  globalLoading: 'idle',
  errors: [],
  lastActivity: new Date().toISOString(),
  isOnline: navigator.onLine,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const toast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random()}`,
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    clearAllToasts: state => {
      state.toasts = [];
    },
    setGlobalLoading: (state, action: PayloadAction<LoadingState>) => {
      state.globalLoading = action.payload;
    },
    addError: (state, action: PayloadAction<string>) => {
      state.errors.push(action.payload);
    },
    removeError: (state, action: PayloadAction<number>) => {
      state.errors.splice(action.payload, 1);
    },
    clearErrors: state => {
      state.errors = [];
    },
    updateLastActivity: state => {
      state.lastActivity = new Date().toISOString();
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  addToast,
  removeToast,
  clearAllToasts,
  setGlobalLoading,
  addError,
  removeError,
  clearErrors,
  updateLastActivity,
  setOnlineStatus,
} = appSlice.actions;

export default appSlice.reducer;
