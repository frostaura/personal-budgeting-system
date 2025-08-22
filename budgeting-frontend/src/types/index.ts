export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  creditLimit: number;
  isActive: boolean;
  description: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export enum AccountType {
  Checking = 0,
  Savings = 1,
  CreditCard = 2,
  Investment = 3,
  Loan = 4,
  Other = 5
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  isRecurring: boolean;
  recurrencePattern: string;
  nextRecurrenceDate?: string;
  notes: string;
  userId: number;
  accountId: number;
  categoryId?: number;
  toAccountId?: number;
  createdAt: string;
  updatedAt: string;
  account?: Account;
  category?: Category;
  toAccount?: Account;
}

export enum TransactionType {
  Income = 0,
  Expense = 1,
  Transfer = 2,
  Investment = 3
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
  description: string;
  color: string;
  isActive: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export enum CategoryType {
  Income = 0,
  Expense = 1,
  Investment = 2,
  Transfer = 3
}

export interface Budget {
  id: number;
  name: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  isActive: boolean;
  description: string;
  userId: number;
  categoryId?: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  remainingAmount: number;
  spentPercentage: number;
}

export enum BudgetPeriod {
  Monthly = 0,
  Yearly = 1,
  Weekly = 2,
  Custom = 3
}

export interface DashboardOverview {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyInvestments: number;
  monthlyTaxes: number;
  accountsCount: number;
  transactionsCount: number;
  savingsRate: number;
}

export interface AccountBalance {
  name: string;
  balance: number;
  type: string;
  isPositive: boolean;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  investments: number;
}