import React, { useMemo, useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  Slider,
} from '@mui/material';
import {
  TrendingUpOutlined,
  AccountBalanceOutlined,
  SavingsOutlined,
  PieChartOutlined,
  PaymentOutlined,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency, sumCents } from '@/utils/currency';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useResponsiveCharts } from '@/hooks/useResponsiveCharts';
import { projectionEngine } from '@/services/projectionEngine';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { fetchCashflows } from '@/store/slices/cashflowsSlice';
import { chartColors, financialAllocationColors, chartStyleEnhancements } from '@/utils/chartColors';
import { generateSliderLabel } from '@/utils/sliderLabels';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts } = useAppSelector(state => state.accounts);
  const { cashflows } = useAppSelector(state => state.cashflows);
  const chartStyles = useResponsiveCharts();
  
  // Fetch data on component mount to ensure fresh data
  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchCashflows());
  }, [dispatch]);
  
  // Load projection years from localStorage or default to 5 years
  const [projectionYears, setProjectionYears] = useState(() => {
    const saved = localStorage.getItem('dashboardProjectionYears');
    return saved ? parseInt(saved, 10) : 5;
  });

  // Save projection years to localStorage when it changes
  const handleProjectionYearsChange = (value: number) => {
    setProjectionYears(value);
    localStorage.setItem('dashboardProjectionYears', value.toString());
  };

  // Calculate real financial metrics
  const financialMetrics = useMemo(() => {
    // Calculate total assets and liabilities
    const assets = accounts
      .filter(
        acc =>
          ['income', 'investment'].includes(acc.kind) && acc.openingBalanceCents
      )
      .reduce((sum, acc) => sum + (acc.openingBalanceCents || 0), 0);

    const liabilities = accounts
      .filter(acc => acc.kind === 'liability' && acc.openingBalanceCents)
      .reduce((sum, acc) => sum + Math.abs(acc.openingBalanceCents || 0), 0);

    // Calculate monthly interest payments on liability accounts
    const monthlyInterestPayments = accounts
      .filter(
        acc =>
          acc.kind === 'liability' &&
          acc.openingBalanceCents &&
          acc.annualInterestRate
      )
      .reduce((sum, acc) => {
        const balance = Math.abs(acc.openingBalanceCents || 0);
        const annualRate = acc.annualInterestRate || 0;
        const monthlyRate = annualRate / 12;
        const monthlyInterest = balance * monthlyRate;
        return sum + monthlyInterest;
      }, 0);

    const netWorth = assets - liabilities;

    // Calculate monthly income and expenses from cash flows
    const monthlyIncomeFlows = cashflows.filter(cf => {
      const account = accounts.find(acc => acc.id === cf.accountId);
      return (
        account?.kind === 'income' && cf.recurrence.frequency === 'monthly'
      );
    });

    const monthlyExpenseFlows = cashflows.filter(cf => {
      const account = accounts.find(acc => acc.id === cf.accountId);
      return (
        account &&
        account.kind !== 'income' &&
        cf.recurrence.frequency === 'monthly'
      );
    });

    const monthlyIncome = sumCents(
      monthlyIncomeFlows.map(cf => cf.amountCents)
    );
    const monthlyExpenses = sumCents(
      monthlyExpenseFlows.map(cf => cf.amountCents)
    );
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? monthlySavings / monthlyIncome : 0;

    return {
      netWorth,
      totalAssets: assets,
      totalLiabilities: liabilities,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRate,
      monthlyInterestPayments,
    };
  }, [accounts, cashflows]);

  // Calculate financial allocation for pie chart
  const financialAllocation = useMemo(() => {
    // Calculate total expenses (excluding investment-related expenses)
    const regularExpenses = cashflows
      .filter(cf => {
        const account = accounts.find(acc => acc.id === cf.accountId);
        return (
          account &&
          account.kind !== 'income' &&
          cf.recurrence.frequency === 'monthly' &&
          cf.description &&
          !cf.description.toLowerCase().includes('investment')
        );
      })
      .reduce((sum, cf) => sum + cf.amountCents, 0);

    // Calculate tax-related expenses (non-income accounts with "tax" in description)
    const taxExpenses = cashflows
      .filter(cf => {
        const account = accounts.find(acc => acc.id === cf.accountId);
        return (
          account &&
          cf.recurrence.frequency === 'monthly' &&
          account.kind !== 'income' && 
          cf.description && 
          cf.description.toLowerCase().includes('tax')
        );
      })
      .reduce((sum, cf) => sum + cf.amountCents, 0);

    // Calculate investments (accounts with positive balance and interest rate)
    const investments = accounts
      .filter(account => 
        account.kind === 'investment' && 
        (account.openingBalanceCents || 0) > 0 && 
        account.annualInterestRate && 
        account.annualInterestRate > 0
      )
      .reduce((sum, account) => sum + (account.openingBalanceCents || 0), 0);

    // Get interest payments from financialMetrics
    const interestPayments = financialMetrics.monthlyInterestPayments;

    const total = regularExpenses + taxExpenses + investments + interestPayments;
    
    if (total === 0) {
      return [];
    }

    return [
      {
        name: 'Expenses',
        value: regularExpenses,
        percentage: (regularExpenses / total) * 100,
        color: financialAllocationColors.expenses,
      },
      {
        name: 'Tax',
        value: taxExpenses,
        percentage: (taxExpenses / total) * 100,
        color: financialAllocationColors.tax,
      },
      {
        name: 'Interest Payments',
        value: interestPayments,
        percentage: (interestPayments / total) * 100,
        color: financialAllocationColors.interestPayments,
      },
      {
        name: 'Investments',
        value: investments,
        percentage: (investments / total) * 100,
        color: financialAllocationColors.investments,
      },
    ].filter(item => item.value > 0);
  }, [accounts, cashflows, financialMetrics.monthlyInterestPayments]);

  // Generate wealth projection data using ProjectionEngine for accurate interest calculations
  const wealthProjectionData = useMemo(() => {
    if (accounts.length === 0) {
      return [];
    }

    try {
      const monthsToProject = projectionYears * 12;
      const projectionResults = projectionEngine.projectFinances(
        accounts,
        cashflows,
        monthsToProject
      );

      // Extract data points for each year
      const data = [];
      for (let year = 0; year <= projectionYears; year++) {
        const monthIndex = year * 12;
        const monthData = projectionResults.months[monthIndex];
        
        if (monthData) {
          data.push({
            year: year,
            netWorth: monthData.totalNetWorth,
            netWorthFormatted: formatCurrency(monthData.totalNetWorth),
          });
        } else if (year === 0) {
          // For year 0, use current net worth
          data.push({
            year: 0,
            netWorth: financialMetrics.netWorth,
            netWorthFormatted: formatCurrency(financialMetrics.netWorth),
          });
        }
      }

      return data;
    } catch (error) {
      console.error('Error calculating wealth projection:', error);
      // Fallback to current net worth if projection fails
      return [{
        year: 0,
        netWorth: financialMetrics.netWorth,
        netWorthFormatted: formatCurrency(financialMetrics.netWorth),
      }];
    }
  }, [
    accounts,
    cashflows,
    projectionYears,
    financialMetrics.netWorth,
  ]);

  // Calculate payoff projections for liability accounts
  const payoffProjectionsData = useMemo(() => {
    if (accounts.length === 0 || cashflows.length === 0) {
      return [];
    }

    try {
      const monthsToProject = projectionYears * 12;
      const projectionResults = projectionEngine.projectFinances(
        accounts,
        cashflows,
        monthsToProject
      );

      return projectionResults.payoffProjections || [];
    } catch (error) {
      console.error('Error calculating payoff projections:', error);
      return [];
    }
  }, [
    accounts,
    cashflows,
    projectionYears,
  ]);

  const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: number;
    color?: 'primary' | 'success' | 'warning' | 'error';
  }> = ({ title, value, icon, trend, color = 'primary' }) => (
    <Card
      sx={{
        height: '100%',
        borderLeft: 4,
        borderLeftColor: `${color}.main`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: `${color}.main`,
              mr: 2,
              color: 'white',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
        {trend !== undefined && (
          <Typography
            variant="caption"
            sx={{
              color: trend >= 0 ? 'success.main' : 'error.main',
              fontWeight: 500,
            }}
          >
            {trend >= 0 ? '+' : ''}
            {(trend * 100).toFixed(1)}% from last month
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, flexGrow: 1, maxWidth: '1400px', mx: 'auto', width: '100%' }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Financial Dashboard
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Overview of your current financial position and recent trends
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Remember:</strong> All values shown are projections and
            estimates only. This is not financial advice. Please consult with
            qualified professionals for important financial decisions.
          </Typography>
        </Alert>

        {/* Wealth Projection Chart */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Wealth Projection
              </Typography>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="body2" gutterBottom>
                  {generateSliderLabel(projectionYears)}
                </Typography>
                <Slider
                  value={projectionYears}
                  onChange={(_, value) => handleProjectionYearsChange(value as number)}
                  min={1}
                  max={50}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ 
                    width: 180,
                    '& .MuiSlider-thumb': {
                      backgroundColor: chartColors.primary.main,
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: chartColors.primary.main,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: chartColors.primary.light,
                      opacity: 0.3,
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wealthProjectionData}>
                  <CartesianGrid 
                    strokeDasharray={chartStyleEnhancements.grid.strokeDasharray}
                    stroke={chartStyleEnhancements.grid.stroke}
                    strokeOpacity={chartStyleEnhancements.grid.strokeOpacity}
                  />
                  <XAxis
                    dataKey="year"
                    tick={chartStyles.getTickStyle()}
                    label={{
                      value: 'Years',
                      position: 'insideBottom',
                      offset: -10,
                      style: chartStyles.getAxisLabelStyle(),
                    }}
                  />
                  <YAxis
                    tick={chartStyles.getTickStyle()}
                    tickFormatter={value =>
                      `R ${(value / 1000000).toFixed(1)}M`
                    }
                    label={{
                      value: 'Net Worth',
                      angle: -90,
                      position: 'insideLeft',
                      style: chartStyles.getAxisLabelStyle(),
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      ...chartStyles.getTooltipStyle(),
                      ...chartStyleEnhancements.tooltip,
                    }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Net Worth',
                    ]}
                    labelFormatter={label => `Year ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke={chartColors.primary.main}
                    strokeWidth={chartStyleEnhancements.lineChart.strokeWidth}
                    dot={{
                      ...chartStyleEnhancements.lineChart.dot,
                      fill: chartColors.primary.main,
                    }}
                    activeDot={{
                      ...chartStyleEnhancements.lineChart.activeDot,
                      fill: chartColors.primary.main,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: 'block' }}
            >
              Projection uses account-specific interest rates and current monthly
              savings rate of {formatCurrency(financialMetrics.monthlySavings)}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Net Worth"
              value={formatCurrency(financialMetrics.netWorth)}
              icon={<TrendingUpOutlined sx={{ color: 'inherit' }} />}
              trend={0.047}
                color="primary"
              />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total Assets"
              value={formatCurrency(financialMetrics.totalAssets)}
              icon={<AccountBalanceOutlined sx={{ color: 'inherit' }} />}
              trend={0.023}
              color="success"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Interest Payments"
              value={formatCurrency(financialMetrics.monthlyInterestPayments)}
              icon={<PaymentOutlined sx={{ color: 'inherit' }} />}
              trend={-0.012}
              color="error"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="Monthly Savings"
              value={formatCurrency(financialMetrics.monthlySavings)}
              icon={<SavingsOutlined sx={{ color: 'inherit' }} />}
              trend={0.089}
              color="warning"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="Savings Rate"
              value={`${(financialMetrics.savingsRate * 100).toFixed(1)}%`}
              icon={<PieChartOutlined sx={{ color: 'inherit' }} />}
              trend={0.034}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Financial Allocation Pie Chart */}
        {financialAllocation.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Allocation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ width: { xs: '100%', sm: 300 }, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={chartStyleEnhancements.pieChart.innerRadius}
                        outerRadius={chartStyleEnhancements.pieChart.outerRadius}
                        paddingAngle={chartStyleEnhancements.pieChart.paddingAngle}
                        dataKey="value"
                        stroke={chartStyleEnhancements.pieChart.stroke}
                        strokeWidth={chartStyleEnhancements.pieChart.strokeWidth}
                      >
                        {financialAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          ...chartStyles.getTooltipStyle(),
                          ...chartStyleEnhancements.tooltip,
                        }}
                        formatter={(value: number) => [
                          formatCurrency(value),
                          'Amount'
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ ml: { xs: 0, sm: 3 }, mt: { xs: 2, sm: 0 }, flexGrow: 1 }}>
                  {financialAllocation.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: item.color,
                          borderRadius: '50%',
                          mr: 2,
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(item.value)} ({item.percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                * Investments include accounts with positive balance and interest rate
              </Typography>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Summary
                </Typography>
                <Box>
                  {accounts.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No accounts found. Add some accounts to see your
                      portfolio.
                    </Typography>
                  ) : (
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Assets
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(financialMetrics.totalAssets)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Liabilities
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {formatCurrency(financialMetrics.totalLiabilities)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
                        Based on {accounts.length} account
                        {accounts.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cash Flow Summary
                </Typography>
                <Box>
                  {cashflows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No cash flows found. Add income and expense flows to see
                      your monthly budget.
                    </Typography>
                  ) : (
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Income
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(financialMetrics.monthlyIncome)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Expenses
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {formatCurrency(financialMetrics.monthlyExpenses)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          backgroundColor: 'action.hover',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Net Cash Flow
                        </Typography>
                        <Typography
                          variant="h6"
                          color={
                            financialMetrics.monthlySavings >= 0
                              ? 'success.main'
                              : 'error.main'
                          }
                        >
                          {formatCurrency(financialMetrics.monthlySavings)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2 }}
                      >
                        Based on {cashflows.length} cash flow
                        {cashflows.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Liability Payoff Projections */}
          {payoffProjectionsData.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Debt Payoff Projections
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Projected payoff dates for your liability accounts based on current payment schedules
                  </Typography>
                  
                  <Box sx={{ overflowX: 'auto' }}>
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      <Box component="thead">
                        <Box component="tr">
                          <Box 
                            component="th" 
                            sx={{ 
                              textAlign: 'left', 
                              p: 2, 
                              borderBottom: 1, 
                              borderColor: 'divider',
                              fontWeight: 600 
                            }}
                          >
                            Account
                          </Box>
                          <Box 
                            component="th" 
                            sx={{ 
                              textAlign: 'right', 
                              p: 2, 
                              borderBottom: 1, 
                              borderColor: 'divider',
                              fontWeight: 600 
                            }}
                          >
                            Current Balance
                          </Box>
                          <Box 
                            component="th" 
                            sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              borderBottom: 1, 
                              borderColor: 'divider',
                              fontWeight: 600 
                            }}
                          >
                            Payoff Date
                          </Box>
                          <Box 
                            component="th" 
                            sx={{ 
                              textAlign: 'center', 
                              p: 2, 
                              borderBottom: 1, 
                              borderColor: 'divider',
                              fontWeight: 600 
                            }}
                          >
                            Months to Payoff
                          </Box>
                          <Box 
                            component="th" 
                            sx={{ 
                              textAlign: 'right', 
                              p: 2, 
                              borderBottom: 1, 
                              borderColor: 'divider',
                              fontWeight: 600 
                            }}
                          >
                            Total Interest
                          </Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {payoffProjectionsData.map((projection) => (
                          <Box component="tr" key={projection.accountId}>
                            <Box 
                              component="td" 
                              sx={{ 
                                p: 2, 
                                borderBottom: 1, 
                                borderColor: 'divider' 
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {projection.accountName}
                              </Typography>
                            </Box>
                            <Box 
                              component="td" 
                              sx={{ 
                                p: 2, 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                textAlign: 'right' 
                              }}
                            >
                              <Typography variant="body2" color="error.main">
                                {formatCurrency(projection.currentBalance)}
                              </Typography>
                            </Box>
                            <Box 
                              component="td" 
                              sx={{ 
                                p: 2, 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                textAlign: 'center' 
                              }}
                            >
                              <Typography variant="body2">
                                {new Date(projection.projectedPayoffMonth + '-01').toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short' 
                                })}
                              </Typography>
                            </Box>
                            <Box 
                              component="td" 
                              sx={{ 
                                p: 2, 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                textAlign: 'center' 
                              }}
                            >
                              <Typography variant="body2">
                                {projection.monthsToPayoff}
                              </Typography>
                            </Box>
                            <Box 
                              component="td" 
                              sx={{ 
                                p: 2, 
                                borderBottom: 1, 
                                borderColor: 'divider',
                                textAlign: 'right' 
                              }}
                            >
                              <Typography variant="body2" color="warning.main">
                                {formatCurrency(projection.totalInterestToPay)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
