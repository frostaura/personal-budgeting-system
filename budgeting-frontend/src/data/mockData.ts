import { DashboardOverview, AccountBalance, MonthlyTrend, Category, CategoryType, Budget, BudgetPeriod } from '../types';

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

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Salary',
    type: CategoryType.Income,
    description: 'Monthly salary and bonuses',
    color: '#10b981',
    isActive: true,
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Groceries',
    type: CategoryType.Expense,
    description: 'Food and household items',
    color: '#ef4444',
    isActive: true,
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Transportation',
    type: CategoryType.Expense,
    description: 'Gas, public transport, car maintenance',
    color: '#f59e0b',
    isActive: true,
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Stocks',
    type: CategoryType.Investment,
    description: 'Stock market investments',
    color: '#8b5cf6',
    isActive: true,
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    name: 'Entertainment',
    type: CategoryType.Expense,
    description: 'Movies, dining out, hobbies',
    color: '#ec4899',
    isActive: true,
    userId: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

export const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Monthly Groceries',
    amount: 600,
    spent: 420,
    period: BudgetPeriod.Monthly,
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    isActive: true,
    description: 'Budget for groceries and household items',
    userId: 1,
    categoryId: 2,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-15T12:00:00Z',
    category: mockCategories[1], // Groceries
    remainingAmount: 180,
    spentPercentage: 70
  },
  {
    id: 2,
    name: 'Transportation Budget',
    amount: 300,
    spent: 245,
    period: BudgetPeriod.Monthly,
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    isActive: true,
    description: 'Monthly transportation expenses',
    userId: 1,
    categoryId: 3,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-20T10:00:00Z',
    category: mockCategories[2], // Transportation
    remainingAmount: 55,
    spentPercentage: 81.67
  },
  {
    id: 3,
    name: 'Entertainment Fund',
    amount: 200,
    spent: 250,
    period: BudgetPeriod.Monthly,
    startDate: '2024-08-01T00:00:00Z',
    endDate: '2024-08-31T23:59:59Z',
    isActive: true,
    description: 'Fun activities and dining out',
    userId: 1,
    categoryId: 5,
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-25T14:30:00Z',
    category: mockCategories[4], // Entertainment
    remainingAmount: -50,
    spentPercentage: 125
  }
];