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
    
    const firstMonth = result.months[0];
    console.log('First month accounts:', firstMonth.accounts);
    
    // Check that income account received the salary
    expect(firstMonth.accounts['acc-income']).toBeDefined();
    expect(firstMonth.accounts['acc-income'].income).toBe(5000000);
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
        sourceCashflowId: 'cf-salary',
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
    
    const firstMonth = result.months[0];
    
    // Salary should remain as original amount
    expect(firstMonth.accounts['acc-income'].income).toBe(5000000); // R50,000
    
    // Tax should be 17% of salary = R50,000 * 0.17 = R8,500 = 850,000 cents
    expect(firstMonth.accounts['acc-expense'].expenses).toBe(850000);
  });
});