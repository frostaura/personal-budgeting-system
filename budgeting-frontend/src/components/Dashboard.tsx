import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchDashboardOverview, fetchAccountBalances, fetchMonthlyTrends } from '../store/slices/dashboardSlice';
import OverviewCards from './OverviewCards';
import AccountsChart from './AccountsChart';
import MonthlyTrendsChart from './MonthlyTrendsChart';
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

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
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

      {overview && <OverviewCards overview={overview} />}

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Account Balances</h3>
          <AccountsChart accountBalances={accountBalances} />
        </div>

        <div className="chart-container">
          <h3>Monthly Trends</h3>
          <MonthlyTrendsChart monthlyTrends={monthlyTrends} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;