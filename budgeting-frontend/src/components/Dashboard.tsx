import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDashboardOverview, fetchAccountBalances, fetchMonthlyTrends } from '../store/slices/dashboardSlice';
import OverviewCards from './OverviewCards';
import AccountsChart from './AccountsChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import { mockOverview, mockAccountBalances, mockMonthlyTrends } from '../data/mockData';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { overview, accountBalances, monthlyTrends, loading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchAccountBalances());
    dispatch(fetchMonthlyTrends());
  }, [dispatch]);

  // Use mock data for development when API is not available
  const useMockData = error && error.includes('Network Error');
  const displayOverview = useMockData ? mockOverview : overview;
  const displayAccountBalances = useMockData ? mockAccountBalances : accountBalances;
  const displayMonthlyTrends = useMockData ? mockMonthlyTrends : monthlyTrends;

  if (loading && !useMockData) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="dashboard error">
        <div className="error-message">Error: {error}</div>
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