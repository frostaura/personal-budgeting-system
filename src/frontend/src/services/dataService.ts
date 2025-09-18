import { Account, Cashflow, Scenario } from '@/types/money';
import { DEFAULT_CURRENCY_SETTINGS } from '@/utils/currency';

/**
 * Abstract data access service for financial data
 * Currently implements localStorage but can be easily swapped for API calls
 */
export class DataService {
  private readonly storagePrefix: string;

  constructor(storagePrefix: string = DEFAULT_CURRENCY_SETTINGS.storagePrefix || 'pfp:') {
    this.storagePrefix = storagePrefix;
  }

  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
      throw new Error('Failed to save data');
    }
  }

  private removeItem(key: string): void {
    localStorage.removeItem(this.getStorageKey(key));
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    return this.getItem<Account[]>('accounts') || [];
  }

  async saveAccounts(accounts: Account[]): Promise<void> {
    this.setItem('accounts', accounts);
  }

  async getAccount(id: string): Promise<Account | null> {
    const accounts = await this.getAccounts();
    return accounts.find(account => account.id === id) || null;
  }

  async saveAccount(account: Account): Promise<Account> {
    const accounts = await this.getAccounts();
    const existingIndex = accounts.findIndex(a => a.id === account.id);
    
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    
    await this.saveAccounts(accounts);
    return account;
  }

  async deleteAccount(id: string): Promise<void> {
    const accounts = await this.getAccounts();
    const filteredAccounts = accounts.filter(account => account.id !== id);
    await this.saveAccounts(filteredAccounts);
  }

  // Cashflow operations
  async getCashflows(): Promise<Cashflow[]> {
    return this.getItem<Cashflow[]>('cashflows') || [];
  }

  async saveCashflows(cashflows: Cashflow[]): Promise<void> {
    this.setItem('cashflows', cashflows);
  }

  async getCashflow(id: string): Promise<Cashflow | null> {
    const cashflows = await this.getCashflows();
    return cashflows.find(cashflow => cashflow.id === id) || null;
  }

  async saveCashflow(cashflow: Cashflow): Promise<Cashflow> {
    const cashflows = await this.getCashflows();
    const existingIndex = cashflows.findIndex(cf => cf.id === cashflow.id);
    
    if (existingIndex >= 0) {
      cashflows[existingIndex] = cashflow;
    } else {
      cashflows.push(cashflow);
    }
    
    await this.saveCashflows(cashflows);
    return cashflow;
  }

  async deleteCashflow(id: string): Promise<void> {
    const cashflows = await this.getCashflows();
    const filteredCashflows = cashflows.filter(cashflow => cashflow.id !== id);
    await this.saveCashflows(filteredCashflows);
  }

  // Scenario operations
  async getScenarios(): Promise<Scenario[]> {
    return this.getItem<Scenario[]>('scenarios') || [];
  }

  async saveScenarios(scenarios: Scenario[]): Promise<void> {
    this.setItem('scenarios', scenarios);
  }

  async getScenario(id: string): Promise<Scenario | null> {
    const scenarios = await this.getScenarios();
    return scenarios.find(scenario => scenario.id === id) || null;
  }

  async saveScenario(scenario: Scenario): Promise<Scenario> {
    const scenarios = await this.getScenarios();
    const existingIndex = scenarios.findIndex(s => s.id === scenario.id);
    
    if (existingIndex >= 0) {
      scenarios[existingIndex] = scenario;
    } else {
      scenarios.push(scenario);
    }
    
    await this.saveScenarios(scenarios);
    return scenario;
  }

  async deleteScenario(id: string): Promise<void> {
    const scenarios = await this.getScenarios();
    const filteredScenarios = scenarios.filter(scenario => scenario.id !== id);
    await this.saveScenarios(filteredScenarios);
  }

  // Utility operations
  async clearAllData(): Promise<void> {
    const keys = ['accounts', 'cashflows', 'scenarios'];
    keys.forEach(key => this.removeItem(key));
  }

  async exportData(): Promise<{
    accounts: Account[];
    cashflows: Cashflow[];
    scenarios: Scenario[];
    exportDate: string;
  }> {
    return {
      accounts: await this.getAccounts(),
      cashflows: await this.getCashflows(),
      scenarios: await this.getScenarios(),
      exportDate: new Date().toISOString(),
    };
  }

  async importData(data: {
    accounts?: Account[];
    cashflows?: Cashflow[];
    scenarios?: Scenario[];
  }): Promise<void> {
    if (data.accounts) await this.saveAccounts(data.accounts);
    if (data.cashflows) await this.saveCashflows(data.cashflows);
    if (data.scenarios) await this.saveScenarios(data.scenarios);
  }
}

// Singleton instance
export const dataService = new DataService();