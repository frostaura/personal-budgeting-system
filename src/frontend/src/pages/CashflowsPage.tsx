import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { BottomSheetModal } from '@/components/common';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Repeat as RepeatIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCashflows,
  createCashflow,
  updateCashflowThunk,
  deleteCashflowThunk,
  selectCashflow,
} from '@/store/slices/cashflowsSlice';
import { fetchAccounts } from '@/store/slices/accountsSlice';
import { Cashflow, Frequency, Recurrence } from '@/types/money';
import { formatCurrency, majorToCents, centsToMajor } from '@/utils/currency';

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'once', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
];

const CashflowsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cashflows, loading, error, selectedCashflowId } = useAppSelector(
    state => state.cashflows
  );
  const { accounts } = useAppSelector(state => state.accounts);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCashflow, setEditingCashflow] = useState<Cashflow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cashflowToDelete, setCashflowToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    accountId: '',
    description: '',
    icon: '💰', // default icon
    amount: '',
    frequency: 'monthly' as Frequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dayOfMonth: 1,
    hasEndDate: false,
    annualIndexation: '',
    // Calculation type and related fields
    calculationType: 'fixed' as 'fixed' | 'percentage-income' | 'percentage-account' | 'transfer',
    sourceCashflowId: '',
    sourceAccountId: '',
    percentage: '',
    targetAccountId: '',
  });

  useEffect(() => {
    dispatch(fetchCashflows());
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleOpenDialog = (cashflow?: Cashflow) => {
    if (cashflow) {
      setEditingCashflow(cashflow);
      setFormData({
        accountId: cashflow.accountId,
        description: cashflow.description || '',
        icon: cashflow.icon || '💰',
        amount: centsToMajor(Math.abs(cashflow.amountCents)).toString(),
        frequency: cashflow.recurrence.frequency,
        startDate: cashflow.recurrence.startDate,
        endDate: cashflow.recurrence.endDate || '',
        dayOfMonth: cashflow.recurrence.anchor?.dayOfMonth || 1,
        hasEndDate: !!cashflow.recurrence.endDate,
        annualIndexation: cashflow.recurrence.annualIndexationPct
          ? (cashflow.recurrence.annualIndexationPct * 100).toString()
          : '',
        // Calculation type fields
        calculationType: cashflow.targetAccountId 
          ? 'transfer'
          : cashflow.percentageOf 
            ? (cashflow.percentageOf.sourceType === 'cashflow' ? 'percentage-income' : 'percentage-account')
            : 'fixed',
        sourceCashflowId: cashflow.percentageOf?.sourceType === 'cashflow' ? cashflow.percentageOf.sourceId : '',
        sourceAccountId: cashflow.percentageOf?.sourceType === 'account' ? cashflow.percentageOf.sourceId : '',
        percentage: cashflow.percentageOf?.percentage
          ? (cashflow.percentageOf.percentage * 100).toString()
          : '',
        targetAccountId: cashflow.targetAccountId || '',
      });
    } else {
      setEditingCashflow(null);
      setFormData({
        accountId: '',
        description: '',
        icon: '💰',
        amount: '',
        frequency: 'monthly' as Frequency,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        dayOfMonth: 1,
        hasEndDate: false,
        annualIndexation: '',
        // Reset calculation fields
        calculationType: 'fixed' as 'fixed' | 'percentage-income' | 'percentage-account' | 'transfer',
        sourceCashflowId: '',
        sourceAccountId: '',
        percentage: '',
        targetAccountId: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCashflow(null);
  };

  const handleSaveCashflow = async () => {
    try {
      if (!formData.startDate) {
        console.error('Start date is required');
        return;
      }

      const recurrenceData: Partial<Recurrence> & {
        frequency: Frequency;
        startDate: string;
      } = {
        frequency: formData.frequency,
        startDate: formData.startDate,
      };

      if (formData.frequency !== 'once') {
        recurrenceData.anchor = { dayOfMonth: formData.dayOfMonth };
      }
      if (formData.hasEndDate && formData.endDate) {
        recurrenceData.endDate = formData.endDate;
      }
      if (formData.annualIndexation) {
        recurrenceData.annualIndexationPct =
          parseFloat(formData.annualIndexation) / 100;
      }

      // Determine if this should be an expense (negative amount) based on account type
      const account = accounts.find(acc => acc.id === formData.accountId);
      const isExpenseFlow = account && account.kind !== 'income';
      
      let amountCents = 0;
      if (formData.calculationType === 'fixed') {
        const positiveAmount = majorToCents(parseFloat(formData.amount));
        // For non-income accounts, make the amount negative (expenses)
        amountCents = isExpenseFlow ? -positiveAmount : positiveAmount;
      } else if (formData.calculationType === 'transfer' && formData.amount) {
        const positiveAmount = majorToCents(parseFloat(formData.amount));
        // For transfers, the amount is typically negative from the source account
        amountCents = -positiveAmount;
      }

      const cashflow: Cashflow = {
        id: editingCashflow?.id || `cf-${Date.now()}`,
        accountId: formData.accountId,
        amountCents,
        description: formData.description,
        icon: formData.icon,
        recurrence: recurrenceData as Recurrence,
      };

      // Add percentage-based calculation if enabled
      if (formData.calculationType === 'percentage-income' && formData.sourceCashflowId && formData.percentage) {
        cashflow.percentageOf = {
          sourceType: 'cashflow',
          sourceId: formData.sourceCashflowId,
          percentage: parseFloat(formData.percentage) / 100,
        };
      } else if (formData.calculationType === 'percentage-account' && formData.sourceAccountId && formData.percentage) {
        cashflow.percentageOf = {
          sourceType: 'account',
          sourceId: formData.sourceAccountId,
          percentage: parseFloat(formData.percentage) / 100,
        };
      } else if (formData.calculationType === 'transfer' && formData.percentage) {
        // Transfer with percentage calculation
        if (formData.sourceCashflowId) {
          cashflow.percentageOf = {
            sourceType: 'cashflow',
            sourceId: formData.sourceCashflowId,
            percentage: parseFloat(formData.percentage) / 100,
          };
        } else if (formData.sourceAccountId) {
          cashflow.percentageOf = {
            sourceType: 'account',
            sourceId: formData.sourceAccountId,
            percentage: parseFloat(formData.percentage) / 100,
          };
        }
      }

      // Add transfer target if enabled
      if (formData.calculationType === 'transfer' && formData.targetAccountId) {
        cashflow.targetAccountId = formData.targetAccountId;
      }

      if (editingCashflow) {
        await dispatch(updateCashflowThunk(cashflow));
      } else {
        await dispatch(createCashflow(cashflow));
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving cashflow:', error);
    }
  };

  const handleDeleteCashflow = async () => {
    if (cashflowToDelete) {
      await dispatch(deleteCashflowThunk(cashflowToDelete));
      setDeleteDialogOpen(false);
      setCashflowToDelete(null);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Unknown Account';
  };

  const getAccountType = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.kind || 'unknown';
  };

  const getCashflowDirection = (cashflow: Cashflow) => {
    const accountType = getAccountType(cashflow.accountId);
    // For income accounts, positive amounts are inflows
    // For expense/liability accounts, positive amounts are outflows
    return accountType === 'income' ? 'income' : 'expense';
  };

  const getCashflowIcon = (direction: string) => {
    return direction === 'income' ? <IncomeIcon /> : <ExpenseIcon />;
  };

  const getCashflowColor = (direction: string) => {
    return direction === 'income' ? '#4CAF50' : '#F44336';
  };

  const getFrequencyDisplayText = (frequency: Frequency) => {
    return (
      FREQUENCY_OPTIONS.find(opt => opt.value === frequency)?.label || frequency
    );
  };

  const getCashflowDescription = (direction: string): string => {
    switch (direction) {
      case 'income':
        return 'Regular income sources like salary, dividends, and other earnings';
      case 'expense':
        return 'Regular expenses like rent, utilities, and recurring payments';
      default:
        return 'Financial cash flows and transactions';
    }
  };

  const groupedCashflows = cashflows.reduce(
    (groups, cashflow) => {
      const direction = getCashflowDirection(cashflow);
      if (!groups[direction]) {
        groups[direction] = [];
      }
      groups[direction].push(cashflow);
      return groups;
    },
    {} as Record<string, Cashflow[]>
  );

  if (loading === 'loading') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Loading cash flows...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, flexGrow: 1, maxWidth: '1400px', mx: 'auto', width: '100%' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <div>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Cash Flows
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your recurring income and expenses
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={!isMobile ? <AddIcon /> : undefined}
            onClick={() => handleOpenDialog()}
            size="large"
            aria-label="Add Cash Flow"
            sx={{
              minWidth: isMobile ? 'auto' : undefined,
              px: isMobile ? 2 : undefined,
            }}
          >
            {isMobile ? <AddIcon /> : 'Add Cash Flow'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {Object.entries(groupedCashflows).map(
            ([direction, directionCashflows]) => (
              <Grid item xs={12} key={direction}>
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {getCashflowIcon(direction)}
                      <Typography
                        variant="h6"
                        sx={{ ml: 1, textTransform: 'capitalize' }}
                      >
                        {direction} Flows
                      </Typography>
                      <Chip
                        label={directionCashflows.length}
                        color={direction === 'income' ? 'success' : 'error'}
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>

                    {/* Add subtitle/description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, fontSize: '0.875rem' }}
                    >
                      {getCashflowDescription(direction)}
                    </Typography>

                    <Grid container spacing={2}>
                      {directionCashflows.map(cashflow => (
                        <Grid item xs={12} sm={6} lg={4} key={cashflow.id}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                backgroundColor: 'action.hover',
                                boxShadow: 2
                              },
                              backgroundColor:
                                selectedCashflowId === cashflow.id
                                  ? 'action.selected'
                                  : 'transparent',
                            }}
                            onClick={() => dispatch(selectCashflow(cashflow.id))}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box display="flex" alignItems="center" mb={1}>
                                <Avatar
                                  sx={{
                                    backgroundColor: getCashflowColor(direction),
                                    fontSize: '1.2rem',
                                    width: 32,
                                    height: 32,
                                    mr: 1.5,
                                  }}
                                >
                                  {cashflow.icon ||
                                    (direction === 'income' ? '💰' : '💸')}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ 
                                      fontWeight: 600,
                                      textAlign: 'left',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {cashflow.description || 'Unnamed Cash Flow'}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Edit Cash Flow">
                                    <IconButton
                                      size="small"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleOpenDialog(cashflow);
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Cash Flow">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={e => {
                                        e.stopPropagation();
                                        setCashflowToDelete(cashflow.id);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ 
                                  textAlign: 'left',
                                  mb: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {getAccountName(cashflow.accountId)}
                              </Typography>
                              
                              <Box 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="space-between"
                                sx={{ mt: 1 }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{ 
                                    fontWeight: 600,
                                    color: direction === 'income' ? 'success.main' : 'error.main'
                                  }}
                                >
                                  {formatCurrency(cashflow.amountCents)}
                                </Typography>
                                <Chip
                                  label={getFrequencyDisplayText(
                                    cashflow.recurrence.frequency
                                  )}
                                  size="small"
                                  variant="outlined"
                                  icon={<RepeatIcon />}
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {directionCashflows.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        py={2}
                      >
                        No {direction} cash flows yet
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      </Box>

      {/* Add/Edit Cashflow Modal */}
      <BottomSheetModal
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={editingCashflow ? 'Edit Cash Flow' : 'Add New Cash Flow'}
        actionLabel={editingCashflow ? 'Update' : 'Create'}
        onAction={handleSaveCashflow}
        actionDisabled={
          !formData.accountId ||
          !formData.description.trim() ||
          (formData.calculationType === 'fixed' && !formData.amount) ||
          (formData.calculationType === 'percentage-income' && (!formData.sourceCashflowId || !formData.percentage)) ||
          (formData.calculationType === 'percentage-account' && (!formData.sourceAccountId || !formData.percentage)) ||
          (formData.calculationType === 'transfer' && (
            !formData.targetAccountId || 
            ((!formData.amount && !formData.percentage) || 
             (!!formData.percentage && !formData.sourceAccountId && !formData.sourceCashflowId))
          ))
        }
        maxWidth={800}
      >
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Account</InputLabel>
                <Select
                  value={formData.accountId}
                  onChange={e =>
                    setFormData({ ...formData, accountId: e.target.value })
                  }
                  label="Account"
                >
                  {accounts.map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.icon} {account.name} ({account.kind})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={formData.icon}
                  onChange={e =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  label="Icon"
                >
                  <MenuItem value="💰">💰 Money</MenuItem>
                  <MenuItem value="💸">💸 Expenses</MenuItem>
                  <MenuItem value="🏠">🏠 Home</MenuItem>
                  <MenuItem value="🚗">🚗 Car</MenuItem>
                  <MenuItem value="🍕">🍕 Food</MenuItem>
                  <MenuItem value="⚡">⚡ Utilities</MenuItem>
                  <MenuItem value="🎯">🎯 Savings</MenuItem>
                  <MenuItem value="📱">📱 Technology</MenuItem>
                  <MenuItem value="👕">👕 Clothing</MenuItem>
                  <MenuItem value="🎉">🎉 Entertainment</MenuItem>
                  <MenuItem value="🏥">🏥 Healthcare</MenuItem>
                  <MenuItem value="📚">📚 Education</MenuItem>
                  <MenuItem value="🛒">🛒 Shopping</MenuItem>
                  <MenuItem value="🎪">🎪 Subscriptions</MenuItem>
                  <MenuItem value="🏦">🏦 Banking</MenuItem>
                  <MenuItem value="🧾">🧾 Tax</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Calculation Type Selection */}
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Amount Calculation</FormLabel>
                <RadioGroup
                  value={formData.calculationType}
                  onChange={e =>
                    setFormData({ ...formData, calculationType: e.target.value as 'fixed' | 'percentage-income' | 'percentage-account' | 'transfer' })
                  }
                  row
                >
                  <FormControlLabel 
                    value="fixed" 
                    control={<Radio />} 
                    label="Fixed Amount" 
                  />
                  <FormControlLabel 
                    value="percentage-income" 
                    control={<Radio />} 
                    label="% of Cash Flow" 
                  />
                  <FormControlLabel 
                    value="percentage-account" 
                    control={<Radio />} 
                    label="% of Account Balance" 
                  />
                  <FormControlLabel 
                    value="transfer" 
                    control={<Radio />} 
                    label="Transfer to Account" 
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {/* Fixed Amount Field */}
            {formData.calculationType === 'fixed' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={e =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  helperText={(() => {
                    const account = accounts.find(acc => acc.id === formData.accountId);
                    const isExpenseAccount = account && account.kind !== 'income';
                    return isExpenseAccount 
                      ? "Enter positive amount (will be treated as an expense)"
                      : "Enter positive amount (will be treated as income)";
                  })()}
                />
              </Grid>
            )}
            
            {/* Percentage of Income Fields */}
            {formData.calculationType === 'percentage-income' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Source Cash Flow</InputLabel>
                    <Select
                      value={formData.sourceCashflowId}
                      onChange={e =>
                        setFormData({ ...formData, sourceCashflowId: e.target.value })
                      }
                      label="Source Cash Flow"
                    >
                      {cashflows
                        .map(cf => (
                          <MenuItem key={cf.id} value={cf.id}>
                            {cf.icon} {cf.description} ({formatCurrency(cf.amountCents)})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Percentage (%)"
                    type="number"
                    value={formData.percentage}
                    onChange={e =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText="Percentage of the source cash flow (e.g., 17 for 17%)"
                    required
                  />
                </Grid>
              </>
            )}
            
            {/* Percentage of Account Balance Fields */}
            {formData.calculationType === 'percentage-account' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Source Account</InputLabel>
                    <Select
                      value={formData.sourceAccountId}
                      onChange={e =>
                        setFormData({ ...formData, sourceAccountId: e.target.value })
                      }
                      label="Source Account"
                    >
                      {accounts
                        .filter(acc => acc.kind === 'liability' || acc.kind === 'investment' || acc.kind === 'reserve')
                        .map(account => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.icon} {account.name} ({account.kind})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Percentage (%)"
                    type="number"
                    value={formData.percentage}
                    onChange={e =>
                      setFormData({ ...formData, percentage: e.target.value })
                    }
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                    helperText="Percentage of the account balance (e.g., 1 for 1%)"
                    required
                  />
                </Grid>
              </>
            )}
            
            {/* Transfer Fields */}
            {formData.calculationType === 'transfer' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Transfer Amount"
                    type="number"
                    value={formData.amount}
                    onChange={e =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    helperText="Amount to transfer from source to target account"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Target Account</InputLabel>
                    <Select
                      value={formData.targetAccountId}
                      onChange={e =>
                        setFormData({ ...formData, targetAccountId: e.target.value })
                      }
                      label="Target Account"
                    >
                      {accounts
                        .filter(acc => acc.id !== formData.accountId)
                        .map(account => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.icon} {account.name} ({account.kind})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!formData.sourceAccountId || !!formData.sourceCashflowId}
                        onChange={e => {
                          if (!e.target.checked) {
                            setFormData({ 
                              ...formData, 
                              sourceAccountId: '', 
                              sourceCashflowId: '', 
                              percentage: '' 
                            });
                          }
                        }}
                      />
                    }
                    label="Calculate amount as percentage of account balance or income"
                  />
                </Grid>
                
                {/* Percentage fields for transfers */}
                {(formData.sourceAccountId || formData.sourceCashflowId) && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Percentage Source</InputLabel>
                        <Select
                          value={formData.sourceAccountId ? 'account' : 'income'}
                          onChange={e => {
                            if (e.target.value === 'account') {
                              setFormData({ ...formData, sourceCashflowId: '' });
                            } else {
                              setFormData({ ...formData, sourceAccountId: '' });
                            }
                          }}
                          label="Percentage Source"
                        >
                          <MenuItem value="account">Account Balance</MenuItem>
                          <MenuItem value="income">Cash Flow</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    {formData.sourceAccountId === '' && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Source Cash Flow</InputLabel>
                          <Select
                            value={formData.sourceCashflowId}
                            onChange={e =>
                              setFormData({ ...formData, sourceCashflowId: e.target.value })
                            }
                            label="Source Cash Flow"
                          >
                            {cashflows
                              .map(cf => (
                                <MenuItem key={cf.id} value={cf.id}>
                                  {cf.icon} {cf.description} ({formatCurrency(cf.amountCents)})
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    {formData.sourceCashflowId === '' && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Source Account</InputLabel>
                          <Select
                            value={formData.sourceAccountId}
                            onChange={e =>
                              setFormData({ ...formData, sourceAccountId: e.target.value })
                            }
                            label="Source Account"
                          >
                            {accounts
                              .filter(acc => acc.kind === 'liability' || acc.kind === 'investment' || acc.kind === 'reserve')
                              .map(account => (
                                <MenuItem key={account.id} value={account.id}>
                                  {account.icon} {account.name} ({account.kind})
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Percentage (%)"
                        type="number"
                        value={formData.percentage}
                        onChange={e =>
                          setFormData({ ...formData, percentage: e.target.value })
                        }
                        inputProps={{ min: 0, max: 100, step: 0.1 }}
                        helperText="Percentage to transfer (e.g., 10 for 10%)"
                        required
                      />
                    </Grid>
                  </>
                )}
              </>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as Frequency,
                    })
                  }
                  label="Frequency"
                >
                  {FREQUENCY_OPTIONS.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={e =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            {formData.frequency !== 'once' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Day of Month"
                  type="number"
                  value={formData.dayOfMonth}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dayOfMonth: parseInt(e.target.value) || 1,
                    })
                  }
                  inputProps={{ min: 1, max: 31 }}
                  helperText="Day of month for recurring payments"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.hasEndDate}
                    onChange={e =>
                      setFormData({ ...formData, hasEndDate: e.target.checked })
                    }
                  />
                }
                label="Set End Date"
              />
            </Grid>
            {formData.hasEndDate && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Interest Rate (%)"
                type="number"
                value={formData.annualIndexation}
                onChange={e =>
                  setFormData({ ...formData, annualIndexation: e.target.value })
                }
                inputProps={{ step: 0.1 }}
                helperText="Annual growth/increase rate (e.g., inflation adjustment)"
              />
            </Grid>
          </Grid>
        </BottomSheetModal>

      {/* Delete Confirmation Modal */}
      <BottomSheetModal
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Cash Flow"
        actionLabel="Delete"
        onAction={handleDeleteCashflow}
        actionColor="error"
        maxWidth={500}
      >
        <Typography>
          Are you sure you want to delete this cash flow? This action cannot
          be undone.
        </Typography>
      </BottomSheetModal>
    </Box>
  );
};

export default CashflowsPage;
