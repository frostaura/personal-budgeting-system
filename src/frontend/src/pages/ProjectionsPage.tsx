import React, { useState, useMemo, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  Slider,
  FormHelperText,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useAppSelector } from '@/store/hooks';
import { projectionEngine } from '@/services/projectionEngine';
import { formatCurrency } from '@/utils/currency';
import { Scenario, ProjectionResult } from '@/types/money';

const ProjectionsPage: React.FC = () => {
  const { accounts } = useAppSelector(state => state.accounts);
  const { cashflows } = useAppSelector(state => state.cashflows);

  const [monthsToProject, setMonthsToProject] = useState(60); // 5 years default
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [projectionResults, setProjectionResults] =
    useState<ProjectionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Sample scenarios (in a real app, these would come from Redux store)
  const scenarios: Scenario[] = [
    {
      id: 'conservative',
      name: 'Conservative Spending',
      spendAdjustmentPct: -0.15,
      scope: 'discretionary',
      inflationPct: 0.055,
      salaryGrowthPct: 0.065,
    },
    {
      id: 'aggressive-saving',
      name: 'Aggressive Savings',
      spendAdjustmentPct: -0.25,
      scope: 'all',
      inflationPct: 0.055,
      salaryGrowthPct: 0.065,
    },
    {
      id: 'high-inflation',
      name: 'High Inflation Period',
      spendAdjustmentPct: 0,
      scope: 'all',
      inflationPct: 0.085,
      salaryGrowthPct: 0.055,
    },
    {
      id: 'salary-increase',
      name: 'Promotion & Salary Increase',
      spendAdjustmentPct: 0.1,
      scope: 'discretionary',
      inflationPct: 0.055,
      salaryGrowthPct: 0.12,
    },
  ];

  const selectedScenarioObj = scenarios.find(s => s.id === selectedScenario);

  // Calculate real-time projections
  const handleCalculateProjections = useCallback(async () => {
    if (accounts.length === 0 || cashflows.length === 0) {
      return;
    }

    setIsCalculating(true);

    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));

      const results = projectionEngine.projectFinances(
        accounts,
        cashflows,
        monthsToProject,
        selectedScenarioObj
      );

      setProjectionResults(results);
    } catch (error) {
      console.error('Error calculating projections:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [accounts, cashflows, monthsToProject, selectedScenarioObj]);

  // Auto-calculate when inputs change
  React.useEffect(() => {
    handleCalculateProjections();
  }, [handleCalculateProjections]);

  // Memoized metrics for performance
  const projectionMetrics = useMemo(() => {
    if (!projectionResults) return null;

    const { months, summary } = projectionResults;
    const midpointMonth = months[Math.floor(months.length / 2)];

    // Calculate compound annual growth rate (CAGR)
    const years = monthsToProject / 12;
    const cagr =
      years > 0
        ? Math.pow(summary.endNetWorth / summary.startNetWorth, 1 / years) - 1
        : 0;

    return {
      totalGrowth: summary.totalReturn,
      percentageGrowth: (summary.totalReturn / summary.startNetWorth) * 100,
      cagr: cagr * 100,
      finalNetWorth: summary.endNetWorth,
      averageSavingsRate: summary.averageSavingsRate * 100,
      midpointNetWorth: midpointMonth?.totalNetWorth || 0,
    };
  }, [projectionResults, monthsToProject]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Financial Projections
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Deterministic projections based on current balances, interest rates, and
        compound growth
      </Typography>

      {(accounts.length === 0 || cashflows.length === 0) && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body2">
            Projections require both accounts and cash flows. Please add some
            accounts and cash flows first.
          </Typography>
        </Alert>
      )}

      {/* Projection Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <CalculateIcon sx={{ mr: 1 }} />
            Projection Settings
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" gutterBottom>
                Projection Period: {monthsToProject} months (
                {(monthsToProject / 12).toFixed(1)} years)
              </Typography>
              <Slider
                value={monthsToProject}
                onChange={(_, value) => setMonthsToProject(value as number)}
                min={12}
                max={360} // 30 years max
                step={12}
                marks={[
                  { value: 12, label: '1yr' },
                  { value: 60, label: '5yr' },
                  { value: 120, label: '10yr' },
                  { value: 240, label: '20yr' },
                  { value: 360, label: '30yr' },
                ]}
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Scenario</InputLabel>
                <Select
                  value={selectedScenario}
                  onChange={e => setSelectedScenario(e.target.value)}
                  label="Scenario"
                >
                  <MenuItem value="">
                    <em>Base Case (No Adjustments)</em>
                  </MenuItem>
                  {scenarios.map(scenario => (
                    <MenuItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {selectedScenarioObj
                    ? `${selectedScenarioObj.spendAdjustmentPct >= 0 ? '+' : ''}${(selectedScenarioObj.spendAdjustmentPct * 100).toFixed(1)}% spending adjustment`
                    : 'Standard projection with current parameters'}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleCalculateProjections}
              disabled={
                isCalculating || accounts.length === 0 || cashflows.length === 0
              }
              startIcon={<TimelineIcon />}
              size="large"
            >
              {isCalculating ? 'Calculating...' : 'Recalculate Projections'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Projection Results */}
      {projectionResults && projectionMetrics && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(projectionMetrics.finalNetWorth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projected Net Worth
                  </Typography>
                  <Chip
                    label={`+${projectionMetrics.percentageGrowth.toFixed(1)}%`}
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(projectionMetrics.totalGrowth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Growth
                  </Typography>
                  <Chip
                    label={`${projectionMetrics.cagr.toFixed(1)}% CAGR`}
                    color="info"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {projectionMetrics.averageSavingsRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Savings Rate
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Over projection period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    {formatCurrency(projectionMetrics.midpointNetWorth)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Midpoint Net Worth
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    At {(monthsToProject / 24).toFixed(1)} years
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Monthly Breakdown */}
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <AccountBalanceIcon sx={{ mr: 1 }} />
                Monthly Projection Breakdown
              </Typography>

              <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Net Worth</TableCell>
                      <TableCell align="right">Monthly Income</TableCell>
                      <TableCell align="right">Monthly Expenses</TableCell>
                      <TableCell align="right">Savings Rate</TableCell>
                      <TableCell align="right">Growth</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectionResults.months
                      .filter((_month, index) => index % 3 === 0) // Show every 3rd month for readability
                      .map((month, index) => {
                        const previousMonth =
                          index > 0
                            ? projectionResults.months[index * 3 - 3]
                            : null;
                        const monthlyGrowth = previousMonth
                          ? month.totalNetWorth - previousMonth.totalNetWorth
                          : 0;

                        return (
                          <TableRow key={month.month}>
                            <TableCell>
                              {new Date(month.month + '-01').toLocaleDateString(
                                'en-ZA',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                }
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <strong>
                                {formatCurrency(month.totalNetWorth)}
                              </strong>
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: 'success.main' }}
                            >
                              {formatCurrency(month.totalIncome)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: 'error.main' }}
                            >
                              {formatCurrency(month.totalExpenses)}
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={`${(month.savingsRate * 100).toFixed(1)}%`}
                                color={
                                  month.savingsRate >= 0.2
                                    ? 'success'
                                    : month.savingsRate >= 0.1
                                      ? 'warning'
                                      : 'error'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              {previousMonth && (
                                <Typography
                                  variant="body2"
                                  color={
                                    monthlyGrowth >= 0
                                      ? 'success.main'
                                      : 'error.main'
                                  }
                                >
                                  {monthlyGrowth >= 0 ? '+' : ''}
                                  {formatCurrency(monthlyGrowth)}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: 'block' }}
              >
                * Showing every 3rd month for readability. Projections include
                compound interest, property appreciation, and annual indexation
                where applicable.
              </Typography>
            </CardContent>
          </Card>

          {/* Key Assumptions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projection Assumptions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Interest & Growth:</strong>
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>
                      Account interest rates applied monthly with compounding
                    </li>
                    <li>
                      Property appreciation calculated monthly where applicable
                    </li>
                    <li>Investment returns based on configured annual rates</li>
                  </ul>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Cash Flows:</strong>
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>Recurring transactions maintain their schedules</li>
                    <li>Annual indexation applied where configured</li>
                    <li>Scenario adjustments applied to relevant expenses</li>
                  </ul>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default ProjectionsPage;
