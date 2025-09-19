import React, { useMemo, useState } from 'react';
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
import { useAppSelector } from '@/store/hooks';
import {
  OnboardingTooltip,
  OnboardingStep,
} from '@/components/common/OnboardingTooltip';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useResponsiveCharts } from '@/hooks/useResponsiveCharts';
import { projectionEngine } from '@/services/projectionEngine';

const DashboardPage: React.FC = () => {
  const { accounts } = useAppSelector(state => state.accounts);
  const { cashflows } = useAppSelector(state => state.cashflows);
  const disclaimerAccepted = useAppSelector(
    state => state.settings.disclaimerAccepted
  );
  const chartStyles = useResponsiveCharts();
  
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

  // Onboarding setup
  const { isOnboardingOpen, completeOnboarding, skipOnboarding } =
    useOnboarding({
      storageKey: 'dashboard-onboarding-completed',
      autoStart: true,
      delay: 1500,
      prerequisitesMet: disclaimerAccepted,
    });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      target: '[data-onboarding="dashboard-title"]',
      title: 'Welcome to Your Financial Dashboard! 🎉',
      description:
        'This is your financial command center. Here you can see a complete overview of your financial health including net worth, savings, and cash flow.',
      placement: 'bottom',
    },
    {
      id: 'wealth-projection',
      target: '[data-onboarding="wealth-projection"]',
      title: 'Wealth Projection Chart',
      description:
        'This chart shows your projected net worth over time based on your current savings rate and growth assumptions. Use the slider to adjust the time horizon.',
      placement: 'bottom',
    },
    {
      id: 'net-worth',
      target: '[data-onboarding="net-worth-card"]',
      title: 'Your Net Worth',
      description:
        "This shows your total assets minus liabilities. It's the most important number for tracking your overall financial progress over time.",
      placement: 'bottom',
    },
    {
      id: 'savings-rate',
      target: '[data-onboarding="savings-rate-card"]',
      title: 'Savings Rate',
      description:
        'Your savings rate is the percentage of income you save each month. Aim for 10-20% for good financial health!',
      placement: 'bottom',
    },
    {
      id: 'account-summary',
      target: '[data-onboarding="account-summary"]',
      title: 'Account Summary',
      description:
        'Track your assets and liabilities here. Add accounts through the "Accounts" page to see your complete financial picture.',
      placement: 'top',
    },
    {
      id: 'cashflow-summary',
      target: '[data-onboarding="cashflow-summary"]',
      title: 'Cash Flow Analysis',
      description:
        "See your monthly income vs expenses. Positive cash flow means you're saving money each month!",
      placement: 'top',
    },
    {
      id: 'navigation',
      target: '[data-onboarding="sidebar-accounts"]',
      title: 'Ready to Get Started?',
      description:
        'Click on "Accounts" in the sidebar to add your bank accounts, investments, and loans. Then add your income and expenses in "Cash Flows".',
      placement: 'right',
      action: {
        label: 'Go to Accounts',
        onClick: () => {
          window.location.hash = '/accounts';
        },
      },
    },
  ];

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
    // Calculate total expenses (excluding tax and investment-related expenses)
    const regularExpenses = cashflows
      .filter(cf => {
        const account = accounts.find(acc => acc.id === cf.accountId);
        return (
          account &&
          account.kind !== 'income' &&
          account.kind !== 'tax' &&
          cf.recurrence.frequency === 'monthly' &&
          cf.description &&
          !cf.description.toLowerCase().includes('tax') &&
          !cf.description.toLowerCase().includes('investment')
        );
      })
      .reduce((sum, cf) => sum + cf.amountCents, 0);

    // Calculate tax-related expenses (including tax withholdings and tax expenses)
    const taxExpenses = cashflows
      .filter(cf => {
        const account = accounts.find(acc => acc.id === cf.accountId);
        return (
          account &&
          cf.recurrence.frequency === 'monthly' &&
          (
            // Tax account type (e.g., salary tax withholdings)
            account.kind === 'tax' ||
            // Non-income accounts with "tax" in description (e.g., municipal rates & taxes)
            (account.kind !== 'income' && 
             cf.description && 
             cf.description.toLowerCase().includes('tax'))
          )
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

    const total = regularExpenses + taxExpenses + investments;
    
    if (total === 0) {
      return [];
    }

    return [
      {
        name: 'Expenses',
        value: regularExpenses,
        percentage: (regularExpenses / total) * 100,
        color: '#f44336', // red
      },
      {
        name: 'Tax',
        value: taxExpenses,
        percentage: (taxExpenses / total) * 100,
        color: '#ff9800', // orange
      },
      {
        name: 'Investments',
        value: investments,
        percentage: (investments / total) * 100,
        color: '#4caf50', // green
      },
    ].filter(item => item.value > 0);
  }, [accounts, cashflows]);

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
          data-onboarding="dashboard-title"
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
        <Card sx={{ mb: 4 }} data-onboarding="wealth-projection">
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
                  Time Horizon: {projectionYears} year
                  {projectionYears !== 1 ? 's' : ''}
                </Typography>
                <Slider
                  value={projectionYears}
                  onChange={(_, value) => handleProjectionYearsChange(value as number)}
                  min={1}
                  max={50}
                  step={1}
                  marks={[
                    { value: 1, label: '1y' },
                    { value: 5, label: '5y' },
                    { value: 10, label: '10y' },
                    { value: 20, label: '20y' },
                    { value: 30, label: '30y' },
                    { value: 40, label: '40y' },
                    { value: 50, label: '50y' },
                  ]}
                  valueLabelDisplay="auto"
                  sx={{ width: 180 }}
                />
              </Box>
            </Box>

            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wealthProjectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
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
                    contentStyle={chartStyles.getTooltipStyle()}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Net Worth',
                    ]}
                    labelFormatter={label => `Year ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#1976d2"
                    strokeWidth={3}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
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
            <div data-onboarding="net-worth-card">
              <StatCard
                title="Net Worth"
                value={formatCurrency(financialMetrics.netWorth)}
                icon={<TrendingUpOutlined sx={{ color: 'inherit' }} />}
                trend={0.047}
                color="primary"
              />
            </div>
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
            <div data-onboarding="savings-rate-card">
              <StatCard
                title="Savings Rate"
                value={`${(financialMetrics.savingsRate * 100).toFixed(1)}%`}
                icon={<PieChartOutlined sx={{ color: 'inherit' }} />}
                trend={0.034}
                color="warning"
              />
            </div>
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
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {financialAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={chartStyles.getTooltipStyle()}
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
            <Card data-onboarding="account-summary">
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
            <Card data-onboarding="cashflow-summary">
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
        </Grid>
      </Box>

      {/* Onboarding System */}
      <OnboardingTooltip
        steps={onboardingSteps}
        isOpen={isOnboardingOpen}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
        storageKey="dashboard-onboarding-completed"
      />
    </Box>
  );
};

export default DashboardPage;
