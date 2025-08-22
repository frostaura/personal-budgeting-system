import axios from 'axios';
import { 
  Account, 
  Transaction, 
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

export default api;