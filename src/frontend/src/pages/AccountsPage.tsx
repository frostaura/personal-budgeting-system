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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAccounts,
  createAccount,
  updateAccountThunk,
  deleteAccountThunk,
  selectAccount,
} from '@/store/slices/accountsSlice';
import { Account, AccountKind } from '@/types/money';
import { formatCurrency, majorToCents, centsToMajor } from '@/utils/currency';

const AccountsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts, loading, error, selectedAccountId } = useAppSelector(
    state => state.accounts
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    kind: 'income' as AccountKind,
    category: '',
    color: '#4CAF50',
    icon: '💳',
    notes: '',
    openingBalance: '',
    annualInterestRate: '',
    compoundsPerYear: 12,
    isProperty: false,
    propertyAppreciationRate: '',
  });

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        name: account.name,
        kind: account.kind,
        category: account.category || '',
        color: account.color || '#4CAF50',
        icon: account.icon || '💳',
        notes: account.notes || '',
        openingBalance: account.openingBalanceCents
          ? centsToMajor(Math.abs(account.openingBalanceCents)).toString()
          : '',
        annualInterestRate: account.annualInterestRate
          ? (account.annualInterestRate * 100).toString()
          : '',
        compoundsPerYear: account.compoundsPerYear || 12,
        isProperty: account.isProperty || false,
        propertyAppreciationRate: account.propertyAppreciationRate
          ? (account.propertyAppreciationRate * 100).toString()
          : '',
      });
    } else {
      setEditingAccount(null);
      setFormData({
        name: '',
        kind: 'income',
        category: '',
        color: '#4CAF50',
        icon: '💳',
        notes: '',
        openingBalance: '',
        annualInterestRate: '',
        compoundsPerYear: 12,
        isProperty: false,
        propertyAppreciationRate: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAccount(null);
  };

  const handleSaveAccount = async () => {
    try {
      const baseAccount: Account = {
        id: editingAccount?.id || `acc-${Date.now()}`,
        name: formData.name,
        kind: formData.kind,
        color: formData.color,
        icon: formData.icon,
        compoundsPerYear: formData.compoundsPerYear,
      };

      // Build additional properties object
      const currentDate = new Date().toISOString().split('T')[0] as string;
      const additionalProps: Record<string, string | number | boolean> = {
        currentBalanceAsOf: currentDate,
      };

      if (formData.category) additionalProps.category = formData.category;
      if (formData.notes) additionalProps.notes = formData.notes;
      if (formData.openingBalance) {
        additionalProps.openingBalanceCents =
          majorToCents(parseFloat(formData.openingBalance)) *
          (formData.kind === 'liability' ? -1 : 1);
      }
      if (formData.annualInterestRate) {
        additionalProps.annualInterestRate =
          parseFloat(formData.annualInterestRate) / 100;
      }
      if (formData.isProperty) {
        additionalProps.isProperty = formData.isProperty;
      }
      if (formData.propertyAppreciationRate) {
        additionalProps.propertyAppreciationRate =
          parseFloat(formData.propertyAppreciationRate) / 100;
      }

      const account = Object.assign(baseAccount, additionalProps) as Account;

      if (editingAccount) {
        await dispatch(updateAccountThunk(account));
      } else {
        await dispatch(createAccount(account));
      }

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (accountToDelete) {
      await dispatch(deleteAccountThunk(accountToDelete));
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const getAccountIcon = (kind: AccountKind) => {
    switch (kind) {
      case 'income':
        return <TrendingUpIcon />;
      case 'investment':
        return <AccountBalanceIcon />;
      case 'liability':
        return <CreditCardIcon />;
      default:
        return <AccountBalanceIcon />;
    }
  };

  const getAccountKindColor = (kind: AccountKind) => {
    switch (kind) {
      case 'income':
        return 'success';
      case 'investment':
        return 'primary';
      case 'liability':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAccountKindDescription = (kind: AccountKind): string => {
    switch (kind) {
      case 'income':
        return 'Checking accounts, savings accounts, and other sources of income';
      case 'investment':
        return 'Investment accounts, retirement funds, and appreciating assets';
      case 'liability':
        return 'Credit cards, loans, mortgages, and other debts';
      default:
        return 'Financial accounts and holdings';
    }
  };

  const groupedAccounts = accounts.reduce(
    (groups, account) => {
      const kind = account.kind;
      if (!groups[kind]) {
        groups[kind] = [];
      }
      groups[kind].push(account);
      return groups;
    },
    {} as Record<AccountKind, Account[]>
  );

  if (loading === 'loading') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>Loading accounts...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <div>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Financial Accounts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your bank accounts, investments, and other financial
              accounts
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            Add Account
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {Object.entries(groupedAccounts).map(([kind, kindAccounts]) => (
            <Grid item xs={12} md={6} lg={4} key={kind}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getAccountIcon(kind as AccountKind)}
                    <Typography
                      variant="h6"
                      sx={{ ml: 1, textTransform: 'capitalize' }}
                    >
                      {kind} Accounts
                    </Typography>
                    <Chip
                      label={kindAccounts.length}
                      color={getAccountKindColor(kind as AccountKind)}
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
                    {getAccountKindDescription(kind as AccountKind)}
                  </Typography>

                  <List dense>
                    {kindAccounts.map(account => (
                      <ListItem
                        key={account.id}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 1,
                          '&:hover': { backgroundColor: 'action.hover' },
                          backgroundColor:
                            selectedAccountId === account.id
                              ? 'action.selected'
                              : 'transparent',
                        }}
                        onClick={() => dispatch(selectAccount(account.id))}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              backgroundColor: account.color,
                              fontSize: '1.2rem',
                            }}
                          >
                            {account.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={account.name}
                          secondary={
                            account.openingBalanceCents
                              ? formatCurrency(account.openingBalanceCents)
                              : 'No balance set'
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Edit Account">
                            <IconButton
                              edge="end"
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenDialog(account);
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Account">
                            <IconButton
                              edge="end"
                              onClick={e => {
                                e.stopPropagation();
                                setAccountToDelete(account.id);
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

                  {kindAccounts.length === 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      py={2}
                    >
                      No {kind} accounts yet
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add/Edit Account Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingAccount ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.kind}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kind: e.target.value as AccountKind,
                    })
                  }
                  label="Account Type"
                >
                  <MenuItem value="income">Income Account</MenuItem>
                  <MenuItem value="investment">Investment Account</MenuItem>
                  <MenuItem value="liability">Liability Account</MenuItem>
                  <MenuItem value="expense">Expense Account</MenuItem>
                  <MenuItem value="tax">Tax Account</MenuItem>
                  <MenuItem value="reserve">Reserve Account</MenuItem>
                  <MenuItem value="transfer">Transfer Account</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Banking, Investments, Credit Cards"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Opening Balance"
                type="number"
                value={formData.openingBalance}
                onChange={e =>
                  setFormData({ ...formData, openingBalance: e.target.value })
                }
                helperText="Enter positive amount (liability sign handled automatically)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Interest Rate (%)"
                type="number"
                value={formData.annualInterestRate}
                onChange={e =>
                  setFormData({
                    ...formData,
                    annualInterestRate: e.target.value,
                  })
                }
                inputProps={{ step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Icon/Emoji"
                value={formData.icon}
                onChange={e =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveAccount}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingAccount ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this account? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountsPage;
