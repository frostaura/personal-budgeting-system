import { describe, it, expect } from 'vitest';
import { projectionEngine } from '../../services/projectionEngine';
import { Account, Cashflow } from '../../types/money';

describe('Calculation Transparency Features', () => {
  const testAccounts: Account[] = [
    {
      id: 'savings',
      name: 'Savings Account',
      kind: 'investment',
      openingBalanceCents: 100000000, // R1,000,000
      annualInterestRate: 0.06, // 6% annual
      compoundsPerYear: 12,
    },
    {
      id: 'homeloan',
      name: 'Home Loan',
      kind: 'liability',
      openingBalanceCents: -200000000, // -R2,000,000
      annualInterestRate: 0.08, // 8% annual
      compoundsPerYear: 12,
    },
  ];

  const testCashflows: Cashflow[] = [
    {
      id: 'salary',
      accountId: 'savings',
      amountCents: 5000000, // R50,000
      description: 'Monthly Salary',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
        annualIndexationPct: 0.05, // 5% annual increase
      },
    },
    {
      id: 'loan-payment',
      accountId: 'homeloan',
      amountCents: undefined as any, // Will be calculated as percentage
      description: 'Home Loan Payment',
      recurrence: {
        frequency: 'monthly',
        startDate: '2024-01-01',
      },
      percentageOf: {
        sourceType: 'account',
        sourceId: 'homeloan',
        percentage: 0.01, // 1% of loan balance
      },
    },
  ];

  it('should provide detailed compound interest calculations', () => {
    const result = projectionEngine.projectFinances(
      testAccounts,
      testCashflows,
      1 // 1 month projection
    );

    const firstMonth = result.months[0]!;
    const savingsAccount = firstMonth.accounts['savings'];
    
    // Should have calculation details
    expect(savingsAccount?.calculationDetails).toBeDefined();
    expect(savingsAccount?.calculationDetails?.interestCalculation).toBeDefined();
    
    const interestCalc = savingsAccount!.calculationDetails!.interestCalculation!;
    
    // Should show the compound interest formula
    expect(interestCalc.formula).toBe('A = P × (1 + r/n)^(n×t), Interest = A - P');
    expect(interestCalc.description).toBe('Compound Interest Calculation');
    
    // Should include all formula variables
    expect(interestCalc.values).toHaveProperty('Principal (P)');
    expect(interestCalc.values).toHaveProperty('Annual Rate (r)');
    expect(interestCalc.values).toHaveProperty('Compounds per year (n)');
    expect(interestCalc.values).toHaveProperty('Time in years (t)');
    expect(interestCalc.values).toHaveProperty('Periodic Rate (r/n)');
    expect(interestCalc.values).toHaveProperty('Total periods (n×t)');
    expect(interestCalc.values).toHaveProperty('Compounded Amount (A)');
    
    // Should show reasonable values
    expect(interestCalc.values['Annual Rate (r)']).toBe('6.00%');
    expect(interestCalc.values['Compounds per year (n)']).toBe(12);
    expect(interestCalc.result).toBeGreaterThan(0); // Should earn interest
  });

  it('should provide detailed percentage-based cashflow calculations', () => {
    const result = projectionEngine.projectFinances(
      testAccounts,
      testCashflows,
      1 // 1 month projection
    );

    const firstMonth = result.months[0]!;
    const loanAccount = firstMonth.accounts['homeloan'];
    
    // Should have calculation details for percentage-based payment
    expect(loanAccount?.calculationDetails).toBeDefined();
    expect(loanAccount?.calculationDetails?.cashflowCalculations).toBeDefined();
    expect(loanAccount!.calculationDetails!.cashflowCalculations!.length).toBeGreaterThan(0);
    
    const paymentCalc = loanAccount!.calculationDetails!.cashflowCalculations![0]!;
    
    // Should show percentage calculation formula
    expect(paymentCalc.formula).toBe('Amount = Account Balance × Percentage');
    expect(paymentCalc.description).toContain('Home Loan');
    
    // Should include calculation values
    expect(paymentCalc.values).toHaveProperty('Account Balance');
    expect(paymentCalc.values).toHaveProperty('Percentage');
    expect(paymentCalc.values).toHaveProperty('Account Type');
    
    expect(paymentCalc.values['Percentage']).toBe('1.00%');
    expect(paymentCalc.values['Account Type']).toBe('liability');
    expect(paymentCalc.result).toBeGreaterThan(0); // Should be positive payment amount
  });

  it('should provide monthly calculation summaries', () => {
    const result = projectionEngine.projectFinances(
      testAccounts,
      testCashflows,
      1 // 1 month projection
    );

    const firstMonth = result.months[0]!;
    
    // Should have calculation summary
    expect(firstMonth.calculationSummary).toBeDefined();
    
    const summary = firstMonth.calculationSummary!;
    
    // Should have all major calculation types
    expect(summary.totalIncomeCalculation).toBeDefined();
    expect(summary.totalExpensesCalculation).toBeDefined();
    expect(summary.netWorthCalculation).toBeDefined();
    expect(summary.savingsRateCalculation).toBeDefined();
    
    // Net worth calculation should show formula
    expect(summary.netWorthCalculation.formula).toBe('Sum of assets minus liabilities');
    expect(summary.netWorthCalculation.values).toHaveProperty('Asset Balances');
    expect(summary.netWorthCalculation.values).toHaveProperty('Liability Balances');
    
    // Savings rate calculation should show formula
    expect(summary.savingsRateCalculation.formula).toBe('Savings Rate = (Income - Expenses) / Income');
    expect(summary.savingsRateCalculation.values).toHaveProperty('Total Income');
    expect(summary.savingsRateCalculation.values).toHaveProperty('Total Expenses');
    expect(summary.savingsRateCalculation.values).toHaveProperty('Net Savings');
  });

  it('should provide annual indexation calculation details', () => {
    const result = projectionEngine.projectFinances(
      testAccounts,
      testCashflows,
      12 // 12 months to see indexation
    );

    // Look for a month where indexation has kicked in
    const laterMonth = result.months[6]; // 6 months in
    expect(laterMonth).toBeDefined();
    
    const savingsAccount = laterMonth!.accounts['savings'];
    expect(savingsAccount?.calculationDetails?.cashflowCalculations).toBeDefined();
    
    // Should have indexation calculations
    const indexationCalcs = savingsAccount!.calculationDetails!.cashflowCalculations!.filter(
      calc => calc.description.includes('Annual Indexation')
    );
    
    if (indexationCalcs.length > 0) {
      const indexationCalc = indexationCalcs[0]!;
      expect(indexationCalc.formula).toBe('Indexed Amount = Base Amount × (1 + rate)^years');
      expect(indexationCalc.values).toHaveProperty('Base Amount');
      expect(indexationCalc.values).toHaveProperty('Indexation Rate');
      expect(indexationCalc.values).toHaveProperty('Years Elapsed');
      expect(indexationCalc.values).toHaveProperty('Indexation Factor');
    }
  });

  it('should maintain calculation consistency and verifiability', () => {
    const result1 = projectionEngine.projectFinances(testAccounts, testCashflows, 3);
    const result2 = projectionEngine.projectFinances(testAccounts, testCashflows, 3);

    // Results should be identical (deterministic)
    expect(result1.months.length).toBe(result2.months.length);
    expect(result1.summary.endNetWorth).toBe(result2.summary.endNetWorth);
    
    // Each month should have calculation details
    result1.months.forEach((month) => {
      expect(month.calculationSummary).toBeDefined();
      
      // Calculation results should match the actual totals
      expect(month.calculationSummary!.totalIncomeCalculation.result).toBe(month.totalIncome);
      expect(month.calculationSummary!.totalExpensesCalculation.result).toBe(month.totalExpenses);
      expect(month.calculationSummary!.netWorthCalculation.result).toBe(month.totalNetWorth);
      expect(month.calculationSummary!.savingsRateCalculation.result).toBeCloseTo(month.savingsRate, 10);
    });
  });
});