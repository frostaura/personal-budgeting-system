import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDashboardOverview, fetchAccountBalances, fetchMonthlyTrends } from '../store/slices/dashboardSlice';
import { useOnboarding } from '../contexts/OnboardingContext';
import { dashboardOnboardingSteps } from '../config/onboardingSteps';
import OverviewCards from './OverviewCards';
import AccountsChart from './AccountsChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import { mockOverview, mockAccountBalances, mockMonthlyTrends } from '../data/mockData';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { overview, accountBalances, monthlyTrends, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );
  const { state: onboardingState, startOnboarding } = useOnboarding();

  useEffect(() => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchAccountBalances());
    dispatch(fetchMonthlyTrends());
  }, [dispatch]);

  // Auto-start onboarding for new users
  useEffect(() => {
    if (!onboardingState.isCompleted && !onboardingState.isActive && overview) {
      // Add a small delay to ensure components are mounted
      const timer = setTimeout(() => {
        startOnboarding(dashboardOnboardingSteps);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [onboardingState.isCompleted, onboardingState.isActive, overview, startOnboarding]);

  const handleRetry = () => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchAccountBalances());
    dispatch(fetchMonthlyTrends());
  };

  // Use mock data for development when API is not available
  const useMockData = error && error.includes('Network Error');
  const displayOverview = useMockData ? mockOverview : overview;
  const displayAccountBalances = useMockData ? mockAccountBalances : accountBalances;
  const displayMonthlyTrends = useMockData ? mockMonthlyTrends : monthlyTrends;

  if (loading && !useMockData) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Personal Budget Dashboard</h1>
          <p>Track your finances with modern insights</p>
        </header>
        <LoadingSpinner message="Loading your financial data..." />
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Personal Budget Dashboard</h1>
          <p>Track your finances with modern insights</p>
        </header>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Personal Budget Dashboard</h1>
        <p>Track your finances with modern insights</p>
      </header>

      {displayOverview && <OverviewCards overview={displayOverview} />}

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Account Balances</h3>
          <AccountsChart accountBalances={displayAccountBalances} />
        </div>

        <div className="chart-container">
          <h3>Monthly Trends</h3>
          <MonthlyTrendsChart monthlyTrends={displayMonthlyTrends} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;