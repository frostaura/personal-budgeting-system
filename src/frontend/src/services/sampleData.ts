import { Account, Cashflow, Scenario } from '@/types/money';
import { dataService } from './dataService';

export const SAMPLE_ACCOUNTS: Account[] = [
  // Banking Accounts
  {
    id: 'acc-checking',
    name: 'FNB Private Client Account',
    kind: 'income', // Used for income tracking
    category: 'Banking',
    color: '#4CAF50',
    icon: '💳',
    notes: 'Main banking account for salary and daily expenses',
    openingBalanceCents: 4631000, // R46,310 (close to unallocated amount)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.055, // 5.5%
    compoundsPerYear: 12,
  },

  // Investment & Savings Accounts
  {
    id: 'acc-emergency-savings',
    name: 'Emergency Savings',
    kind: 'investment',
    category: 'Savings',
    color: '#2196F3',
    icon: '🏦',
    notes: 'Emergency fund for unexpected expenses',
    openingBalanceCents: 20000000, // R200,000 (based on monthly emergency fund contribution)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.0655, // 6.55% as shown in spreadsheet
    compoundsPerYear: 12,
  },
  {
    id: 'acc-securities',
    name: 'Securities Portfolio',
    kind: 'investment',
    category: 'Investments',
    color: '#FF9800',
    icon: '📈',
    notes: 'Investment securities and shares',
    openingBalanceCents: 40000000, // R400,000 (based on monthly securities investment)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.15, // 15% as shown in spreadsheet
    compoundsPerYear: 12,
  },
  {
    id: 'acc-retirement-fund',
    name: 'Retirement Fund',
    kind: 'investment',
    category: 'Retirement',
    color: '#9C27B0',
    icon: '🏛️',
    notes: 'Company retirement fund contributions',
    openingBalanceCents: 95000000, // R950,000 (substantial retirement savings)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.10, // 10% as shown in spreadsheet
    compoundsPerYear: 12,
  },
  {
    id: 'acc-short-term-savings',
    name: 'Short Term Savings',
    kind: 'investment',
    category: 'Savings',
    color: '#00BCD4',
    icon: '💰',
    notes: 'Short-term savings for goals and opportunities',
    openingBalanceCents: 10300000, // R103,000 (matching monthly contribution)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.065, // 6.5%
    compoundsPerYear: 12,
  },

  // Property Assets
  {
    id: 'acc-sa-home',
    name: 'Primary Residence',
    kind: 'investment',
    category: 'Property',
    color: '#795548',
    icon: '🏠',
    notes: 'Primary family residence',
    openingBalanceCents: 280000000, // R2,800,000 (estimated property value)
    currentBalanceAsOf: '2024-01-01',
    isProperty: true,
    propertyAppreciationRate: 0.065, // 6.5% annual appreciation
  },

  // Debt/Liability Accounts
  {
    id: 'acc-sa-home-loan',
    name: 'SA Home Loan (SAHL)',
    kind: 'liability',
    category: 'Debt',
    color: '#F44336',
    icon: '🏠',
    notes: 'Home loan with SAHL',
    openingBalanceCents: -169207100, // -R1,692,071 (from spreadsheet)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.117, // 11.70% (from spreadsheet)
    compoundsPerYear: 12,
  },
  {
    id: 'acc-vehicle-finance',
    name: 'MFC Vehicle Finance',
    kind: 'liability',
    category: 'Debt',
    color: '#FF5722',
    icon: '🚗',
    notes: 'Vehicle financing with MFC',
    openingBalanceCents: -9029550, // -R90,295.50 (from spreadsheet)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.1145, // 11.45% (from spreadsheet)
    compoundsPerYear: 12,
  },
  {
    id: 'acc-credit-card',
    name: 'FNB Private Client Credit',
    kind: 'liability',
    category: 'Credit',
    color: '#9E9E9E',
    icon: '💳',
    notes: 'FNB credit card for monthly expenses',
    openingBalanceCents: -4967710, // -R49,677.10 (from spreadsheet)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.205, // 20.50% (from spreadsheet)
    compoundsPerYear: 12,
  },
];

export const SAMPLE_CASHFLOWS: Cashflow[] = [
  // ===== INCOME SOURCES =====
  
  {
    id: 'cf-base-salary',
    accountId: 'acc-checking',
    amountCents: 15101400, // R151,014.00 base salary (from spreadsheet)
    description: 'Base Salary',
    icon: '💰',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.07, // 7% annual increase
    },
  },
  {
    id: 'cf-performance-bonus',
    accountId: 'acc-checking',
    amountCents: 2010000, // R20,100.00 performance bonus (from spreadsheet)
    description: 'Performance Bonus',
    icon: '🎯',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.07,
    },
  },
  {
    id: 'cf-productivity-allowance',
    accountId: 'acc-checking',
    amountCents: 150000, // R1,500.00 productivity allowance (from spreadsheet)
    description: 'Productivity Allowance',
    icon: '⚡',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-cellphone-reimbursement',
    accountId: 'acc-checking',
    amountCents: 35000, // R350.00 cellphone reimbursement (from spreadsheet)
    description: 'Cellphone Reimbursement',
    icon: '📱',
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
    amountCents: 200000, // R2,000.00 medical aid subsidy (from spreadsheet)
    description: 'Medical Aid Subsidy',
    icon: '🏥',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08,
    },
  },

  // ===== DEDUCTIONS & EXPENSES =====
  
  {
    id: 'cf-income-tax',
    accountId: 'acc-checking',
    amountCents: -5270000, // -R52,700.00 income tax (from spreadsheet)
    description: 'Income Tax (PAYE)',
    icon: '🧾',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.07, // Grows with salary
    },
  },
  {
    id: 'cf-uif',
    accountId: 'acc-checking',
    amountCents: -20000, // -R200.00 UIF (from spreadsheet)
    description: 'UIF Contribution',
    icon: '🛡️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-gap-cover',
    accountId: 'acc-checking',
    amountCents: -35000, // -R350.00 gap cover (from spreadsheet)
    description: 'Gap Cover Insurance',
    icon: '🏥',
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
    amountCents: -30000, // -R300.00 canteen expenses (from spreadsheet)
    description: 'Canteen Expenses',
    icon: '🍽️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06,
    },
  },
  {
    id: 'cf-medical-aid',
    accountId: 'acc-checking',
    amountCents: -550000, // -R5,500.00 medical aid (from spreadsheet)
    description: 'Medical Aid Contribution',
    icon: '🏥',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.095, // 9.5% medical inflation
    },
  },
  {
    id: 'cf-monthly-subscription',
    accountId: 'acc-checking',
    amountCents: -35000, // -R350.00 monthly subscription (from spreadsheet)
    description: 'Monthly Subscription',
    icon: '📱',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },
  {
    id: 'cf-6m-mobile',
    accountId: 'acc-checking',
    amountCents: -120000, // -R1,200.00 6M mobile (from spreadsheet)
    description: '6M Mobile (Dec 26)',
    icon: '📱',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.05,
    },
  },

  // ===== DEBT PAYMENTS =====
  
  {
    id: 'cf-sa-home-loan-payment',
    accountId: 'acc-sa-home-loan',
    amountCents: 1870000, // R18,700.00 SA home loan payment (from spreadsheet)
    description: 'SA Home Loan Payment',
    icon: '🏠',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-account-payments',
    accountId: 'acc-credit-card',
    amountCents: 2450000, // R24,500.00 account payments (from spreadsheet)
    description: 'Account Payments',
    icon: '💳',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },

  // ===== INVESTMENTS & SAVINGS =====
  
  {
    id: 'cf-securities-investment',
    accountId: 'acc-securities',
    amountCents: 400000, // R4,000.00 securities (from spreadsheet)
    description: 'Securities Investment',
    icon: '📈',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-emergency-fund',
    accountId: 'acc-emergency-savings',
    amountCents: 200000, // R2,000.00 emergency fund (from spreadsheet)
    description: 'Emergency Fund Contribution',
    icon: '🏦',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-short-term-savings',
    accountId: 'acc-short-term-savings',
    amountCents: 1030000, // R10,300.00 short term savings (from spreadsheet)
    description: 'Short Term Savings',
    icon: '💰',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },

  // ===== ADDITIONAL EXPENSES (based on common patterns) =====
  
  {
    id: 'cf-groceries',
    accountId: 'acc-credit-card',
    amountCents: -400000, // -R4,000 monthly groceries
    description: 'Groceries & Household Items',
    icon: '🛒',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065, // 6.5% food inflation
    },
  },
  {
    id: 'cf-utilities',
    accountId: 'acc-checking',
    amountCents: -300000, // -R3,000 monthly utilities
    description: 'Electricity, Water & Municipal',
    icon: '⚡',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.12, // 12% utility inflation
    },
  },
  {
    id: 'cf-fuel',
    accountId: 'acc-credit-card',
    amountCents: -250000, // -R2,500 monthly fuel
    description: 'Vehicle Fuel',
    icon: '⛽',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.085, // 8.5% fuel inflation
    },
  },
  {
    id: 'cf-entertainment',
    accountId: 'acc-credit-card',
    amountCents: -150000, // -R1,500 monthly entertainment
    description: 'Entertainment & Dining',
    icon: '🍽️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.07, // 7% annual increase
    },
  },
];

export const SAMPLE_SCENARIOS: Scenario[] = [
  {
    id: 'scenario-baseline',
    name: 'Current Financial Plan',
    spendAdjustmentPct: 0, // No adjustment - baseline scenario
    scope: 'all',
    inflationPct: 0.065, // 6.5% inflation (realistic SA rate)
    salaryGrowthPct: 0.075, // 7.5% salary growth (above inflation)
  },
  {
    id: 'scenario-conservative-spending',
    name: 'Conservative Spending',
    spendAdjustmentPct: -0.15, // 15% reduction in discretionary spending
    scope: 'discretionary',
    inflationPct: 0.065,
    salaryGrowthPct: 0.075,
  },
  {
    id: 'scenario-aggressive-savings',
    name: 'Aggressive Debt Payoff',
    spendAdjustmentPct: -0.25, // 25% reduction in all non-essential expenses
    scope: 'all',
    inflationPct: 0.065,
    salaryGrowthPct: 0.075,
  },
  {
    id: 'scenario-high-inflation',
    name: 'Economic Downturn',
    spendAdjustmentPct: -0.1, // 10% reduction to counter inflation
    scope: 'discretionary',
    inflationPct: 0.095, // 9.5% high inflation period
    salaryGrowthPct: 0.045, // 4.5% salary growth (below inflation)
  },
  {
    id: 'scenario-career-growth',
    name: 'Career Advancement',
    spendAdjustmentPct: 0.15, // 15% lifestyle inflation with higher income
    scope: 'discretionary',
    inflationPct: 0.065,
    salaryGrowthPct: 0.125, // 12.5% salary growth (promotion/job change)
  },
  {
    id: 'scenario-economic-boom',
    name: 'Economic Growth Period',
    spendAdjustmentPct: 0.1, // 10% increase in discretionary spending
    scope: 'discretionary',
    inflationPct: 0.045, // 4.5% lower inflation
    salaryGrowthPct: 0.095, // 9.5% salary growth
  },
  {
    id: 'scenario-retirement-prep',
    name: 'Pre-Retirement Strategy',
    spendAdjustmentPct: -0.2, // 20% reduction to maximize savings
    scope: 'all',
    inflationPct: 0.065,
    salaryGrowthPct: 0.055, // 5.5% lower growth nearing retirement
  },
  {
    id: 'scenario-emergency-mode',
    name: 'Emergency Budget',
    spendAdjustmentPct: -0.4, // 40% reduction for emergency situations
    scope: 'all',
    inflationPct: 0.085, // 8.5% crisis inflation
    salaryGrowthPct: 0.02, // 2% minimal growth in crisis
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
