import { Account, Cashflow, Scenario } from '@/types/money';
import { dataService } from './dataService';

export const SAMPLE_ACCOUNTS: Account[] = [
  // Banking Accounts
  {
    id: 'acc-checking',
    name: 'Primary Checking Account',
    kind: 'income', // Used for income tracking
    category: 'Banking',
    color: '#4CAF50',
    icon: '💳',
    notes: 'Main bank account for daily transactions',
    openingBalanceCents: 12500000, // R125,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.025, // 2.5%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-spouse-checking',
    name: 'Spouse Checking Account',
    kind: 'income',
    category: 'Banking',
    color: '#66BB6A',
    icon: '💳',
    notes: 'Spouse bank account for income and expenses',
    openingBalanceCents: 8500000, // R85,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.025, // 2.5%
    compoundsPerYear: 12,
  },
  {
    id: 'acc-savings',
    name: 'Emergency Fund',
    kind: 'investment',
    category: 'Savings',
    color: '#2196F3',
    icon: '🏦',
    notes: 'Emergency fund - 6 months expenses target',
    openingBalanceCents: 78000000, // R780,000 (about 6 months expenses)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.075, // 7.5%
    compoundsPerYear: 12,
  },

  // Investment Accounts
  {
    id: 'acc-retirement',
    name: 'Retirement Annuity',
    kind: 'investment',
    category: 'Retirement',
    color: '#FF9800',
    icon: '🏦',
    notes: 'Tax-efficient retirement savings',
    openingBalanceCents: 185000000, // R1,850,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.095, // 9.5% expected return
    compoundsPerYear: 12,
  },
  {
    id: 'acc-investment',
    name: 'Tax-Free Savings',
    kind: 'investment',
    category: 'Investments',
    color: '#FFC107',
    icon: '📈',
    notes: 'Tax-free savings account - TFSA',
    openingBalanceCents: 72000000, // R720,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.085, // 8.5% expected return
    compoundsPerYear: 12,
  },
  {
    id: 'acc-unit-trusts',
    name: 'Unit Trust Portfolio',
    kind: 'investment',
    category: 'Investments',
    color: '#9C27B0',
    icon: '📊',
    notes: 'Diversified unit trust portfolio',
    openingBalanceCents: 156000000, // R1,560,000
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.095, // 9.5% expected return
    compoundsPerYear: 12,
  },

  // Property Assets
  {
    id: 'acc-property-main',
    name: 'Primary Residence',
    kind: 'investment',
    category: 'Property',
    color: '#795548',
    icon: '🏠',
    notes: 'Family home in Johannesburg suburbs',
    openingBalanceCents: 345000000, // R3,450,000
    currentBalanceAsOf: '2024-01-01',
    isProperty: true,
    propertyAppreciationRate: 0.065, // 6.5% annual appreciation
  },
  {
    id: 'acc-property-rental',
    name: 'Rental Property',
    kind: 'investment',
    category: 'Property',
    color: '#8D6E63',
    icon: '🏢',
    notes: 'Buy-to-let apartment generating rental income',
    openingBalanceCents: 185000000, // R1,850,000
    currentBalanceAsOf: '2024-01-01',
    isProperty: true,
    propertyAppreciationRate: 0.055, // 5.5% annual appreciation
  },

  // Debt/Liability Accounts
  {
    id: 'acc-bond-main',
    name: 'Primary Home Loan',
    kind: 'liability',
    category: 'Debt',
    color: '#F44336',
    icon: '🏠',
    notes: 'Home loan on primary residence at prime rate',
    openingBalanceCents: -198000000, // -R1,980,000 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.115, // 11.5% (prime rate)
    compoundsPerYear: 12,
  },
  {
    id: 'acc-bond-rental',
    name: 'Rental Property Bond',
    kind: 'liability',
    category: 'Debt',
    color: '#E53935',
    icon: '🏢',
    notes: 'Investment property loan',
    openingBalanceCents: -142000000, // -R1,420,000 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.125, // 12.5% (higher rate for investment property)
    compoundsPerYear: 12,
  },
  {
    id: 'acc-car-loan',
    name: 'Vehicle Finance',
    kind: 'liability',
    category: 'Debt',
    color: '#FF5722',
    icon: '🚗',
    notes: 'Car loan for family vehicle',
    openingBalanceCents: -28500000, // -R285,000 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.135, // 13.5% vehicle finance rate
    compoundsPerYear: 12,
  },
  {
    id: 'acc-credit-card',
    name: 'Primary Credit Card',
    kind: 'liability',
    category: 'Credit',
    color: '#9E9E9E',
    icon: '💳',
    notes: 'Primary credit card for monthly expenses',
    openingBalanceCents: -2400000, // -R24,000 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.225, // 22.5% credit card rate
    compoundsPerYear: 12,
  },
  {
    id: 'acc-credit-card-spouse',
    name: 'Spouse Credit Card',
    kind: 'liability',
    category: 'Credit',
    color: '#757575',
    icon: '💳',
    notes: 'Spouse credit card account',
    openingBalanceCents: -1850000, // -R18,500 (liability)
    currentBalanceAsOf: '2024-01-01',
    annualInterestRate: 0.215, // 21.5% credit card rate
    compoundsPerYear: 12,
  },
];

export const SAMPLE_CASHFLOWS: Cashflow[] = [
  // ===== INCOME SOURCES =====
  
  // Primary Income
  {
    id: 'cf-salary-primary',
    accountId: 'acc-checking',
    amountCents: 5850000, // R58,500 gross monthly salary (R702k annually)
    description: 'Primary Salary (Gross)',
    icon: '💰',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.075, // 7.5% annual increase
    },
  },
  {
    id: 'cf-salary-spouse',
    accountId: 'acc-spouse-checking',
    amountCents: 4250000, // R42,500 gross monthly salary (R510k annually)
    description: 'Spouse Salary (Gross)',
    icon: '💰',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065, // 6.5% annual increase
    },
  },

  // Annual Bonuses
  {
    id: 'cf-bonus-primary',
    accountId: 'acc-checking',
    amountCents: 17550000, // R175,500 (3 months salary equivalent)
    description: 'Annual Performance Bonus',
    icon: '🎉',
    recurrence: {
      frequency: 'annually',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-12-01',
      annualIndexationPct: 0.075, // Same as salary growth
    },
  },
  {
    id: 'cf-bonus-spouse',
    accountId: 'acc-spouse-checking',
    amountCents: 8500000, // R85,000 (2 months salary equivalent)
    description: 'Spouse Annual Bonus',
    icon: '🎉',
    recurrence: {
      frequency: 'annually',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-12-01',
      annualIndexationPct: 0.065,
    },
  },

  // Investment Income
  {
    id: 'cf-rental-income',
    accountId: 'acc-checking',
    amountCents: 1950000, // R19,500 monthly rental income
    description: 'Rental Property Income',
    icon: '🏢',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06, // 6% annual rental increase
    },
  },
  {
    id: 'cf-dividend-income',
    accountId: 'acc-checking',
    amountCents: 285000, // R2,850 monthly from investment dividends
    description: 'Investment Dividends',
    icon: '📈',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08, // 8% dividend growth
    },
  },

  // Freelance Income
  {
    id: 'cf-freelance',
    accountId: 'acc-checking',
    amountCents: 850000, // R8,500 monthly average freelance
    description: 'Freelance/Consulting Income',
    icon: '💻',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 5 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.1, // 10% growth in side business
    },
  },

  // ===== TAXES & DEDUCTIONS =====
  
  {
    id: 'cf-tax-paye-primary',
    accountId: 'acc-checking',
    amountCents: -1053000, // R10,530 (18% effective rate on primary salary)
    description: 'PAYE Tax - Primary Income',
    icon: '🧾',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.075, // Grows with salary
    },
    percentageOf: {
      sourceType: 'cashflow',
      sourceId: 'cf-salary-primary',
      percentage: 0.18, // 18% effective tax rate
    },
  },
  {
    id: 'cf-tax-paye-spouse',
    accountId: 'acc-spouse-checking',
    amountCents: -680000, // R6,800 (16% effective rate on spouse salary)
    description: 'PAYE Tax - Spouse Income',
    icon: '🧾',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065,
    },
    percentageOf: {
      sourceType: 'cashflow',
      sourceId: 'cf-salary-spouse',
      percentage: 0.16, // 16% effective tax rate
    },
  },

  // Retirement Contributions
  {
    id: 'cf-retirement-primary',
    accountId: 'acc-retirement',
    amountCents: 877500, // R8,775 (15% of gross salary)
    description: 'Retirement Contribution (Primary)',
    icon: '🏦',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.075,
    },
    percentageOf: {
      sourceType: 'cashflow',
      sourceId: 'cf-salary-primary',
      percentage: 0.15, // 15% of gross salary
    },
  },
  {
    id: 'cf-retirement-spouse',
    accountId: 'acc-retirement',
    amountCents: 637500, // R6,375 (15% of gross salary)
    description: 'Retirement Contribution (Spouse)',
    icon: '🏦',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 25 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065,
    },
    percentageOf: {
      sourceType: 'cashflow',
      sourceId: 'cf-salary-spouse',
      percentage: 0.15, // 15% of gross salary
    },
  },

  // ===== HOUSING EXPENSES =====
  
  {
    id: 'cf-bond-payment-main',
    accountId: 'acc-bond-main',
    amountCents: 1985000, // R19,850 monthly bond payment (primary residence)
    description: 'Primary Home Loan Payment',
    icon: '🏠',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-bond-payment-rental',
    accountId: 'acc-bond-rental',
    amountCents: 1485000, // R14,850 monthly bond payment (rental property)
    description: 'Rental Property Loan Payment',
    icon: '🏢',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-rates-taxes-main',
    accountId: 'acc-checking',
    amountCents: -275000, // R2,750 monthly rates and taxes (primary)
    description: 'Municipal Rates & Taxes (Main)',
    icon: '🏛️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08, // 8% annual increase
    },
  },
  {
    id: 'cf-rates-taxes-rental',
    accountId: 'acc-checking',
    amountCents: -155000, // R1,550 monthly rates and taxes (rental)
    description: 'Municipal Rates & Taxes (Rental)',
    icon: '🏛️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08,
    },
  },
  {
    id: 'cf-home-insurance',
    accountId: 'acc-checking',
    amountCents: -185000, // R1,850 monthly home insurance (both properties)
    description: 'Property Insurance (Combined)',
    icon: '🏠',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 5 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.09, // 9% insurance inflation
    },
  },

  // ===== TRANSPORTATION =====
  
  {
    id: 'cf-car-payment',
    accountId: 'acc-car-loan',
    amountCents: 485000, // R4,850 monthly car payment
    description: 'Vehicle Finance Payment',
    icon: '🚗',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 5 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-fuel',
    accountId: 'acc-credit-card',
    amountCents: -395000, // R3,950 monthly fuel (two cars)
    description: 'Vehicle Fuel',
    icon: '⛽',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.095, // 9.5% fuel inflation
    },
  },
  {
    id: 'cf-car-insurance',
    accountId: 'acc-checking',
    amountCents: -245000, // R2,450 monthly car insurance (comprehensive for 2 cars)
    description: 'Vehicle Insurance',
    icon: '🚗',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 10 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.085, // 8.5% insurance increase
    },
  },
  {
    id: 'cf-car-maintenance',
    accountId: 'acc-checking',
    amountCents: -195000, // R1,950 monthly average for maintenance (both cars)
    description: 'Vehicle Maintenance & Services',
    icon: '🔧',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 20 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.075, // 7.5% maintenance cost increase
    },
  },

  // ===== LIVING EXPENSES =====
  
  {
    id: 'cf-groceries',
    accountId: 'acc-credit-card',
    amountCents: -685000, // R6,850 monthly groceries (family of 4)
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
    amountCents: -485000, // R4,850 monthly utilities (electricity, water, gas)
    description: 'Electricity, Water & Gas',
    icon: '⚡',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 20 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.125, // 12.5% utility inflation
    },
  },
  {
    id: 'cf-telecommunications',
    accountId: 'acc-checking',
    amountCents: -285000, // R2,850 monthly (cell phones, internet, DSTV)
    description: 'Cell Phones, Internet & TV',
    icon: '📱',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 10 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06, // 6% annual increase
    },
  },

  // ===== MEDICAL & INSURANCE =====
  
  {
    id: 'cf-medical-aid',
    accountId: 'acc-checking',
    amountCents: -385000, // R3,850 monthly medical aid (family plan)
    description: 'Medical Aid Contribution',
    icon: '🏥',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.105, // 10.5% medical inflation
    },
  },
  {
    id: 'cf-life-insurance',
    accountId: 'acc-checking',
    amountCents: -185000, // R1,850 monthly life & disability insurance
    description: 'Life & Disability Insurance',
    icon: '🛡️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.075, // 7.5% annual increase
    },
  },
  {
    id: 'cf-medical-expenses',
    accountId: 'acc-credit-card',
    amountCents: -285000, // R2,850 monthly out-of-pocket medical (dental, optical, etc.)
    description: 'Medical Expenses (Out-of-pocket)',
    icon: '💊',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.095, // 9.5% medical inflation
    },
  },

  // ===== EDUCATION & CHILDREN =====
  
  {
    id: 'cf-school-fees',
    accountId: 'acc-checking',
    amountCents: -485000, // R4,850 monthly school fees (2 children)
    description: 'School Fees (2 Children)',
    icon: '🎓',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.095, // 9.5% education inflation
    },
  },
  {
    id: 'cf-children-activities',
    accountId: 'acc-credit-card',
    amountCents: -185000, // R1,850 monthly (sports, music lessons, etc.)
    description: 'Children Activities & Sports',
    icon: '⚽',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 5 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08, // 8% annual increase
    },
  },
  {
    id: 'cf-children-clothing',
    accountId: 'acc-credit-card',
    amountCents: -135000, // R1,350 monthly children's clothing & supplies
    description: 'Children Clothing & Supplies',
    icon: '👕',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06, // 6% annual increase
    },
  },

  // ===== SAVINGS & INVESTMENTS =====
  
  {
    id: 'cf-emergency-fund',
    accountId: 'acc-savings',
    amountCents: 285000, // R2,850 monthly emergency fund top-up
    description: 'Emergency Fund Contribution',
    icon: '🏦',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-tfsa-contribution',
    accountId: 'acc-investment',
    amountCents: 300000, // R3,000 monthly (R36k annually - TFSA limit)
    description: 'Tax-Free Savings Contribution',
    icon: '📈',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },
  {
    id: 'cf-unit-trust-investment',
    accountId: 'acc-unit-trusts',
    amountCents: 485000, // R4,850 monthly additional investment
    description: 'Unit Trust Investment',
    icon: '📊',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 26 },
      startDate: '2024-01-01',
    },
  },

  // ===== DISCRETIONARY SPENDING =====
  
  {
    id: 'cf-entertainment',
    accountId: 'acc-credit-card',
    amountCents: -285000, // R2,850 monthly entertainment & dining
    description: 'Entertainment & Dining Out',
    icon: '🍽️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.07, // 7% annual increase
    },
  },
  {
    id: 'cf-clothing-adults',
    accountId: 'acc-credit-card',
    amountCents: -185000, // R1,850 monthly adult clothing & personal care
    description: 'Adult Clothing & Personal Care',
    icon: '👔',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.065, // 6.5% annual increase
    },
  },
  {
    id: 'cf-hobbies-recreation',
    accountId: 'acc-credit-card',
    amountCents: -145000, // R1,450 monthly hobbies & recreation
    description: 'Hobbies & Recreation',
    icon: '🎨',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.06, // 6% annual increase
    },
  },
  {
    id: 'cf-subscriptions',
    accountId: 'acc-checking',
    amountCents: -125000, // R1,250 monthly (gym, streaming, magazines, etc.)
    description: 'Subscriptions & Memberships',
    icon: '💳',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08, // 8% annual increase
    },
  },

  // ===== PROFESSIONAL & DEVELOPMENT =====
  
  {
    id: 'cf-professional-fees',
    accountId: 'acc-checking',
    amountCents: -95000, // R950 monthly professional fees & licenses
    description: 'Professional Fees & Licenses',
    icon: '📋',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 5 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08, // 8% annual increase
    },
  },
  {
    id: 'cf-training-courses',
    accountId: 'acc-checking',
    amountCents: -185000, // R1,850 monthly average for courses & conferences
    description: 'Training & Professional Development',
    icon: '📚',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 15 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.075, // 7.5% annual increase
    },
  },

  // ===== ANNUAL/IRREGULAR EXPENSES =====
  
  {
    id: 'cf-holiday-fund',
    accountId: 'acc-savings',
    amountCents: 385000, // R3,850 monthly for annual family holiday
    description: 'Annual Holiday Fund',
    icon: '✈️',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 1 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.08, // 8% annual increase
    },
  },
  {
    id: 'cf-property-maintenance',
    accountId: 'acc-checking',
    amountCents: -195000, // R1,950 monthly average for property maintenance
    description: 'Property Maintenance Reserve',
    icon: '🔨',
    recurrence: {
      frequency: 'monthly',
      anchor: { dayOfMonth: 20 },
      startDate: '2024-01-01',
      annualIndexationPct: 0.085, // 8.5% annual increase
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
