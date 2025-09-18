import React, { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCashflows } from '@/store/slices/cashflowsSlice';
import { initializeSampleData } from '@/services/sampleData';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize sample data if needed
        await initializeSampleData();

        // Load data into Redux store
        dispatch(fetchAccounts());
        dispatch(fetchCashflows());
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  return <>{children}</>;
};
