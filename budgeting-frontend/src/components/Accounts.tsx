import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchAccounts, createAccount, updateAccount, deleteAccount } from '../store/slices/accountsSlice';
import { Account, AccountType } from '../types';
import { Plus, Edit2, Trash2, DollarSign, CreditCard, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import AccountModal from './AccountModal';
import '../styles/Accounts.css';

const Accounts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { accounts, loading, error } = useSelector((state: RootState) => state.accounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleCreateAccount = async (accountData: Partial<Account>) => {
    try {
      await dispatch(createAccount(accountData)).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const handleUpdateAccount = async (accountData: Partial<Account>) => {
    if (editingAccount) {
      try {
        await dispatch(updateAccount({ id: editingAccount.id, account: accountData })).unwrap();
        setEditingAccount(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to update account:', error);
      }
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      try {
        await dispatch(deleteAccount(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.Checking:
        return <Wallet size={20} />;
      case AccountType.Savings:
        return <DollarSign size={20} />;
      case AccountType.CreditCard:
        return <CreditCard size={20} />;
      case AccountType.Investment:
        return <TrendingUp size={20} />;
      default:
        return <Wallet size={20} />;
    }
  };

  const getAccountTypeName = (type: AccountType): string => {
    return AccountType[type] || 'Unknown';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="accounts-page">
        <div className="page-header">
          <h1>Accounts</h1>
        </div>
        <LoadingSpinner message="Loading your accounts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="accounts-page">
        <div className="page-header">
          <h1>Accounts</h1>
        </div>
        <ErrorState 
          message={error} 
          onRetry={() => dispatch(fetchAccounts())} 
        />
      </div>
    );
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="accounts-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Accounts</h1>
          <p>Manage your financial accounts</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          Add Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">
            <DollarSign size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Balance</h3>
            <p className="summary-amount">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <CreditCard size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Accounts</h3>
            <p className="summary-amount">{accounts.length}</p>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No accounts yet</h3>
          <p>Create your first account to start tracking your finances</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Create Account
          </button>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <div className="account-icon">
                  {getAccountIcon(account.type)}
                </div>
                <div className="account-actions">
                  <button
                    className="btn-icon"
                    onClick={() => openEditModal(account)}
                    title="Edit account"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteAccount(account.id)}
                    title="Delete account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="account-content">
                <h3 className="account-name">{account.name}</h3>
                <p className="account-type">{getAccountTypeName(account.type)}</p>
                <div className="account-balance">
                  {formatCurrency(account.balance)}
                </div>
                {account.description && (
                  <p className="account-description">{account.description}</p>
                )}
              </div>
              
              {account.type === AccountType.CreditCard && account.creditLimit > 0 && (
                <div className="account-footer">
                  <div className="credit-info">
                    <span>Credit Limit: {formatCurrency(account.creditLimit)}</span>
                    <span>Available: {formatCurrency(account.creditLimit + account.balance)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Account Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
        account={editingAccount}
      />
    </div>
  );
};

export default Accounts;