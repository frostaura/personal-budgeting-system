import { DashboardOverview, AccountBalance, MonthlyTrend } from '../types';

export const mockOverview: DashboardOverview = {
  netWorth: 125000,
  monthlyIncome: 8500,
  monthlyExpenses: 4200,
  monthlyInvestments: 2000,
  monthlyTaxes: 1700,
  accountsCount: 6,
  transactionsCount: 142,
  savingsRate: 35.3,
};

export const mockAccountBalances: AccountBalance[] = [
  { name: 'Checking Account', balance: 5240, type: 'Checking', isPositive: true },
  { name: 'Savings Account', balance: 42000, type: 'Savings', isPositive: true },
  { name: 'Investment Portfolio', balance: 78500, type: 'Investment', isPositive: true },
  { name: 'Credit Card', balance: -2400, type: 'CreditCard', isPositive: false },
  { name: 'Emergency Fund', balance: 15000, type: 'Savings', isPositive: true },
  { name: 'Retirement 401k', balance: 125000, type: 'Investment', isPositive: true },
];

export const mockMonthlyTrends: MonthlyTrend[] = [
  { month: 'Jan 2024', income: 8200, expenses: 4100, investments: 1800 },
  { month: 'Feb 2024', income: 8400, expenses: 3900, investments: 2100 },
  { month: 'Mar 2024', income: 8300, expenses: 4300, investments: 1900 },
  { month: 'Apr 2024', income: 8600, expenses: 4200, investments: 2000 },
  { month: 'May 2024', income: 8500, expenses: 4000, investments: 2200 },
  { month: 'Jun 2024', income: 8800, expenses: 4400, investments: 2000 },
  { month: 'Jul 2024', income: 8500, expenses: 4200, investments: 2000 },
];