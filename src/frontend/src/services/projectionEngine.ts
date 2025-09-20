import {
  Account,
  Cashflow,
  Scenario,
  MonthlyProjection,
  ProjectionResult,
  Cents,
} from '@/types/money';

/**
 * Deterministic financial projection engine
 * Projects financial future based on current balances, interest rates, and cash flows
 */
export class ProjectionEngine {
  /**
   * Calculate compound interest for a period
   */
  private calculateCompoundInterest(
    principal: Cents,
    annualRate: number,
    compoundsPerYear: number = 12,
    months: number = 1
  ): Cents {
    if (!annualRate || annualRate === 0) return 0;

    const periodicRate = annualRate / compoundsPerYear;
    const periods = (months / 12) * compoundsPerYear;
    const compoundedAmount = principal * Math.pow(1 + periodicRate, periods);

    return Math.round(compoundedAmount - principal);
  }

  /**
   * Apply property appreciation to property accounts
   */
  private calculatePropertyAppreciation(
    currentValue: Cents,
    annualAppreciationRate: number,
    months: number = 1
  ): Cents {
    if (!annualAppreciationRate || annualAppreciationRate === 0) return 0;

    const monthlyRate = annualAppreciationRate / 12;
    const appreciatedAmount = currentValue * Math.pow(1 + monthlyRate, months);

    return Math.round(appreciatedAmount - currentValue);
  }

  /**
   * Get cash flows that occur in a specific month
   */
  private getCashflowsForMonth(
    cashflows: Cashflow[],
    targetMonth: Date,
    startDate: Date
  ): Cashflow[] {
    return cashflows.filter(cf => {
      const cfStartDate = new Date(cf.recurrence.startDate);

      // Check if cashflow has started
      if (cfStartDate > targetMonth) return false;

      // Check if cashflow has ended
      if (
        cf.recurrence.endDate &&
        new Date(cf.recurrence.endDate) < targetMonth
      ) {
        return false;
      }

      return this.shouldCashflowOccur(cf, targetMonth, startDate);
    });
  }

  /**
   * Determine if a cashflow should occur in a specific month
   */
  private shouldCashflowOccur(
    cashflow: Cashflow,
    targetMonth: Date,
    _startDate: Date
  ): boolean {
    const cfStartDate = new Date(cashflow.recurrence.startDate);
    const monthsSinceStart = this.getMonthsDifference(cfStartDate, targetMonth);

    switch (cashflow.recurrence.frequency) {
      case 'once':
        return (
          targetMonth.getFullYear() === cfStartDate.getFullYear() &&
          targetMonth.getMonth() === cfStartDate.getMonth()
        );

      case 'weekly':
        // Simplified: assume weekly payments occur 4.33 times per month
        return true; // For now, treat as monthly

      case 'fortnightly':
        // Simplified: assume fortnightly payments occur 2.17 times per month
        return true; // For now, treat as monthly

      case 'monthly':
        // Check if the day of month matches (if specified)
        if (cashflow.recurrence.anchor?.dayOfMonth) {
          return targetMonth.getDate() >= cashflow.recurrence.anchor.dayOfMonth;
        }
        return true;

      case 'quarterly':
        return monthsSinceStart % 3 === 0;

      case 'annually':
        return monthsSinceStart % 12 === 0;

      default:
        return false;
    }
  }

  /**
   * Calculate effective cash flow amount including percentage-based calculations
   */
  private getEffectiveCashflowAmount(
    cashflow: Cashflow,
    allCashflows: Cashflow[],
    allAccounts: Account[],
    accountBalances: Map<string, Cents>,
    monthsFromStart: number
  ): Cents {
    // If percentage-based, calculate amount from source
    if (cashflow.percentageOf) {
      if (cashflow.percentageOf.sourceType === 'cashflow') {
        // Calculate percentage of another cashflow
        const sourceCashflow = allCashflows.find(
          cf => cf.id === cashflow.percentageOf!.sourceId
        );
        
        if (sourceCashflow) {
          const sourceAmount = this.getIndexedCashflowAmount(sourceCashflow, monthsFromStart);
          return Math.round(sourceAmount * cashflow.percentageOf.percentage);
        }
      } else if (cashflow.percentageOf.sourceType === 'account') {
        // Calculate percentage of account balance
        const sourceAccount = allAccounts.find(
          acc => acc.id === cashflow.percentageOf!.sourceId
        );
        
        if (sourceAccount) {
          const accountBalance = accountBalances.get(sourceAccount.id) || 0;
          // For liability accounts, use absolute value for percentage calculation
          const balanceForCalculation = sourceAccount.kind === 'liability' ? Math.abs(accountBalance) : accountBalance;
          return Math.round(balanceForCalculation * cashflow.percentageOf.percentage);
        }
      }
    }

    // Regular indexed amount calculation
    return this.getIndexedCashflowAmount(cashflow, monthsFromStart);
  }

  /**
   * Apply annual indexation to cashflow amounts
   */
  private getIndexedCashflowAmount(
    cashflow: Cashflow,
    monthsFromStart: number
  ): Cents {
    if (!cashflow.recurrence.annualIndexationPct) {
      return cashflow.amountCents;
    }

    const yearsElapsed = monthsFromStart / 12;
    const indexationFactor = Math.pow(
      1 + cashflow.recurrence.annualIndexationPct,
      yearsElapsed
    );

    return Math.round(cashflow.amountCents * indexationFactor);
  }

  /**
   * Get the difference in months between two dates
   */
  private getMonthsDifference(startDate: Date, endDate: Date): number {
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    );
  }

  /**
   * Apply scenario adjustments to accounts and cashflows
   */
  private applyScenarioAdjustments(
    accounts: Account[],
    cashflows: Cashflow[],
    scenario?: Scenario
  ): { adjustedAccounts: Account[]; adjustedCashflows: Cashflow[] } {
    if (!scenario) {
      return {
        adjustedAccounts: [...accounts],
        adjustedCashflows: [...cashflows],
      };
    }

    // Apply spending adjustments to relevant cashflows
    const adjustedCashflows = cashflows.map(cf => {
      // Only apply adjustments to expense cashflows
      const account = accounts.find(acc => acc.id === cf.accountId);
      if (!account || account.kind === 'income') return cf;

      // Apply adjustment based on scope
      if (
        scenario.scope === 'all' ||
        (scenario.scope === 'discretionary' && this.isDiscretionaryExpense(cf))
      ) {
        return {
          ...cf,
          amountCents: Math.round(
            cf.amountCents * (1 + scenario.spendAdjustmentPct)
          ),
        };
      }

      return cf;
    });

    return { adjustedAccounts: [...accounts], adjustedCashflows };
  }

  /**
   * Determine if a cashflow is discretionary spending
   */
  private isDiscretionaryExpense(cashflow: Cashflow): boolean {
    const discretionaryKeywords = [
      'entertainment',
      'dining',
      'clothing',
      'shopping',
      'hobby',
      'vacation',
      'leisure',
      'personal',
      'discretionary',
    ];

    const description = cashflow.description?.toLowerCase() || '';
    return discretionaryKeywords.some(keyword => description.includes(keyword));
  }

  /**
   * Project financial future for specified number of months
   */
  public projectFinances(
    accounts: Account[],
    cashflows: Cashflow[],
    monthsToProject: number,
    scenario?: Scenario
  ): ProjectionResult {
    const startDate = new Date();
    const projectionMonths: MonthlyProjection[] = [];

    // Apply scenario adjustments
    const { adjustedAccounts, adjustedCashflows } =
      this.applyScenarioAdjustments(accounts, cashflows, scenario);

    // Initialize account balances
    let currentAccountBalances = new Map<string, Cents>();
    adjustedAccounts.forEach(account => {
      currentAccountBalances.set(account.id, account.openingBalanceCents || 0);
    });

    const startNetWorth = this.calculateNetWorth(
      currentAccountBalances,
      adjustedAccounts
    );

    // Project each month
    for (let monthIndex = 0; monthIndex < monthsToProject; monthIndex++) {
      const projectionDate = new Date(startDate);
      projectionDate.setMonth(projectionDate.getMonth() + monthIndex);

      const monthlyAccountData: Record<
        string,
        {
          openingBalance: Cents;
          income: Cents;
          expenses: Cents;
          netCashflow: Cents;
          interestEarned: Cents;
          closingBalance: Cents;
        }
      > = {};
      let totalIncome = 0;
      let totalExpenses = 0;

      // Process each account
      for (const account of adjustedAccounts) {
        const openingBalance = currentAccountBalances.get(account.id) || 0;

        // Get relevant cashflows for this account and month
        const accountCashflows = adjustedCashflows.filter(
          cf => cf.accountId === account.id
        );
        const monthCashflows = this.getCashflowsForMonth(
          accountCashflows,
          projectionDate,
          startDate
        );

        // Calculate total cashflow for this account this month
        let netCashflow = 0;
        for (const cf of monthCashflows) {
          const monthsFromStart = this.getMonthsDifference(
            new Date(cf.recurrence.startDate),
            projectionDate
          );
          const effectiveAmount = this.getEffectiveCashflowAmount(
            cf,
            adjustedCashflows,
            adjustedAccounts,
            currentAccountBalances,
            monthsFromStart
          );

          if (account.kind === 'income') {
            netCashflow += effectiveAmount;
            totalIncome += effectiveAmount;
          } else {
            netCashflow -= effectiveAmount;
            totalExpenses += effectiveAmount;
          }
        }

        // Calculate interest earned (for assets) or charged (for liabilities)
        let interestEarned = 0;
        if (account.annualInterestRate) {
          const balanceForInterest = openingBalance + netCashflow / 2; // Use average balance
          interestEarned = this.calculateCompoundInterest(
            balanceForInterest,
            account.annualInterestRate,
            account.compoundsPerYear || 12,
            1
          );
        }

        // Calculate property appreciation if applicable
        let appreciationGain = 0;
        if (account.isProperty && account.propertyAppreciationRate) {
          appreciationGain = this.calculatePropertyAppreciation(
            openingBalance,
            account.propertyAppreciationRate,
            1
          );
        }

        // Calculate closing balance
        const closingBalance =
          openingBalance + netCashflow + interestEarned + appreciationGain;

        // Update the running balance
        currentAccountBalances.set(account.id, closingBalance);

        // Store monthly data
        monthlyAccountData[account.id] = {
          openingBalance,
          income: account.kind === 'income' ? netCashflow : 0,
          expenses: account.kind !== 'income' ? Math.abs(netCashflow) : 0,
          netCashflow,
          interestEarned: interestEarned + appreciationGain,
          closingBalance,
        };
      }

      // Calculate month totals
      const totalNetWorth = this.calculateNetWorth(
        currentAccountBalances,
        adjustedAccounts
      );
      const savingsRate =
        totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

      projectionMonths.push({
        month: projectionDate.toISOString().slice(0, 7), // YYYY-MM format
        accounts: monthlyAccountData,
        totalNetWorth,
        totalIncome,
        totalExpenses,
        savingsRate,
      });
    }

    const endNetWorth =
      projectionMonths[projectionMonths.length - 1]?.totalNetWorth ||
      startNetWorth;
    const totalReturn = endNetWorth - startNetWorth;
    const averageSavingsRate =
      projectionMonths.reduce((sum, month) => sum + month.savingsRate, 0) /
      projectionMonths.length;

    return {
      months: projectionMonths,
      summary: {
        startNetWorth,
        endNetWorth,
        totalReturn,
        averageSavingsRate,
        projectionDate: new Date().toISOString(),
      },
    };
  }

  /**
   * Calculate total net worth from account balances
   */
  private calculateNetWorth(
    balances: Map<string, Cents>,
    accounts: Account[]
  ): Cents {
    let netWorth = 0;

    for (const account of accounts) {
      const balance = balances.get(account.id) || 0;

      if (account.kind === 'liability') {
        netWorth -= Math.abs(balance); // Liabilities reduce net worth
      } else {
        netWorth += balance; // Assets increase net worth
      }
    }

    return netWorth;
  }
}

// Singleton instance
export const projectionEngine = new ProjectionEngine();
