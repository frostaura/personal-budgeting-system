import axios from 'axios';
import { 
  Account, 
  Transaction, 
  Category,
  Budget,
  DashboardOverview, 
  AccountBalance, 
  MonthlyTrend 
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const accountsApi = {
  getAll: () => api.get<Account[]>('/accounts'),
  getById: (id: number) => api.get<Account>(`/accounts/${id}`),
  create: (account: Partial<Account>) => api.post<Account>('/accounts', account),
  update: (id: number, account: Partial<Account>) => api.put(`/accounts/${id}`, account),
  delete: (id: number) => api.delete(`/accounts/${id}`),
};

export const transactionsApi = {
  getAll: () => api.get<Transaction[]>('/transactions'),
  getById: (id: number) => api.get<Transaction>(`/transactions/${id}`),
  create: (transaction: Partial<Transaction>) => api.post<Transaction>('/transactions', transaction),
  update: (id: number, transaction: Partial<Transaction>) => api.put(`/transactions/${id}`, transaction),
  delete: (id: number) => api.delete(`/transactions/${id}`),
};

export const dashboardApi = {
  getOverview: () => api.get<DashboardOverview>('/dashboard/overview'),
  getAccountBalances: () => api.get<AccountBalance[]>('/dashboard/account-balances'),
  getMonthlyTrends: () => api.get<MonthlyTrend[]>('/dashboard/monthly-trends'),
};

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
  getById: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (category: Partial<Category>) => api.post<Category>('/categories', category),
  update: (id: number, category: Partial<Category>) => api.put(`/categories/${id}`, category),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const budgetsApi = {
  getAll: () => api.get<Budget[]>('/budgets'),
  getById: (id: number) => api.get<Budget>(`/budgets/${id}`),
  create: (budget: Partial<Budget>) => api.post<Budget>('/budgets', budget),
  update: (id: number, budget: Partial<Budget>) => api.put(`/budgets/${id}`, budget),
  delete: (id: number) => api.delete(`/budgets/${id}`),
};

export default api;