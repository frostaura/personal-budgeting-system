import { describe, it, expect } from 'vitest';
import { projectionEngine } from '../../services/projectionEngine';
import { Account, Cashflow } from '../../types/money';

describe('ProjectionEngine - Account Payoff', () => {
  const mockAccounts: Account[] = [
    {
      id: 'acc-income',
      name: 'Income Account',
      kind: 'income',
      openingBalanceCents: 0,
    },
    {
      id: 'acc-checking',
      name: 'Checking Account',
      kind: 'reserve',
      openingBalanceCents: 100000000, // R1,000,000
    },
    {
      id: 'acc-homeloan',
      name: 'Home Loan',
      kind: 'liability',
      openingBalanceCents: -120000000, // -R1,200,000 (negative for liability)
      annualInterestRate: 0.10, // 10% interest
    },
  ];

  it('should project payoff date for liability accounts', () => {
    const salaryFlow: Cashflow = {
      id: 'cf-salary',
      accountId: 'acc-income',
      amountCents: 10000000, // R100,000 monthly
      description: 'Monthly Salary',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
    };

    const loanPaymentFlow: Cashflow = {
      id: 'cf-loan-payment',
      accountId: 'acc-checking',
      amountCents: 15000000, // R150,000 monthly payment
      description: 'Home Loan Payment',
      targetAccountId: 'acc-homeloan',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
    };

    const result = projectionEngine.projectFinances(
      mockAccounts,
      [salaryFlow, loanPaymentFlow],
      24 // 2 years
    );

    expect(result.payoffProjections).toBeDefined();
    expect(result.payoffProjections!.length).toBeGreaterThan(0);
    
    const loanPayoff = result.payoffProjections!.find(p => p.accountId === 'acc-homeloan');
    expect(loanPayoff).toBeDefined();
    expect(loanPayoff!.accountName).toBe('Home Loan');
    expect(loanPayoff!.currentBalance).toBe(-120000000);
    expect(loanPayoff!.monthsToPayoff).toBeGreaterThan(0);
    expect(loanPayoff!.projectedPayoffMonth).toMatch(/^\d{4}-\d{2}$/);
  });

  it('should handle percentage-based payoff calculations', () => {
    const salaryFlow: Cashflow = {
      id: 'cf-salary',
      accountId: 'acc-income',
      amountCents: 10000000, // R100,000 monthly
      description: 'Monthly Salary',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
    };

    // 10% of outstanding home loan balance as additional payment
    const extraPaymentFlow: Cashflow = {
      id: 'cf-extra-payment',
      accountId: 'acc-checking',
      amountCents: 0, // Amount calculated from percentage
      description: '10% Extra Payment on Home Loan',
      targetAccountId: 'acc-homeloan',
      percentageOf: {
        sourceType: 'account',
        sourceId: 'acc-homeloan',
        percentage: 0.10, // 10%
      },
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
    };

    // Add regular payment to make payoff feasible
    const regularPaymentFlow: Cashflow = {
      id: 'cf-regular-payment',
      accountId: 'acc-checking',
      amountCents: 15000000, // R150,000 base payment
      description: 'Regular Home Loan Payment',
      targetAccountId: 'acc-homeloan',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
    };

    const result = projectionEngine.projectFinances(
      mockAccounts,
      [salaryFlow, extraPaymentFlow, regularPaymentFlow],
      60 // 5 years
    );

    console.log('Percentage-based test result:', {
      months: result.months.length,
      payoffProjections: result.payoffProjections?.length || 0,
      firstMonthAccounts: result.months[0]?.accounts || {}
    });

    expect(result.payoffProjections).toBeDefined();
    expect(result.payoffProjections!.length).toBeGreaterThan(0);
    
    const loanPayoff = result.payoffProjections!.find(p => p.accountId === 'acc-homeloan');
    expect(loanPayoff).toBeDefined();
    expect(loanPayoff!.monthsToPayoff).toBeLessThan(60); // Should be paid off in less than 5 years
  });

  it('should track payoff events in monthly projections', () => {
    const simpleAccounts: Account[] = [
      {
        id: 'acc-income',
        name: 'Income Account',
        kind: 'income',
        openingBalanceCents: 0,
      },
      {
        id: 'acc-checking',
        name: 'Checking Account',
        kind: 'reserve',
        openingBalanceCents: 0,
      },
      {
        id: 'acc-credit-card',
        name: 'Credit Card',
        kind: 'liability',
        openingBalanceCents: -500000, // -R5,000 (small debt)
      },
    ];

    const salaryFlow: Cashflow = {
      id: 'cf-salary',
      accountId: 'acc-income',
      amountCents: 10000000, // R100,000 monthly
      description: 'Monthly Salary',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
    };

    const ccPaymentFlow: Cashflow = {
      id: 'cf-cc-payment',
      accountId: 'acc-checking',
      amountCents: 600000, // R6,000 monthly payment (more than balance)
      description: 'Credit Card Payment',
      targetAccountId: 'acc-credit-card',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
    };

    const result = projectionEngine.projectFinances(
      simpleAccounts,
      [salaryFlow, ccPaymentFlow],
      3 // 3 months
    );

    // Should have payoff event in first month
    const firstMonth = result.months[0];
    expect(firstMonth).toBeDefined();
    expect(firstMonth?.accountsPayoffEvents).toBeDefined();
    expect(firstMonth?.accountsPayoffEvents?.length).toBeGreaterThan(0);
    
    const payoffEvent = firstMonth?.accountsPayoffEvents?.find(e => e.accountId === 'acc-credit-card');
    expect(payoffEvent).toBeDefined();
    expect(payoffEvent?.accountName).toBe('Credit Card');
  });
});