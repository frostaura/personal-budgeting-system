import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CompareArrows as CompareIcon,
  Assessment as AssessmentIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  addScenario,
  updateScenario,
  removeScenario,
  setActiveScenario,
} from '@/store/slices/scenariosSlice';
import { projectionEngine } from '@/services/projectionEngine';
import { formatCurrency } from '@/utils/currency';
import { Scenario, ProjectionResult } from '@/types/money';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scenario-tabpanel-${index}`}
      aria-labelledby={`scenario-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ScenariosPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { scenarios, activeScenarioId } = useAppSelector(
    state => state.scenarios
  );
  const { accounts } = useAppSelector(state => state.accounts);
  const { cashflows } = useAppSelector(state => state.cashflows);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [compareScenarios] = useState<string[]>([]);
  const [isRunningComparison, setIsRunningComparison] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<
    Array<{
      scenario: Scenario;
      projection: ProjectionResult;
      metrics: {
        finalNetWorth: number;
        totalGrowth: number;
        cagr: number;
        avgSavingsRate: number;
      };
    }>
  >([]);

  // Form state for scenario creation/editing
  const [formData, setFormData] = useState<Partial<Scenario>>({
    name: '',
    spendAdjustmentPct: 0,
    scope: 'discretionary',
    inflationPct: 0.06,
    salaryGrowthPct: 0.05,
  });

  const canRunComparison =
    accounts.length > 0 && cashflows.length > 0 && scenarios.length >= 2;

  const handleCreateScenario = () => {
    if (!formData.name) return;

    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: formData.name,
      spendAdjustmentPct: formData.spendAdjustmentPct || 0,
      scope: formData.scope || 'discretionary',
      inflationPct: formData.inflationPct || 0.06,
      salaryGrowthPct: formData.salaryGrowthPct || 0.05,
    };

    dispatch(addScenario(newScenario));
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateScenario = () => {
    if (!editingScenario || !formData.name) return;

    const updatedScenario: Scenario = {
      ...editingScenario,
      name: formData.name,
      spendAdjustmentPct: formData.spendAdjustmentPct || 0,
      scope: formData.scope || 'discretionary',
      inflationPct: formData.inflationPct || 0.06,
      salaryGrowthPct: formData.salaryGrowthPct || 0.05,
    };

    dispatch(updateScenario(updatedScenario));
    setEditingScenario(null);
    resetForm();
  };

  const handleDeleteScenario = (scenarioId: string) => {
    if (scenarioId === 'baseline') return; // Can't delete baseline
    dispatch(removeScenario(scenarioId));
  };

  const handleEditScenario = (scenario: Scenario) => {
    setFormData(scenario);
    setEditingScenario(scenario);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      spendAdjustmentPct: 0,
      scope: 'discretionary',
      inflationPct: 0.06,
      salaryGrowthPct: 0.05,
    });
  };

  const handleRunComparison = async () => {
    if (!canRunComparison) return;

    setIsRunningComparison(true);

    try {
      const results = [];
      const scenariosToCompare =
        compareScenarios.length > 0
          ? scenarios.filter(s => compareScenarios.includes(s.id))
          : scenarios.slice(0, 3); // Compare first 3 scenarios if none selected

      for (const scenario of scenariosToCompare) {
        const projection = projectionEngine.projectFinances(
          accounts,
          cashflows,
          60, // 5 years
          scenario
        );

        results.push({
          scenario,
          projection,
          metrics: {
            finalNetWorth: projection.summary.endNetWorth,
            totalGrowth: projection.summary.totalReturn,
            cagr:
              Math.pow(
                projection.summary.endNetWorth /
                  projection.summary.startNetWorth,
                1 / 5
              ) - 1,
            avgSavingsRate: projection.summary.averageSavingsRate,
          },
        });
      }

      setComparisonResults(results);
      setSelectedTab(1); // Switch to comparison tab
    } catch (error) {
      console.error('Error running scenario comparison:', error);
    } finally {
      setIsRunningComparison(false);
    }
  };

  const scenarioFormDialog = (
    <Dialog
      open={isCreateDialogOpen || editingScenario !== null}
      onClose={() => {
        setIsCreateDialogOpen(false);
        setEditingScenario(null);
        resetForm();
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Scenario Name"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Conservative Spending, Aggressive Investment"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Spending Adjustment:{' '}
              {((formData.spendAdjustmentPct || 0) * 100).toFixed(1)}%
            </Typography>
            <Slider
              value={formData.spendAdjustmentPct || 0}
              onChange={(_, value) =>
                setFormData({
                  ...formData,
                  spendAdjustmentPct: value as number,
                })
              }
              min={-0.5}
              max={0.5}
              step={0.05}
              marks={[
                { value: -0.5, label: '-50%' },
                { value: 0, label: '0%' },
                { value: 0.5, label: '+50%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Adjustment Scope</InputLabel>
              <Select
                value={formData.scope || 'discretionary'}
                onChange={e =>
                  setFormData({
                    ...formData,
                    scope: e.target.value as 'all' | 'discretionary',
                  })
                }
                label="Adjustment Scope"
              >
                <MenuItem value="discretionary">
                  Discretionary Spending Only
                </MenuItem>
                <MenuItem value="all">All Expenses</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Annual Inflation:{' '}
              {((formData.inflationPct || 0) * 100).toFixed(1)}%
            </Typography>
            <Slider
              value={formData.inflationPct || 0}
              onChange={(_, value) =>
                setFormData({ ...formData, inflationPct: value as number })
              }
              min={0}
              max={0.15}
              step={0.005}
              marks={[
                { value: 0.03, label: '3%' },
                { value: 0.06, label: '6%' },
                { value: 0.1, label: '10%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              Annual Salary Growth:{' '}
              {((formData.salaryGrowthPct || 0) * 100).toFixed(1)}%
            </Typography>
            <Slider
              value={formData.salaryGrowthPct || 0}
              onChange={(_, value) =>
                setFormData({ ...formData, salaryGrowthPct: value as number })
              }
              min={0}
              max={0.2}
              step={0.005}
              marks={[
                { value: 0.03, label: '3%' },
                { value: 0.07, label: '7%' },
                { value: 0.15, label: '15%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${(value * 100).toFixed(1)}%`}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setIsCreateDialogOpen(false);
            setEditingScenario(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={
            editingScenario ? handleUpdateScenario : handleCreateScenario
          }
          disabled={!formData.name}
        >
          {editingScenario ? 'Update' : 'Create'} Scenario
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Financial Scenarios
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Create and compare different what-if scenarios for your financial future
      </Typography>

      {!canRunComparison && (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            Scenario comparison requires both accounts and cash flows. Please
            add some financial data first.
          </Typography>
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
        >
          <Tab label="Scenario Management" icon={<EditIcon />} />
          <Tab label="Scenario Comparison" icon={<CompareIcon />} />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        {/* Scenario Management Tab */}
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            Your Scenarios ({scenarios.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Scenario
          </Button>
        </Box>

        <Grid container spacing={3}>
          {scenarios.map(scenario => (
            <Grid item xs={12} md={6} lg={4} key={scenario.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {scenario.name}
                    </Typography>
                    <Box>
                      {scenario.id === activeScenarioId && (
                        <Chip
                          label="Active"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      )}
                      {scenario.id === 'baseline' && (
                        <Chip label="Baseline" color="success" size="small" />
                      )}
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Spending Adjustment
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {scenario.spendAdjustmentPct >= 0 ? '+' : ''}
                        {(scenario.spendAdjustmentPct * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Scope
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {scenario.scope === 'all'
                          ? 'All Expenses'
                          : 'Discretionary'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Inflation
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {((scenario.inflationPct || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Salary Growth
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {((scenario.salaryGrowthPct || 0) * 100).toFixed(1)}%
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Button
                      size="small"
                      onClick={() => dispatch(setActiveScenario(scenario.id))}
                      disabled={scenario.id === activeScenarioId}
                    >
                      {scenario.id === activeScenarioId
                        ? 'Active'
                        : 'Set Active'}
                    </Button>
                    <Box>
                      <Tooltip title="Edit Scenario">
                        <IconButton
                          size="small"
                          onClick={() => handleEditScenario(scenario)}
                          disabled={scenario.id === 'baseline'}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Scenario">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteScenario(scenario.id)}
                          disabled={scenario.id === 'baseline'}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        {/* Scenario Comparison Tab */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Scenario Comparison
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              onClick={handleRunComparison}
              disabled={!canRunComparison || isRunningComparison}
            >
              {isRunningComparison ? 'Running...' : 'Run Comparison'}
            </Button>
            {isRunningComparison && (
              <LinearProgress sx={{ flex: 1, maxWidth: 200 }} />
            )}
          </Box>
        </Box>

        {comparisonResults.length > 0 && (
          <>
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {comparisonResults.map(result => (
                <Grid item xs={12} md={6} lg={4} key={result.scenario.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {result.scenario.name}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Final Net Worth
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {formatCurrency(result.metrics.finalNetWorth)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Growth
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              result.metrics.totalGrowth >= 0
                                ? 'success.main'
                                : 'error.main'
                            }
                          >
                            {formatCurrency(result.metrics.totalGrowth)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            CAGR
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {(result.metrics.cagr * 100).toFixed(1)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Avg Savings Rate
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {(result.metrics.avgSavingsRate * 100).toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Detailed Comparison Table */}
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <AssessmentIcon sx={{ mr: 1 }} />
                  Detailed Comparison
                </Typography>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Scenario</TableCell>
                        <TableCell align="right">Starting Net Worth</TableCell>
                        <TableCell align="right">
                          Final Net Worth (5yr)
                        </TableCell>
                        <TableCell align="right">Total Growth</TableCell>
                        <TableCell align="right">CAGR</TableCell>
                        <TableCell align="right">Avg Savings Rate</TableCell>
                        <TableCell align="center">Ranking</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonResults
                        .sort(
                          (a, b) =>
                            b.metrics.finalNetWorth - a.metrics.finalNetWorth
                        )
                        .map((result, index) => (
                          <TableRow key={result.scenario.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" fontWeight={500}>
                                  {result.scenario.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {result.scenario.spendAdjustmentPct >= 0
                                    ? '+'
                                    : ''}
                                  {(
                                    result.scenario.spendAdjustmentPct * 100
                                  ).toFixed(1)}
                                  % spending
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              {formatCurrency(
                                result.projection.summary.startNetWorth
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <strong>
                                {formatCurrency(result.metrics.finalNetWorth)}
                              </strong>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                color={
                                  result.metrics.totalGrowth >= 0
                                    ? 'success.main'
                                    : 'error.main'
                                }
                                fontWeight={500}
                              >
                                {formatCurrency(result.metrics.totalGrowth)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {(result.metrics.cagr * 100).toFixed(2)}%
                            </TableCell>
                            <TableCell align="right">
                              {(result.metrics.avgSavingsRate * 100).toFixed(1)}
                              %
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`#${index + 1}`}
                                color={
                                  index === 0
                                    ? 'success'
                                    : index === 1
                                      ? 'info'
                                      : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </>
        )}

        {comparisonResults.length === 0 && !isRunningComparison && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <AssessmentIcon
                sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                No Comparison Data
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Run a comparison to see how different scenarios affect your
                financial future
              </Typography>
              <Button
                variant="contained"
                startIcon={<PlayIcon />}
                onClick={handleRunComparison}
                disabled={!canRunComparison}
              >
                Run Your First Comparison
              </Button>
            </CardContent>
          </Card>
        )}
      </TabPanel>

      {scenarioFormDialog}
    </Box>
  );
};

export default ScenariosPage;
