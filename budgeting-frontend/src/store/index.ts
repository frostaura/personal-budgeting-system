import { configureStore } from '@reduxjs/toolkit';
import accountsReducer from './slices/accountsSlice';
import transactionsReducer from './slices/transactionsSlice';
import dashboardReducer from './slices/dashboardSlice';
import categoriesReducer from './slices/categoriesSlice';
import budgetsReducer from './slices/budgetsSlice';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    transactions: transactionsReducer,
    dashboard: dashboardReducer,
    categories: categoriesReducer,
    budgets: budgetsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;