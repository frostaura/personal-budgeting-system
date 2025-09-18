import { Account, Cashflow, Scenario } from '@/types/money';
import { dataService } from './dataService';

export const SAMPLE_ACCOUNTS: Account[] = [
  {
    id: 'acc-checking',
    name: 'Primary Checking Account',
    kind: 'income', // Used for income tracking
    category: 'Banking',
    color: '#4CAF50',
    icon: '💳',
    notes: 'Main bank account for daily transactions',
    openingBalanceCents: 8500000, // R85,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.025, // 2.5%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-savings',
    name: 'High-Yield Savings',
    kind: 'investment',
    category: 'Savings',
    color: '#2196F3',
    icon: '🏦',
    notes: 'Emergency fund and short-term savings',
    openingBalanceCents: 45000000, // R450,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.068, // 6.8%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-investment',
    name: 'Investment Portfolio',
    kind: 'investment',
    category: 'Investments',
    color: '#FF9800',
    icon: '📈',
    notes: 'Diversified portfolio with ETFs and unit trusts',
    openingBalanceCents: 125000000, // R1,250,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.095, // 9.5% expected return
    compoundsPerYear: 12,
  },
  {
    id: 'acc-property',
    name: 'Primary Residence',
    kind: 'investment',
    category: 'Property',
    color: '#9C27B0',
    icon: '🏠',
    notes: 'Family home in Johannesburg',
    openingBalanceCents: 280000000, // R2,800,000
    currentBalanceAsOf: '2024-01-01',
    isProperty: true,
    propertyAppreciationRate: 0.065, // 6.5% annual appreciation
  },
  {
    id: 'acc-bond',
    name: 'Home Loan',
    kind: 'liability',
    category: 'Debt',
    color: '#F44336',
    icon: '🏠',
    notes: 'Home loan at prime rate',
    openingBalanceCents: -145000000, // -R1,450,000 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.115, // 11.5%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-credit-card',
    name: 'Credit Card',
    kind: 'liability',
    category: 'Credit',
    color: '#795548',
    icon: '💳',
    notes: 'Primary credit card for monthly expenses',
    openingBalanceCents: -1250000, // -R12,500 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.205, // 20.5%
    compoundsPerYear: 12,
  },
];

export const SAMPLE_CASHFLOWS: Cashflow[] = [
  // Income
  {
    id: 'cf-salary',
    accountId: 'acc-checking',
    amountCents: 4500000, // R45,000 gross salary
    description: 'Monthly Salary',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065, // 6.5% annual increase
    },
  },
  {
    id: 'cf-bonus',
    accountId: 'acc-checking',
    amountCents: 9000000, // R90,000 annual bonus
    description: 'Annual Performance Bonus',
    recurrence: {
      frequency: 'annually',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-12-01',
    },
  },

  // Housing expenses
  {
    id: 'cf-bond-payment',
    accountId: 'acc-bond',
    amountCents: 1380000, // R13,800 monthly bond payment
    description: 'Home Loan Repayment',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-rates-taxes',
    accountId: 'acc-checking',
    amountCents: 185000, // R1,850 monthly rates and taxes
    description: 'Municipal Rates & Taxes',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.075, // 7.5% annual increase
    },
  },
  {
    id: 'cf-insurance-home',
    accountId: 'acc-checking',
    amountCents: 125000, // R1,250 monthly home insurance
    description: 'Home & Contents Insurance',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 5 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08, // 8% annual increase
    },
  },

  // Living expenses
  {
    id: 'cf-groceries',
    accountId: 'acc-credit-card',
    amountCents: 480000, // R4,800 monthly groceries
    description: 'Groceries & Household Items',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.055, // 5.5% food inflation
    },
  },
  {
    id: 'cf-utilities',
    accountId: 'acc-checking',
    amountCents: 320000, // R3,200 monthly utilities
    description: 'Electricity, Water, Gas',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 20 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.12, // 12% utility inflation
    },
  },
  {
    id: 'cf-cell-internet',
    accountId: 'acc-checking',
    amountCents: 185000, // R1,850 monthly telecommunications
    description: 'Cell Phone & Internet',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 10 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05, // 5% annual increase
    },
  },
  {
    id: 'cf-fuel',
    accountId: 'acc-credit-card',
    amountCents: 290000, // R2,900 monthly fuel
    description: 'Vehicle Fuel',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.085, // 8.5% fuel inflation
    },
  },

  // Insurance & Medical
  {
    id: 'cf-medical-aid',
    accountId: 'acc-checking',
    amountCents: 285000, // R2,850 monthly medical aid
    description: 'Medical Aid Contribution',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.095, // 9.5% medical inflation
    },
  },
  {
    id: 'cf-life-insurance',
    accountId: 'acc-checking',
    amountCents: 95000, // R950 monthly life insurance
    description: 'Life & Disability Insurance',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.07, // 7% annual increase
    },
  },

  // Savings & Investments
  {
    id: 'cf-savings-transfer',
    accountId: 'acc-savings',
    amountCents: 500000, // R5,000 monthly savings
    description: 'Monthly Savings Transfer',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-investment-transfer',
    accountId: 'acc-investment',
    amountCents: 350000, // R3,500 monthly investment
    description: 'Monthly Investment Contribution',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },

  // Discretionary spending
  {
    id: 'cf-entertainment',
    accountId: 'acc-credit-card',
    amountCents: 180000, // R1,800 monthly entertainment
    description: 'Entertainment & Dining',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06, // 6% annual increase
    },
  },
  {
    id: 'cf-clothing',
    accountId: 'acc-credit-card',
    amountCents: 120000, // R1,200 monthly clothing
    description: 'Clothing & Personal Items',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.055, // 5.5% annual increase
    },
  },
];

export const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: 'scenario-conservative',
    name: 'Conservative Spending',
    spendAdjustmentPct: -0.15, // 15% reduction in discretionary spending
    scope: 'discretionary',
    inflationPct: 0.055, // 5.5% inflation
    salaryGrowthPct: 0.065, // 6.5% salary growth
  },
  {
    id: 'scenario-aggressive-saving',
    name: 'Aggressive Savings',
    spendAdjustmentPct: -0.25, // 25% reduction in all expenses
    scope: 'all',
    inflationPct: 0.055,
    salaryGrowthPct: 0.065,
  },
  {
    id: 'scenario-high-inflation',
    name: 'High Inflation Period',
    spendAdjustmentPct: 0, // No spending adjustment
    scope: 'all',
    inflationPct: 0.085, // 8.5% inflation
    salaryGrowthPct: 0.055, // Lower salary growth than inflation
  },
  {
    id: 'scenario-salary-increase',
    name: 'Promotion & Salary Increase',
    spendAdjustmentPct: 0.1, // 10% lifestyle inflation
    scope: 'discretionary',
    inflationPct: 0.055,
    salaryGrowthPct: 0.12, // 12% salary growth
  },
];

/**
 * Initialize the application with sample data if no data exists
 */
export async function initializeSampleData(): Promise<void> {
  try {
    // Check if data already exists
    const existingAccounts = await dataService.getAccounts();
    const existingCashflows = await dataService.getCashflows();
    const existingScenarios = await dataService.getScenarios();

    // Only seed data if none exists
    if (
      existingAccounts.length === 0 &&
      existingCashflows.length === 0 &&
      existingScenarios.length === 0
    ) {
      console.log('Initializing application with sample data...');

      await dataService.saveAccounts(SAMPLE_ACCOUNTS);
      await dataService.saveCashflows(SAMPLE_CASHFLOWS);
      await dataService.saveScenarios(SAMPLE_SCENARIOS);

      console.log('Sample data initialized successfully');
    } else {
      console.log('Existing data found, skipping sample data initialization');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
