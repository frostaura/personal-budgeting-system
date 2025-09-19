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
    openingBalanceCents: 4631000, // R46,310 (after deductions amount from spreadsheet)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.025, // 2.5%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-emergency-savings',
    name: 'Emergency Savings',
    kind: 'investment',
    category: 'Savings',
    color: '#2196F3',
    icon: '🏦',
    notes: 'Emergency fund savings account',
    openingBalanceCents: 30305706, // R303,057.06
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.0655, // 6.55%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-securities',
    name: 'Securities',
    kind: 'investment',
    category: 'Investments',
    color: '#FF9800',
    icon: '📈',
    notes: 'Investment securities portfolio',
    openingBalanceCents: 30305706, // R303,057.06
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.15, // 15% expected return
    compoundsPerYear: 12,
  },
  {
    id: 'acc-retirement-fund',
    name: 'Retirement Fund',
    kind: 'investment',
    category: 'Retirement',
    color: '#9C27B0',
    icon: '🏆',
    notes: 'Retirement fund investment account',
    openingBalanceCents: 92487603, // R924,876.03
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.10, // 10% expected return
    compoundsPerYear: 12,
  },
  {
    id: 'acc-fnb-credit',
    name: 'FNB Private Client Credit',
    kind: 'liability',
    category: 'Credit',
    color: '#F44336',
    icon: '💳',
    notes: 'FNB Private Client Credit Card',
    openingBalanceCents: -25079300, // -R250,793.00 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.205, // 20.5%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-mfc-vehicle',
    name: 'MFC Vehicle Finance',
    kind: 'liability',
    category: 'Debt',
    color: '#795548',
    icon: '🚗',
    notes: 'MFC Vehicle financing loan',
    openingBalanceCents: -39876538, // -R398,765.38 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.1145, // 11.45%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-sahl',
    name: 'SAHL',
    kind: 'liability',
    category: 'Debt',
    color: '#E91E63',
    icon: '🏠',
    notes: 'SA Home Loan',
    openingBalanceCents: -171374771, // -R1,713,747.71 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.117, // 11.70%
    compoundsPerYear: 12,
  },
];

export const SAMPLE_CASHFLOWS: Cashflow[] = [
  // Income
  {
    id: 'cf-base-salary',
    accountId: 'acc-checking',
    amountCents: 5501500, // R55,015.00 base salary
    description: 'Base Salary',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065, // 6.5% annual increase
    },
  },
  {
    id: 'cf-performance-bonus',
    accountId: 'acc-checking',
    amountCents: 1320000, // R13,200.00 performance bonus
    description: 'Performance Bonus',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065,
    },
  },
  {
    id: 'cf-productivity-allowance',
    accountId: 'acc-checking',
    amountCents: 230500, // R2,305.00 productivity allowance
    description: 'Productivity Allowance',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065,
    },
  },
  {
    id: 'cf-cellphone-reimbursement',
    accountId: 'acc-checking',
    amountCents: 35000, // R350.00 cellphone reimbursement
    description: 'Cellphone Re-imbursement',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-medical-aid-subsidy',
    accountId: 'acc-checking',
    amountCents: 200000, // R2,000.00 medical aid subsidy
    description: 'Medical Aid Subsidy',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065,
    },
  },

  // Deductions/Expenses
  {
    id: 'cf-diesel-tax',
    accountId: 'acc-checking',
    amountCents: 517069, // R5,170.69 diesel tax
    description: 'Diesel Tax',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06,
    },
  },
  {
    id: 'cf-uif',
    accountId: 'acc-checking',
    amountCents: 20000, // R200.00 UIF
    description: 'UIF',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-car-gap-insurance',
    accountId: 'acc-checking',
    amountCents: 55000, // R550.00 car gap insurance
    description: 'Car Gap Insurance',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08,
    },
  },
  {
    id: 'cf-canteen-expenses',
    accountId: 'acc-checking',
    amountCents: 33000, // R330.00 canteen expenses
    description: 'Canteen Expenses',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.055,
    },
  },
  {
    id: 'cf-medical-aid',
    accountId: 'acc-checking',
    amountCents: 350000, // R3,500.00 medical aid
    description: 'Medical Aid',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.095,
    },
  },
  {
    id: 'cf-milship-subscription',
    accountId: 'acc-checking',
    amountCents: 35000, // R350.00 milship subscription
    description: 'Milship Subscription',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-mfc-vehicle-finance-1',
    accountId: 'acc-mfc-vehicle',
    amountCents: 610000, // R6,100.00 MFC vehicle finance
    description: 'MFC Vehicle Finance',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-rates-taxes-electricity',
    accountId: 'acc-checking',
    amountCents: 300000, // R3,000.00 rates, taxes & electricity
    description: 'Rates, Taxes & Electricity',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.12,
    },
  },
  {
    id: 'cf-pet-supplies',
    accountId: 'acc-checking',
    amountCents: 150000, // R1,500.00 pet supplies
    description: 'Pet Supplies',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.055,
    },
  },
  {
    id: 'cf-mfc-vehicle-finance-2',
    accountId: 'acc-mfc-vehicle',
    amountCents: 1110000, // R11,100.00 additional MFC vehicle finance
    description: 'MFC Vehicle Finance (Additional)',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-bank-account-charges',
    accountId: 'acc-checking',
    amountCents: 65000, // R650.00 bank account charges
    description: 'Bank Account Charges',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06,
    },
  },
  {
    id: 'cf-fnb-investment-loan-interest',
    accountId: 'acc-checking',
    amountCents: 495735, // R4,957.35 FNB investment loan interest
    description: 'FNB Investment Loan Interest',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-fnb-credit-interest',
    accountId: 'acc-fnb-credit',
    amountCents: 496771, // R4,967.71 FNB credit interest
    description: 'FNB Credit Interest',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-entertainment',
    accountId: 'acc-checking',
    amountCents: 400000, // R4,000.00 entertainment
    description: 'Entertainment',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06,
    },
  },
  {
    id: 'cf-youtube-premium',
    accountId: 'acc-checking',
    amountCents: 10000, // R100.00 YouTube Premium
    description: 'YouTube Premium',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-imovie-pro',
    accountId: 'acc-checking',
    amountCents: 5000, // R50.00 iMovie Pro
    description: 'iMovie Pro',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-emergency-savings',
    accountId: 'acc-emergency-savings',
    amountCents: 300000, // R3,000.00 emergency savings
    description: 'Emergency Savings',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-old-mutual-salary',
    accountId: 'acc-checking',
    amountCents: 1500000, // R15,000.00 Old Mutual salary
    description: 'Old Mutual Salary',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065,
    },
  },
  {
    id: 'cf-gym-fees',
    accountId: 'acc-checking',
    amountCents: 90000, // R900.00 gym fees
    description: 'Gym Fees',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08,
    },
  },
  {
    id: 'cf-landscaping',
    accountId: 'acc-checking',
    amountCents: 100000, // R1,000.00 landscaping
    description: 'Landscaping',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06,
    },
  },

  // Investment cash flows
  {
    id: 'cf-sa-home-loan',
    accountId: 'acc-sahl',
    amountCents: 1870000, // R18,700.00 SA home loan payment
    description: 'SA Home Loan',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-account-payments',
    accountId: 'acc-checking',
    amountCents: 2450000, // R24,500.00 account payments
    description: 'Account Payments',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-securities',
    accountId: 'acc-securities',
    amountCents: 400000, // R4,000.00 securities investment
    description: 'Securities',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-emergency-fund',
    accountId: 'acc-emergency-savings',
    amountCents: 200000, // R2,000.00 emergency fund
    description: 'Emergency Fund',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-short-term-savings',
    accountId: 'acc-emergency-savings',
    amountCents: 1030000, // R10,300.00 short term savings
    description: 'Short Term Savings',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-diving',
    accountId: 'acc-checking',
    amountCents: 200000, // R2,000.00 diving
    description: 'Diving',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-egypt-trip',
    accountId: 'acc-checking',
    amountCents: 500000, // R5,000.00 Egypt trip
    description: 'Egypt Trip',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-squash',
    accountId: 'acc-checking',
    amountCents: 250000, // R2,500.00 squash
    description: 'Squash',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-gravel-invoice',
    accountId: 'acc-checking',
    amountCents: 80000, // R800.00 gravel invoice
    description: 'Gravel Invoice',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
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
    id: 'scenario-debt-focus',
    name: 'Debt Reduction Focus',
    spendAdjustmentPct: -0.20, // 20% reduction in all expenses
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
    id: 'scenario-career-growth',
    name: 'Career Growth & Promotion',
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
