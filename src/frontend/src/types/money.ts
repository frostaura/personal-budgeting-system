// src/frontend/types/money.ts
export type Cents = number; // integer cents

export type CurrencySettings = {
  code: string; // 'ZAR'
  symbol: string; // 'R'
  locale: string; // 'en-ZA'
  roundingStepCents: number; // default 50_000 == R500
  storagePrefix?: string; // default 'pfp:' (can be '')
};

export type AccountKind =
  | 'income'
  | 'expense'
  | 'investment'
  | 'liability'
  | 'reserve'
  | 'transfer';

export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  category?: string;
  color?: string;
  icon?: string;
  notes?: string;

  // Balances
  openingBalanceCents?: Cents; // assets(+)/liabilities(-) — sign conveys direction
  currentBalanceAsOf?: string; // ISO date

  // Financial parameters
  annualInterestRate?: number; // 0.08 = 8% APR (assets only, monthly compounding)
  compoundsPerYear?: number; // default 12
  isProperty?: boolean; // for home value tracking
  propertyAppreciationRate?: number; // annual, default 0

  // Rounding override (falls back to global)
  roundingStepCents?: Cents;
}

export type Frequency =
  | 'once'
  | 'weekly'
  | 'fortnightly'
  | 'monthly'
  | 'quarterly'
  | 'annually';

export type Recurrence = {
  frequency: Frequency;
  anchor?: {
    dayOfMonth?: number;
    nthWeekday?: {
      nth: 1 | 2 | 3 | 4 | 5 | -1;
      weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    };
  };
  businessDayRule?: 'none' | 'previous' | 'next' | 'modifiedFollowing';
  offsetDays?: number; // +/- from anchor
  startDate: string; // ISO
  endDate?: string; // ISO
  occurrences?: number;
  prorateFirst?: boolean;
  annualIndexationPct?: number; // applied at anniversary
  rruleText?: string; // optional RRULE string mirror
};

export type Cashflow = {
  id: string;
  accountId: string;
  amountCents: Cents; // positive magnitude; direction inferred from account kind
  description?: string;
  icon?: string; // emoji or icon name for display
  recurrence: Recurrence;
  effectiveFrom?: string; // future-dated changes
  // For percentage-based calculation from income flows or account balances
  percentageOf?: {
    sourceType: 'cashflow' | 'account'; // Type of source to calculate percentage from
    sourceId: string; // ID of the cashflow or account to calculate percentage from
    percentage: number; // e.g., 0.17 for 17%
  };
  // For transfers between accounts (e.g., debt payments, account-to-account transfers)
  targetAccountId?: string; // When specified, this cashflow moves money from accountId to targetAccountId
};

export type Scenario = {
  id: string;
  name: string;
  spendAdjustmentPct: number; // e.g., -0.10 for -10%
  scope: 'all' | 'discretionary'; // which expenses scale
  inflationPct?: number; // applied annually to expenses
  salaryGrowthPct?: number; // applied annually to incomes
};

export type TaxBracket = {
  threshold: Cents;
  rate: number; // e.g., 0.18 for 18%
};

export type TaxPresetZA = {
  taxYear: string; // '2025-26'
  brackets: Array<TaxBracket>;
  primaryRebate: Cents;
  secondaryRebate?: Cents; // age 65+
  tertiaryRebate?: Cents; // age 75+
  medicalAidCredits?: {
    member: Cents;
    firstDependent: Cents;
    additionalDependents: Cents;
  };
};

// Calculation step detail for transparency
export type CalculationStep = {
  description: string;
  formula: string;  
  values: Record<string, number | string>;
  result: number;
};

// Projection outputs
export type MonthlyProjection = {
  month: string; // ISO YYYY-MM
  accounts: Record<
    string,
    {
      openingBalance: Cents;
      income: Cents;
      expenses: Cents;
      netCashflow: Cents;
      interestEarned?: Cents;
      closingBalance: Cents;
      // Calculation breakdown for transparency
      calculationDetails?: {
        interestCalculation?: CalculationStep;
        cashflowCalculations?: CalculationStep[];
        appreciationCalculation?: CalculationStep;
      };
    }
  >;
  totalNetWorth: Cents;
  totalIncome: Cents;
  totalExpenses: Cents;
  savingsRate: number; // percentage
  // Track accounts that were paid off this month
  accountsPayoffEvents?: Array<{
    accountId: string;
    accountName: string;
    finalBalance: Cents; // Should be close to 0
  }>;
  // Monthly calculation breakdown
  calculationSummary?: {
    totalIncomeCalculation: CalculationStep;
    totalExpensesCalculation: CalculationStep;
    netWorthCalculation: CalculationStep;
    savingsRateCalculation: CalculationStep;
  };
};

// Payoff projection for liability accounts
export type PayoffProjection = {
  accountId: string;
  accountName: string;
  currentBalance: Cents; // negative for liabilities
  projectedPayoffMonth: string; // ISO YYYY-MM
  monthsToPayoff: number;
  totalInterestToPay: Cents;
  totalPayments: Cents;
};

export type ProjectionResult = {
  months: MonthlyProjection[];
  summary: {
    startNetWorth: Cents;
    endNetWorth: Cents;
    totalReturn: Cents;
    averageSavingsRate: number;
    projectionDate: string; // ISO timestamp
  };
  // Payoff projections for liability accounts
  payoffProjections?: PayoffProjection[];
};

// Audit trail for deterministic projections
export type AuditEntry = {
  month: string;
  input: {
    accounts: Account[];
    cashflows: Cashflow[];
    scenario: Scenario;
    taxSettings?: TaxPresetZA;
  };
  output: MonthlyProjection;
  timestamp: string; // ISO timestamp
  version: string; // projection engine version
};
