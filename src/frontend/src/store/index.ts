import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import all slice reducers
import appReducer from './slices/appSlice';
import accountsReducer from './slices/accountsSlice';
import cashflowsReducer from './slices/cashflowsSlice';
import scenariosReducer from './slices/scenariosSlice';
import projectionsReducer from './slices/projectionsSlice';
import settingsReducer from './slices/settingsSlice';

const rootReducer = combineReducers({
  app: appReducer,
  accounts: accountsReducer,
  cashflows: cashflowsReducer,
  scenarios: scenariosReducer,
  projections: projectionsReducer,
  settings: settingsReducer,
});

const persistConfig = {
  key: 'pfp-root',
  storage,
  // Only persist certain slices to avoid performance issues
  whitelist: ['accounts', 'cashflows', 'scenarios', 'settings'],
  // Blacklist sensitive or temporary data
  blacklist: ['app', 'projections'],
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export { useAppDispatch, useAppSelector } from './hooks';