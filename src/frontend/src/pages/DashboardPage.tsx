import React, { useMemo } from 'react';
import { Typography, Grid, Card, CardContent, Box, Alert } from '@mui/material';
import {
  TrendingUpOutlined,
  AccountBalanceOutlined,
  SavingsOutlined,
  PieChartOutlined,
} from '@mui/icons-material';
import { formatCurrency, sumCents } from '@/utils/currency';
import { useAppSelector } from '@/store/hooks';
import { OnboardingTooltip, OnboardingStep } from '@/components/common/OnboardingTooltip';
import { useOnboarding } from '@/hooks/useOnboarding';

const DashboardPage: React.FC = () => {
  const { accounts } = useAppSelector(state => state.accounts);
  const { cashflows } = useAppSelector(state => state.cashflows);

  // Onboarding setup
  const {
    isOnboardingOpen,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding({
    storageKey: 'dashboard-onboarding-completed',
    autoStart: true,
    delay: 1500,
  });

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      target: '[data-onboarding="dashboard-title"]',
      title: 'Welcome to Your Financial Dashboard! 🎉',
      description: 'This is your financial command center. Here you can see a complete overview of your financial health including net worth, savings, and cash flow.',
      placement: 'bottom',
    },
    {
      id: 'net-worth',
      target: '[data-onboarding="net-worth-card"]',
      title: 'Your Net Worth',
      description: 'This shows your total assets minus liabilities. It\'s the most important number for tracking your overall financial progress over time.',
      placement: 'bottom',
    },
    {
      id: 'savings-rate',
      target: '[data-onboarding="savings-rate-card"]',
      title: 'Savings Rate',
      description: 'Your savings rate is the percentage of income you save each month. Aim for 10-20% for good financial health!',
      placement: 'bottom',
    },
    {
      id: 'account-summary',
      target: '[data-onboarding="account-summary"]',
      title: 'Account Summary',
      description: 'Track your assets and liabilities here. Add accounts through the "Accounts" page to see your complete financial picture.',
      placement: 'top',
    },
    {
      id: 'cashflow-summary',
      target: '[data-onboarding="cashflow-summary"]',
      title: 'Cash Flow Analysis',
      description: 'See your monthly income vs expenses. Positive cash flow means you\'re saving money each month!',
      placement: 'top',
    },
    {
      id: 'navigation',
      target: '[data-onboarding="sidebar-accounts"]',
      title: 'Ready to Get Started?',
      description: 'Click on "Accounts" in the sidebar to add your bank accounts, investments, and loans. Then add your income and expenses in "Cash Flows".',
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
      .filter(acc => ['income', 'investment'].includes(acc.kind) && acc.openingBalanceCents)
      .reduce((sum, acc) => sum + (acc.openingBalanceCents || 0), 0);

    const liabilities = accounts
      .filter(acc => acc.kind === 'liability' && acc.openingBalanceCents)
      .reduce((sum, acc) => sum + Math.abs(acc.openingBalanceCents || 0), 0);

    const netWorth = assets - liabilities;

    // Calculate monthly income and expenses from cash flows
    const monthlyIncomeFlows = cashflows.filter(cf => {
      const account = accounts.find(acc => acc.id === cf.accountId);
      return account?.kind === 'income' && cf.recurrence.frequency === 'monthly';
    });

    const monthlyExpenseFlows = cashflows.filter(cf => {
      const account = accounts.find(acc => acc.id === cf.accountId);
      return account && account.kind !== 'income' && cf.recurrence.frequency === 'monthly';
    });

    const monthlyIncome = sumCents(monthlyIncomeFlows.map(cf => cf.amountCents));
    const monthlyExpenses = sumCents(monthlyExpenseFlows.map(cf => cf.amountCents));
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
    };
  }, [accounts, cashflows]);

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
              backgroundColor: `${color}.light`,
              mr: 2,
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
      <Box sx={{ p: 3, flexGrow: 1 }}>
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

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <div data-onboarding="net-worth-card">
              <StatCard
                title="Net Worth"
                value={formatCurrency(financialMetrics.netWorth)}
                icon={<TrendingUpOutlined color="primary" />}
                trend={0.047}
                color="primary"
              />
            </div>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Assets"
              value={formatCurrency(financialMetrics.totalAssets)}
              icon={<AccountBalanceOutlined color="success" />}
              trend={0.023}
              color="success"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Monthly Savings"
              value={formatCurrency(financialMetrics.monthlySavings)}
              icon={<SavingsOutlined color="info" />}
              trend={0.089}
              color="warning"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <div data-onboarding="savings-rate-card">
              <StatCard
                title="Savings Rate"
                value={`${(financialMetrics.savingsRate * 100).toFixed(1)}%`}
                icon={<PieChartOutlined color="warning" />}
                trend={0.034}
                color="warning"
              />
            </div>
          </Grid>
        </Grid>

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
                      No accounts found. Add some accounts to see your portfolio.
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
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Based on {accounts.length} account{accounts.length !== 1 ? 's' : ''}
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
                      No cash flows found. Add income and expense flows to see your monthly budget.
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
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Net Cash Flow
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color={financialMetrics.monthlySavings >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(financialMetrics.monthlySavings)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Based on {cashflows.length} cash flow{cashflows.length !== 1 ? 's' : ''}
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
