import React, { useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCashflows } from '@/store/slices/cashflowsSlice';
import { setSidebarOpen } from '@/store/slices/appSlice';
import { initializeSampleData } from '@/services/sampleData';

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Set responsive sidebar state on mount and resize
  useEffect(() => {
    // Set sidebar closed on mobile, open on desktop
    dispatch(setSidebarOpen(!isMobile));
  }, [dispatch, isMobile]);

  return <>{children}</>;
};
