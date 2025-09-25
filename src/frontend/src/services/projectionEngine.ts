import {
  Account,
  Cashflow,
  Scenario,
  MonthlyProjection,
  ProjectionResult,
  PayoffProjection,
  Cents,
  CalculationStep,
} from '@/types/money';

/**
 * Deterministic financial projection engine
 * Projects financial future based on current balances, interest rates, and cash flows
 */
export class ProjectionEngine {
  /**
   * Create a calculation step for transparency
   */
  private createCalculationStep(
    description: string,
    formula: string,
    values: Record<string, number | string>, 
    result: number
  ): CalculationStep {
    return {
      description,
      formula,
      values,
      result,
    };
  }

  /**
   * Calculate compound interest for a period with detailed explanation
   */
  private calculateCompoundInterestWithDetails(
    principal: Cents,
    annualRate: number,
    compoundsPerYear: number = 12,
    months: number = 1
  ): { interest: Cents; calculation: CalculationStep } {
    if (!annualRate || annualRate === 0) {
      return {
        interest: 0,
        calculation: this.createCalculationStep(
          'No interest calculation',
          'Interest = 0 (no rate set)',
          { principal, annualRate, months },
          0
        ),
      };
    }

    const periodicRate = annualRate / compoundsPerYear;
    const periods = (months / 12) * compoundsPerYear;
    const compoundedAmount = principal * Math.pow(1 + periodicRate, periods);
    const interest = Math.round(compoundedAmount - principal);

    const calculation = this.createCalculationStep(
      'Compound Interest Calculation',
      'A = P × (1 + r/n)^(n×t), Interest = A - P',
      {
        'Principal (P)': `R${(principal / 100).toFixed(2)}`,
        'Annual Rate (r)': `${(annualRate * 100).toFixed(2)}%`,
        'Compounds per year (n)': compoundsPerYear,
        'Time in years (t)': `${(months / 12).toFixed(4)}`,
        'Periodic Rate (r/n)': `${(periodicRate * 100).toFixed(4)}%`,
        'Total periods (n×t)': periods.toFixed(2),
        'Compounded Amount (A)': `R${(compoundedAmount / 100).toFixed(2)}`,
      },
      interest
    );

    return { interest, calculation };
  }

  /**
   * Apply property appreciation to property accounts with detailed explanation
   */
  private calculatePropertyAppreciationWithDetails(
    currentValue: Cents,
    annualAppreciationRate: number,
    months: number = 1
  ): { appreciation: Cents; calculation: CalculationStep } {
    if (!annualAppreciationRate || annualAppreciationRate === 0) {
      return {
        appreciation: 0,
        calculation: this.createCalculationStep(
          'No property appreciation',
          'Appreciation = 0 (no rate set)',
          { currentValue, annualAppreciationRate, months },
          0
        ),
      };
    }

    const monthlyRate = annualAppreciationRate / 12;
    const appreciatedAmount = currentValue * Math.pow(1 + monthlyRate, months);
    const appreciation = Math.round(appreciatedAmount - currentValue);

    const calculation = this.createCalculationStep(
      'Property Appreciation Calculation',
      'A = V × (1 + r/12)^months, Appreciation = A - V',
      {
        'Current Value (V)': `R${(currentValue / 100).toFixed(2)}`,
        'Annual Rate (r)': `${(annualAppreciationRate * 100).toFixed(2)}%`,
        'Monthly Rate (r/12)': `${(monthlyRate * 100).toFixed(4)}%`,
        'Months': months,
        'Appreciated Value (A)': `R${(appreciatedAmount / 100).toFixed(2)}`,
      },
      appreciation
    );

    return { appreciation, calculation };
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
   * Calculate effective cash flow amount including percentage-based calculations with details
   */
  private getEffectiveCashflowAmountWithDetails(
    cashflow: Cashflow,
    allCashflows: Cashflow[],
    allAccounts: Account[],
    accountBalances: Map<string, Cents>,
    monthsFromStart: number
  ): { amount: Cents; calculation?: CalculationStep } {
    // If percentage-based, calculate amount from source
    if (cashflow.percentageOf) {
      if (cashflow.percentageOf.sourceType === 'cashflow') {
        // Calculate percentage of another cashflow
        const sourceCashflow = allCashflows.find(
          cf => cf.id === cashflow.percentageOf!.sourceId
        );
        
        if (sourceCashflow) {
          const sourceAmount = this.getIndexedCashflowAmount(sourceCashflow, monthsFromStart);
          const result = Math.round(sourceAmount * cashflow.percentageOf.percentage);
          
          const calculation = this.createCalculationStep(
            `Percentage of ${sourceCashflow.description || 'Cash Flow'}`,
            'Amount = Source Amount × Percentage',
            {
              'Source Amount': `R${(sourceAmount / 100).toFixed(2)}`,
              'Percentage': `${(cashflow.percentageOf.percentage * 100).toFixed(2)}%`,
            },
            result
          );

          return { amount: result, calculation };
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
          const result = Math.round(balanceForCalculation * cashflow.percentageOf.percentage);

          const calculation = this.createCalculationStep(
            `Percentage of ${sourceAccount.name} Balance`,
            'Amount = Account Balance × Percentage',
            {
              'Account Balance': `R${(balanceForCalculation / 100).toFixed(2)}`,
              'Percentage': `${(cashflow.percentageOf.percentage * 100).toFixed(2)}%`,
              'Account Type': sourceAccount.kind,
            },
            result
          );

          return { amount: result, calculation };
        }
      }
    }

    // Regular indexed amount calculation
    const baseAmount = this.getIndexedCashflowAmount(cashflow, monthsFromStart);
    
    // Show indexation calculation if applicable
    if (cashflow.recurrence.annualIndexationPct && monthsFromStart > 0) {
      const yearsElapsed = monthsFromStart / 12;
      const indexationFactor = Math.pow(1 + cashflow.recurrence.annualIndexationPct, yearsElapsed);
      
      const calculation = this.createCalculationStep(
        'Annual Indexation Applied',
        'Indexed Amount = Base Amount × (1 + rate)^years',
        {
          'Base Amount': `R${(cashflow.amountCents / 100).toFixed(2)}`,
          'Indexation Rate': `${(cashflow.recurrence.annualIndexationPct * 100).toFixed(2)}%`,
          'Years Elapsed': yearsElapsed.toFixed(2),
          'Indexation Factor': indexationFactor.toFixed(4),
        },
        baseAmount
      );

      return { amount: baseAmount, calculation };
    }

    return { amount: baseAmount };
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

        // Calculate total cashflow for this account this month with detailed calculations
        let netCashflow = 0;
        const cashflowCalculations: CalculationStep[] = [];
        
        for (const cf of monthCashflows) {
          const monthsFromStart = this.getMonthsDifference(
            new Date(cf.recurrence.startDate),
            projectionDate
          );
          const { amount: effectiveAmount, calculation } = this.getEffectiveCashflowAmountWithDetails(
            cf,
            adjustedCashflows,
            adjustedAccounts,
            currentAccountBalances,
            monthsFromStart
          );

          // Track calculation details if available
          if (calculation) {
            cashflowCalculations.push(calculation);
          }

          if (account.kind === 'income') {
            netCashflow += effectiveAmount;
            totalIncome += effectiveAmount;
          } else {
            netCashflow -= effectiveAmount;
            totalExpenses += effectiveAmount;
          }
        }

        // Process transfer cashflows where this account is the target
        const transfersToAccount = adjustedCashflows.filter(
          cf => cf.targetAccountId === account.id
        );
        const monthTransfersTo = this.getCashflowsForMonth(
          transfersToAccount,
          projectionDate,
          startDate
        );
        
        for (const cf of monthTransfersTo) {
          const monthsFromStart = this.getMonthsDifference(
            new Date(cf.recurrence.startDate),
            projectionDate
          );
          const { amount: effectiveAmount, calculation } = this.getEffectiveCashflowAmountWithDetails(
            cf,
            adjustedCashflows,
            adjustedAccounts,
            currentAccountBalances,
            monthsFromStart
          );
          
          // Track transfer calculation details
          if (calculation) {
            cashflowCalculations.push({
              ...calculation,
              description: `Transfer: ${calculation.description}`,
            });
          }
          
          // Transfers to this account increase the balance
          netCashflow += effectiveAmount;
        }

        // Calculate interest earned (for assets) or charged (for liabilities) with details
        let interestEarned = 0;
        let interestCalculation: CalculationStep | undefined;
        
        if (account.annualInterestRate) {
          const balanceForInterest = openingBalance + netCashflow / 2; // Use average balance
          const interestResult = this.calculateCompoundInterestWithDetails(
            balanceForInterest,
            account.annualInterestRate,
            account.compoundsPerYear || 12,
            1
          );
          interestEarned = interestResult.interest;
          interestCalculation = interestResult.calculation;
        }

        // Calculate property appreciation if applicable with details
        let appreciationGain = 0;
        let appreciationCalculation: CalculationStep | undefined;
        
        if (account.isProperty && account.propertyAppreciationRate) {
          const appreciationResult = this.calculatePropertyAppreciationWithDetails(
            openingBalance,
            account.propertyAppreciationRate,
            1
          );
          appreciationGain = appreciationResult.appreciation;
          appreciationCalculation = appreciationResult.calculation;
        }

        // Calculate closing balance
        const closingBalance =
          openingBalance + netCashflow + interestEarned + appreciationGain;

        // Update the running balance
        currentAccountBalances.set(account.id, closingBalance);

        // Store monthly data with calculation details
        const accountCalculationDetails: any = {};
        
        if (interestCalculation) {
          accountCalculationDetails.interestCalculation = interestCalculation;
        }
        
        if (appreciationCalculation) {
          accountCalculationDetails.appreciationCalculation = appreciationCalculation;
        }
        
        if (cashflowCalculations.length > 0) {
          accountCalculationDetails.cashflowCalculations = cashflowCalculations;
        }

        monthlyAccountData[account.id] = {
          openingBalance,
          income: account.kind === 'income' ? netCashflow : 0,
          expenses: account.kind !== 'income' ? Math.abs(netCashflow) : 0,
          netCashflow,
          interestEarned: interestEarned + appreciationGain,
          closingBalance,
          // Add calculation details if any exist
          ...(Object.keys(accountCalculationDetails).length > 0 && {
            calculationDetails: accountCalculationDetails,
          }),
        };
      }

      // Track liability accounts that got paid off this month
      const payoffEvents: Array<{
        accountId: string;
        accountName: string;
        finalBalance: Cents;
      }> = [];

      for (const account of adjustedAccounts) {
        if (account.kind === 'liability') {
          const openingBalance = monthlyAccountData[account.id]?.openingBalance || 0;
          const closingBalance = monthlyAccountData[account.id]?.closingBalance || 0;
          
          // Check if liability was paid off (went from negative to zero or positive)
          if (openingBalance < 0 && closingBalance >= -1000) { // Allow small rounding errors
            payoffEvents.push({
              accountId: account.id,
              accountName: account.name,
              finalBalance: closingBalance,
            });
          }
        }
      }

      // Calculate month totals with calculation details
      const totalNetWorth = this.calculateNetWorth(
        currentAccountBalances,
        adjustedAccounts
      );
      const savingsRate =
        totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;

      // Create calculation summaries for transparency
      const calculationSummary = {
        totalIncomeCalculation: this.createCalculationStep(
          'Total Income for Month',
          'Sum of all income account net cash flows',
          {
            'Income Sources': Object.entries(monthlyAccountData)
              .filter(([accountId]) => {
                const account = adjustedAccounts.find(acc => acc.id === accountId);
                return account?.kind === 'income';
              })
              .map(([, data]) => `R${(data.income / 100).toFixed(2)}`)
              .join(' + '),
          },
          totalIncome
        ),
        totalExpensesCalculation: this.createCalculationStep(
          'Total Expenses for Month',
          'Sum of all expense account net cash flows',
          {
            'Expense Categories': Object.entries(monthlyAccountData)
              .filter(([accountId]) => {
                const account = adjustedAccounts.find(acc => acc.id === accountId);
                return account?.kind !== 'income';
              })
              .map(([, data]) => `R${(data.expenses / 100).toFixed(2)}`)
              .join(' + '),
          },
          totalExpenses
        ),
        netWorthCalculation: this.createCalculationStep(
          'Total Net Worth Calculation',
          'Sum of assets minus liabilities',
          {
            'Asset Balances': Object.entries(monthlyAccountData)
              .filter(([accountId]) => {
                const account = adjustedAccounts.find(acc => acc.id === accountId);
                return account?.kind !== 'liability';
              })
              .map(([, data]) => `R${(data.closingBalance / 100).toFixed(2)}`)
              .join(' + '),
            'Liability Balances': Object.entries(monthlyAccountData)
              .filter(([accountId]) => {
                const account = adjustedAccounts.find(acc => acc.id === accountId);
                return account?.kind === 'liability';
              })
              .map(([, data]) => `R${(Math.abs(data.closingBalance) / 100).toFixed(2)}`)
              .join(' + '),
          },
          totalNetWorth
        ),
        savingsRateCalculation: this.createCalculationStep(
          'Savings Rate Calculation',
          'Savings Rate = (Income - Expenses) / Income',
          {
            'Total Income': `R${(totalIncome / 100).toFixed(2)}`,
            'Total Expenses': `R${(totalExpenses / 100).toFixed(2)}`,
            'Net Savings': `R${((totalIncome - totalExpenses) / 100).toFixed(2)}`,
          },
          savingsRate
        ),
      };

      const monthProjection: MonthlyProjection = {
        month: projectionDate.toISOString().slice(0, 7), // YYYY-MM format
        accounts: monthlyAccountData,
        totalNetWorth,
        totalIncome,
        totalExpenses,
        savingsRate,
        calculationSummary,
      };

      // Add payoff events if any occurred
      if (payoffEvents.length > 0) {
        monthProjection.accountsPayoffEvents = payoffEvents;
      }

      projectionMonths.push(monthProjection);
    }

    const endNetWorth =
      projectionMonths[projectionMonths.length - 1]?.totalNetWorth ||
      startNetWorth;
    const totalReturn = endNetWorth - startNetWorth;
    const averageSavingsRate =
      projectionMonths.reduce((sum, month) => sum + month.savingsRate, 0) /
      projectionMonths.length;

    // Calculate payoff projections for liability accounts
    const payoffProjections = this.calculatePayoffProjections(
      adjustedAccounts,
      adjustedCashflows,
      projectionMonths
    );

    return {
      months: projectionMonths,
      summary: {
        startNetWorth,
        endNetWorth,
        totalReturn,
        averageSavingsRate,
        projectionDate: new Date().toISOString(),
      },
      payoffProjections,
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

  /**
   * Calculate payoff projections for liability accounts
   */
  private calculatePayoffProjections(
    accounts: Account[],
    _cashflows: Cashflow[],
    projectionMonths: MonthlyProjection[]
  ): PayoffProjection[] {
    const payoffProjections: PayoffProjection[] = [];

    // Find liability accounts with negative balances
    const liabilityAccounts = accounts.filter(
      acc => acc.kind === 'liability' && (acc.openingBalanceCents || 0) < 0
    );

    for (const account of liabilityAccounts) {
      const currentBalance = account.openingBalanceCents || 0;
      
      // Find when this account gets paid off in the projections
      const payoffMonth = projectionMonths.find(month => {
        const accountData = month.accounts[account.id];
        return accountData && accountData.closingBalance >= -1000; // Allow small rounding errors
      });

      if (payoffMonth) {
        // Calculate months to payoff
        const startDate = new Date();
        const payoffDate = new Date(payoffMonth.month + '-01');
        const monthsToPayoff = this.getMonthsDifference(startDate, payoffDate);

        // Calculate total interest and payments
        let totalInterestToPay = 0;
        let totalPayments = 0;

        for (const month of projectionMonths) {
          const accountData = month.accounts[account.id];
          if (accountData) {
            totalInterestToPay += accountData.interestEarned || 0;
            totalPayments += Math.abs(accountData.netCashflow);
            
            // Stop calculating once account is paid off
            if (accountData.closingBalance >= -1000) {
              break;
            }
          }
        }

        payoffProjections.push({
          accountId: account.id,
          accountName: account.name,
          currentBalance,
          projectedPayoffMonth: payoffMonth.month,
          monthsToPayoff,
          totalInterestToPay,
          totalPayments,
        });
      }
    }

    return payoffProjections;
  }
}

// Singleton instance
export const projectionEngine = new ProjectionEngine();
