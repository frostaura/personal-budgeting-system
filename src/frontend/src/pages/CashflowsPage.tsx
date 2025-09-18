import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
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
  Grid,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
} from '@mui/material';
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCashflow, setEditingCashflow] = useState<Cashflow | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cashflowToDelete, setCashflowToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    accountId: '',
    description: '',
    amount: '',
    frequency: 'monthly' as Frequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    dayOfMonth: 1,
    hasEndDate: false,
    annualIndexation: '',
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
        amount: centsToMajor(cashflow.amountCents).toString(),
        frequency: cashflow.recurrence.frequency,
        startDate: cashflow.recurrence.startDate,
        endDate: cashflow.recurrence.endDate || '',
        dayOfMonth: cashflow.recurrence.anchor?.dayOfMonth || 1,
        hasEndDate: !!cashflow.recurrence.endDate,
        annualIndexation: cashflow.recurrence.annualIndexationPct
          ? (cashflow.recurrence.annualIndexationPct * 100).toString()
          : '',
      });
    } else {
      setEditingCashflow(null);
      setFormData({
        accountId: '',
        description: '',
        amount: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        dayOfMonth: 1,
        hasEndDate: false,
        annualIndexation: '',
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

      const recurrenceData: Partial<Recurrence> & { frequency: Frequency; startDate: string } = {
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
        recurrenceData.annualIndexationPct = parseFloat(formData.annualIndexation) / 100;
      }

      const cashflow: Cashflow = {
        id: editingCashflow?.id || `cf-${Date.now()}`,
        accountId: formData.accountId,
        amountCents: majorToCents(parseFloat(formData.amount)),
        description: formData.description,
        recurrence: recurrenceData as Recurrence,
      };

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
    return FREQUENCY_OPTIONS.find(opt => opt.value === frequency)?.label || frequency;
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

  const groupedCashflows = cashflows.reduce((groups, cashflow) => {
    const direction = getCashflowDirection(cashflow);
    if (!groups[direction]) {
      groups[direction] = [];
    }
    groups[direction].push(cashflow);
    return groups;
  }, {} as Record<string, Cashflow[]>);

  if (loading === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading cash flows...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add Cash Flow
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {Object.entries(groupedCashflows).map(([direction, directionCashflows]) => (
            <Grid item xs={12} md={6} key={direction}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getCashflowIcon(direction)}
                    <Typography variant="h6" sx={{ ml: 1, textTransform: 'capitalize' }}>
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

                  <List dense>
                  {directionCashflows.map(cashflow => (
                    <ListItem
                      key={cashflow.id}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': { backgroundColor: 'action.hover' },
                        backgroundColor:
                          selectedCashflowId === cashflow.id ? 'action.selected' : 'transparent',
                      }}
                      onClick={() => dispatch(selectCashflow(cashflow.id))}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: getCashflowColor(direction),
                            fontSize: '1.2rem',
                          }}
                        >
                          {direction === 'income' ? '💰' : '💸'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={cashflow.description || 'Unnamed Cash Flow'}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {getAccountName(cashflow.accountId)}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {formatCurrency(cashflow.amountCents)}
                              </Typography>
                              <Chip
                                label={getFrequencyDisplayText(cashflow.recurrence.frequency)}
                                size="small"
                                variant="outlined"
                                icon={<RepeatIcon />}
                              />
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Edit Cash Flow">
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(cashflow);
                            }}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Cash Flow">
                          <IconButton
                            edge="end"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCashflowToDelete(cashflow.id);
                              setDeleteDialogOpen(true);
                            }}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                {directionCashflows.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                    No {direction} cash flows yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Box>

      {/* Add/Edit Cashflow Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCashflow ? 'Edit Cash Flow' : 'Add New Cash Flow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Account</InputLabel>
                <Select
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                helperText="Enter positive amount (direction determined by account type)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value as Frequency })
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
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })
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
                    onChange={(e) => setFormData({ ...formData, hasEndDate: e.target.checked })}
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
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Indexation (%)"
                type="number"
                value={formData.annualIndexation}
                onChange={(e) => setFormData({ ...formData, annualIndexation: e.target.value })}
                inputProps={{ step: 0.1 }}
                helperText="Annual increase rate (e.g., inflation adjustment)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveCashflow}
            variant="contained"
            disabled={!formData.accountId || !formData.description.trim() || !formData.amount}
          >
            {editingCashflow ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Cash Flow</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this cash flow? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCashflow} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CashflowsPage;
