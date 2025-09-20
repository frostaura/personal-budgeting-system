import { describe, it, expect } from 'vitest';
import { projectionEngine } from '../../services/projectionEngine';
import { Account, Cashflow } from '../../types/money';

describe('ProjectionEngine - Percentage-based Cash Flows', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc-income',
      name: 'Income Account',
      kind: 'income',
      openingBalanceCents: 100000000, // R1,000,000
    },
    {
      id: 'acc-expense',
      name: 'Expense Account',
      kind: 'expense',
      openingBalanceCents: 0,
    },
  ];

  it('should process basic cash flows correctly (debugging)', () => {
    const salaryFlow: Cashflow = {
      id: 'cf-salary',
      accountId: 'acc-income',
      amountCents: 5000000, // R50,000
      description: 'Monthly Salary',
      recurrence: {
        frequency: 'monthly',
        anchor: { dayOfMonth: 1 }, // Use 1st of month for predictability
        startDate: '2024-01-01',
      },
    };

    const result = projectionEngine.projectFinances(
      mockAccounts,
      [salaryFlow],
      1 // 1 month
    );

    console.log('Result:', JSON.stringify(result, null, 2));
    
    expect(result.months).toHaveLength(1);
    
    const firstMonth = result.months[0]!;
    console.log('First month accounts:', firstMonth.accounts);
    
    // Check that income account received the salary
    expect(firstMonth.accounts['acc-income']).toBeDefined();
    expect(firstMonth.accounts['acc-income']?.income).toBe(5000000);
  });

  it('should calculate percentage-based cash flow amounts correctly', () => {
    const today = new Date();
    const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    
    const salaryFlow: Cashflow = {
      id: 'cf-salary',
      accountId: 'acc-income',
      amountCents: 5000000, // R50,000
      description: 'Monthly Salary',
      recurrence: {
        frequency: 'monthly',
        anchor: { dayOfMonth: 1 },
        startDate,
      },
    };

    const taxFlow: Cashflow = {
      id: 'cf-tax',
      accountId: 'acc-expense',
      amountCents: 850000, // Base amount R8,500 (will be overridden by percentage)
      description: 'Income Tax',
      recurrence: {
        frequency: 'monthly',
        anchor: { dayOfMonth: 1 },
        startDate,
      },
      percentageOf: {
        sourceType: 'cashflow',
        sourceId: 'cf-salary',
        percentage: 0.17, // 17% of salary
      },
    };

    const result = projectionEngine.projectFinances(
      mockAccounts,
      [salaryFlow, taxFlow],
      1 // 1 month
    );

    console.log('Result with percentage:', JSON.stringify(result, null, 2));

    expect(result.months).toHaveLength(1);
    
    const firstMonth = result.months[0]!;
    
    // Salary should remain as original amount
    expect(firstMonth.accounts['acc-income']?.income).toBe(5000000); // R50,000
    
    // Tax should be 17% of salary = R50,000 * 0.17 = R8,500 = 850,000 cents
    expect(firstMonth.accounts['acc-expense']?.expenses).toBe(850000);
  });

  it('should calculate percentage of account balance correctly', () => {
    const today = new Date();
    const startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    
    // Create a liability account with an opening balance (like a home loan)
    const loanAccount: Account = {
      id: 'acc-homeloan',
      name: 'Home Loan',
      kind: 'liability',
      openingBalanceCents: -200000000, // R2,000,000 loan balance (negative for liability)
    };

    // Create an interest payment that's 1% of the loan balance per month
    const interestFlow: Cashflow = {
      id: 'cf-interest',
      accountId: 'acc-expense',
      amountCents: 0, // Will be calculated from percentage
      description: 'Home Loan Interest',
      recurrence: {
        frequency: 'monthly',
        anchor: { dayOfMonth: 1 },
        startDate,
      },
      percentageOf: {
        sourceType: 'account',
        sourceId: 'acc-homeloan',
        percentage: 0.01, // 1% of loan balance
      },
    };

    const accountsWithLoan = [...mockAccounts, loanAccount];

    const result = projectionEngine.projectFinances(
      accountsWithLoan,
      [interestFlow],
      1 // 1 month
    );

    console.log('Result with account percentage:', JSON.stringify(result, null, 2));
    
    expect(result.months).toHaveLength(1);
    
    const firstMonth = result.months[0]!;
    // Interest should be 1% of R2,000,000 = R20,000 = 2000000 cents
    expect(firstMonth.accounts['acc-expense']?.expenses).toBe(2000000);
    // Loan balance should remain the same in opening balance
    expect(firstMonth.accounts['acc-homeloan']?.openingBalance).toBe(-200000000);
  });
});