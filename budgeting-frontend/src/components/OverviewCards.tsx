import React from 'react';
import { DashboardOverview } from '../types';

interface OverviewCardsProps {
  overview: DashboardOverview;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="overview-cards">
      <div className="card glass-card net-worth">
        <div className="card-icon">💰</div>
        <div className="card-content">
          <h3>Net Worth</h3>
          <p className="card-value">{formatCurrency(overview.netWorth)}</p>
        </div>
      </div>

      <div className="card glass-card income">
        <div className="card-icon">📈</div>
        <div className="card-content">
          <h3>Monthly Income</h3>
          <p className="card-value">{formatCurrency(overview.monthlyIncome)}</p>
        </div>
      </div>

      <div className="card glass-card expenses">
        <div className="card-icon">📊</div>
        <div className="card-content">
          <h3>Monthly Expenses</h3>
          <p className="card-value">{formatCurrency(overview.monthlyExpenses)}</p>
        </div>
      </div>

      <div className="card glass-card investments">
        <div className="card-icon">💎</div>
        <div className="card-content">
          <h3>Monthly Investments</h3>
          <p className="card-value">{formatCurrency(overview.monthlyInvestments)}</p>
        </div>
      </div>

      <div className="card glass-card savings-rate">
        <div className="card-icon">🎯</div>
        <div className="card-content">
          <h3>Savings Rate</h3>
          <p className="card-value">{formatPercentage(overview.savingsRate)}</p>
        </div>
      </div>

      <div className="card glass-card accounts-count">
        <div className="card-icon">🏦</div>
        <div className="card-content">
          <h3>Active Accounts</h3>
          <p className="card-value">{overview.accountsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;