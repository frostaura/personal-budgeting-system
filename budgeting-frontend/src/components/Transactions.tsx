import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from '../store/slices/transactionsSlice';
import { fetchAccounts } from '../store/slices/accountsSlice';
import { Transaction, TransactionType } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  DollarSign,
  Calendar,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import TransactionModal from './TransactionModal';
import '../styles/Transactions.css';

const Transactions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading, error } = useSelector((state: RootState) => state.transactions);
  const { accounts } = useSelector((state: RootState) => state.accounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleCreateTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      await dispatch(createTransaction(transactionData)).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  const handleUpdateTransaction = async (transactionData: Partial<Transaction>) => {
    if (editingTransaction) {
      try {
        await dispatch(updateTransaction({ id: editingTransaction.id, transaction: transactionData })).unwrap();
        setEditingTransaction(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to update transaction:', error);
      }
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await dispatch(deleteTransaction(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.Income:
        return <TrendingUp size={20} className="text-green-500" />;
      case TransactionType.Expense:
        return <TrendingDown size={20} className="text-red-500" />;
      case TransactionType.Transfer:
        return <ArrowUpDown size={20} className="text-blue-500" />;
      case TransactionType.Investment:
        return <DollarSign size={20} className="text-purple-500" />;
      default:
        return <DollarSign size={20} />;
    }
  };

  const getTransactionTypeName = (type: TransactionType): string => {
    return TransactionType[type] || 'Unknown';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAccountName = (accountId: number): string => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Filter transactions based on search and type
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getAccountName(transaction.accountId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestments = transactions
    .filter(t => t.type === TransactionType.Investment)
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="transactions-page">
        <div className="page-header">
          <h1>Transactions</h1>
        </div>
        <LoadingSpinner message="Loading your transactions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-page">
        <div className="page-header">
          <h1>Transactions</h1>
        </div>
        <ErrorState 
          message={error} 
          onRetry={() => dispatch(fetchTransactions())} 
        />
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Transactions</h1>
          <p>Track your income, expenses, and investments</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-icon">
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Income</h3>
            <p className="summary-amount">{formatCurrency(totalIncome)}</p>
          </div>
        </div>
        <div className="summary-card expense">
          <div className="summary-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Expenses</h3>
            <p className="summary-amount">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
        <div className="summary-card investment">
          <div className="summary-icon">
            <DollarSign size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Investments</h3>
            <p className="summary-amount">{formatCurrency(totalInvestments)}</p>
          </div>
        </div>
        <div className="summary-card total">
          <div className="summary-icon">
            <Calendar size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Transactions</h3>
            <p className="summary-amount">{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="transactions-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-select">
          <Filter size={20} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
          >
            <option value="all">All Types</option>
            <option value={TransactionType.Income}>Income</option>
            <option value={TransactionType.Expense}>Expense</option>
            <option value={TransactionType.Transfer}>Transfer</option>
            <option value={TransactionType.Investment}>Investment</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No transactions found</h3>
          <p>
            {transactions.length === 0 
              ? 'Create your first transaction to start tracking your finances'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Create Transaction
          </button>
        </div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className={`transaction-item ${getTransactionTypeName(transaction.type).toLowerCase()}`}>
              <div className="transaction-icon">
                {getTransactionIcon(transaction.type)}
              </div>
              
              <div className="transaction-details">
                <div className="transaction-main">
                  <h3 className="transaction-description">{transaction.description}</h3>
                  <p className="transaction-account">{getAccountName(transaction.accountId)}</p>
                </div>
                <div className="transaction-meta">
                  <span className="transaction-date">{formatDate(transaction.date)}</span>
                  <span className="transaction-type">{getTransactionTypeName(transaction.type)}</span>
                  {transaction.isRecurring && (
                    <span className="recurring-badge">Recurring</span>
                  )}
                </div>
              </div>

              <div className="transaction-amount">
                <span className={`amount ${transaction.type === TransactionType.Income ? 'positive' : 'negative'}`}>
                  {transaction.type === TransactionType.Income ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>

              <div className="transaction-actions">
                <button
                  className="btn-icon"
                  onClick={() => openEditModal(transaction)}
                  title="Edit transaction"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  title="Delete transaction"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
        transaction={editingTransaction}
        accounts={accounts}
      />
    </div>
  );
};

export default Transactions;