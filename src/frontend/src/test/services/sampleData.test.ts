import { describe, it, expect } from 'vitest';
import { SAMPLE_ACCOUNTS, SAMPLE_CASHFLOWS, SAMPLE_SCENARIOS } from '../../services/sampleData';

describe('Sample Data - Comprehensive Financial Scenario', () => {
  it('should have comprehensive account structure', () => {
    // Should have multiple account types
    const accountsByKind = SAMPLE_ACCOUNTS.reduce((acc, account) => {
      acc[account.kind] = (acc[account.kind] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(accountsByKind.income).toBe(2); // Dual income household
    expect(accountsByKind.investment).toBe(6); // Multiple investment types
    expect(accountsByKind.liability).toBe(5); // Multiple debt obligations
    
    // Should have realistic net worth
    const totalAssets = SAMPLE_ACCOUNTS
      .filter(acc => acc.openingBalanceCents && acc.openingBalanceCents > 0)
      .reduce((sum, acc) => sum + (acc.openingBalanceCents || 0), 0);
    
    const totalLiabilities = Math.abs(SAMPLE_ACCOUNTS
      .filter(acc => acc.openingBalanceCents && acc.openingBalanceCents < 0)
      .reduce((sum, acc) => sum + (acc.openingBalanceCents || 0), 0));
    
    const netWorth = totalAssets - totalLiabilities;
    
    // Should be around R6.7M (667M cents)
    expect(netWorth).toBeGreaterThan(600000000);
    expect(netWorth).toBeLessThan(700000000);
  });

  it('should have extensive use of percentage-based calculations', () => {
    const percentageBasedFlows = SAMPLE_CASHFLOWS.filter(cf => cf.percentageOf);
    
    // Should have at least 4 percentage-based calculations
    expect(percentageBasedFlows.length).toBeGreaterThanOrEqual(4);
    
    // Verify tax calculations
    const primaryTax = percentageBasedFlows.find(cf => cf.id === 'cf-tax-paye-primary');
    const spouseTax = percentageBasedFlows.find(cf => cf.id === 'cf-tax-paye-spouse');
    
    expect(primaryTax?.percentageOf?.percentage).toBe(0.18); // 18% tax rate
    expect(spouseTax?.percentageOf?.percentage).toBe(0.16); // 16% tax rate
    
    // Verify retirement contributions
    const primaryRetirement = percentageBasedFlows.find(cf => cf.id === 'cf-retirement-primary');
    const spouseRetirement = percentageBasedFlows.find(cf => cf.id === 'cf-retirement-spouse');
    
    expect(primaryRetirement?.percentageOf?.percentage).toBe(0.15); // 15% retirement
    expect(spouseRetirement?.percentageOf?.percentage).toBe(0.15); // 15% retirement
  });

  it('should have realistic monthly cash flow balance', () => {
    // Calculate monthly income flows
    const monthlyIncomes = SAMPLE_CASHFLOWS.filter(cf => 
      cf.recurrence.frequency === 'monthly' && 
      cf.amountCents > 0 &&
      (cf.accountId.includes('checking') || (cf.description && cf.description.toLowerCase().includes('income')))
    );
    
    const totalMonthlyIncome = monthlyIncomes.reduce((sum, cf) => sum + cf.amountCents, 0);
    
    // Should have substantial monthly income (> R100k)
    expect(totalMonthlyIncome).toBeGreaterThan(10000000); // R100k in cents
    
    // Calculate monthly expenses
    const monthlyExpenses = SAMPLE_CASHFLOWS.filter(cf => 
      cf.recurrence.frequency === 'monthly' && 
      cf.amountCents < 0
    );
    
    const totalMonthlyExpenses = Math.abs(monthlyExpenses.reduce((sum, cf) => sum + cf.amountCents, 0));
    
    // Should have significant expenses but not exceed income dramatically
    expect(totalMonthlyExpenses).toBeGreaterThan(6000000); // R60k in cents
    expect(totalMonthlyExpenses).toBeLessThan(totalMonthlyIncome * 1.2); // Max 120% of income
  });

  it('should have comprehensive scenario planning options', () => {
    // Should have multiple scenarios
    expect(SAMPLE_SCENARIOS.length).toBeGreaterThanOrEqual(6);
    
    // Should include baseline scenario
    const baseline = SAMPLE_SCENARIOS.find(s => s.spendAdjustmentPct === 0);
    expect(baseline).toBeDefined();
    
    // Should include conservative and aggressive scenarios
    const conservative = SAMPLE_SCENARIOS.find(s => s.spendAdjustmentPct < -0.1);
    const aggressive = SAMPLE_SCENARIOS.find(s => s.spendAdjustmentPct < -0.2);
    
    expect(conservative).toBeDefined();
    expect(aggressive).toBeDefined();
    
    // Should include realistic inflation rates for South Africa
    SAMPLE_SCENARIOS.forEach(scenario => {
      if (scenario.inflationPct) {
        expect(scenario.inflationPct).toBeGreaterThan(0.02); // At least 2%
        expect(scenario.inflationPct).toBeLessThan(0.15); // Less than 15%
      }
    });
  });

  it('should have diverse income sources', () => {
    const incomeDescriptions = SAMPLE_CASHFLOWS
      .filter(cf => cf.amountCents > 0)
      .map(cf => cf.description)
      .filter(desc => desc !== undefined);
    
    // Should include multiple types of income
    expect(incomeDescriptions.some(desc => desc.includes('Salary'))).toBe(true);
    expect(incomeDescriptions.some(desc => desc.includes('Bonus'))).toBe(true);
    expect(incomeDescriptions.some(desc => desc.includes('Rental'))).toBe(true);
    expect(incomeDescriptions.some(desc => desc.includes('Dividend'))).toBe(true);
    expect(incomeDescriptions.some(desc => desc.includes('Freelance'))).toBe(true);
  });

  it('should have detailed expense categories', () => {
    const expenseDescriptions = SAMPLE_CASHFLOWS
      .filter(cf => cf.amountCents < 0)
      .map(cf => cf.description)
      .filter(desc => desc !== undefined);
    
    // Should include comprehensive expense categories
    expect(expenseDescriptions.some(desc => desc.includes('Tax'))).toBe(true);
    expect(expenseDescriptions.some(desc => desc.includes('Insurance'))).toBe(true);
    expect(expenseDescriptions.some(desc => desc.includes('Medical'))).toBe(true);
    expect(expenseDescriptions.some(desc => desc.includes('School'))).toBe(true);
    expect(expenseDescriptions.some(desc => desc.includes('Vehicle') || desc.includes('Fuel'))).toBe(true);
    expect(expenseDescriptions.some(desc => desc.includes('Groceries'))).toBe(true);
    expect(expenseDescriptions.some(desc => desc.includes('Utilities') || desc.includes('Electricity'))).toBe(true);
  });

  it('should represent a dual-income professional household', () => {
    // Should have two salary sources
    const salaries = SAMPLE_CASHFLOWS.filter(cf => cf.description && cf.description.includes('Salary'));
    expect(salaries.length).toBe(2);
    
    // Should have professional development expenses
    const professional = SAMPLE_CASHFLOWS.filter(cf => 
      cf.description && (cf.description.includes('Professional') || cf.description.includes('Training'))
    );
    expect(professional.length).toBeGreaterThan(0);
    
    // Should have children-related expenses
    const childrenExpenses = SAMPLE_CASHFLOWS.filter(cf => 
      cf.description && (cf.description.includes('Children') || cf.description.includes('School'))
    );
    expect(childrenExpenses.length).toBeGreaterThan(0);
    
    // Should have multiple properties (primary + rental)
    const properties = SAMPLE_ACCOUNTS.filter(acc => acc.isProperty);
    expect(properties.length).toBe(2);
  });
});