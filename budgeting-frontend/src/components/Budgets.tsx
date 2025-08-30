import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchBudgets, createBudget, updateBudget, deleteBudget } from '../store/slices/budgetsSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { Budget, BudgetPeriod } from '../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Target, 
  TrendingDown,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import BudgetModal from './BudgetModal';
import { mockBudgets, mockCategories } from '../data/mockData';
import '../styles/Budgets.css';

const Budgets: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { budgets, loading, error } = useSelector((state: RootState) => state.budgets);
  const { categories } = useSelector((state: RootState) => state.categories);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<BudgetPeriod | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'over_budget'>('all');

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCreateBudget = async (budgetData: Partial<Budget>) => {
    try {
      await dispatch(createBudget(budgetData)).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const handleUpdateBudget = async (budgetData: Partial<Budget>) => {
    if (editingBudget) {
      try {
        await dispatch(updateBudget({ id: editingBudget.id, budget: budgetData })).unwrap();
        setEditingBudget(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to update budget:', error);
      }
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await dispatch(deleteBudget(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete budget:', error);
      }
    }
  };

  const openCreateModal = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const getBudgetPeriodLabel = (period: BudgetPeriod) => {
    switch (period) {
      case BudgetPeriod.Weekly: return 'Weekly';
      case BudgetPeriod.Monthly: return 'Monthly';
      case BudgetPeriod.Yearly: return 'Yearly';
      case BudgetPeriod.Custom: return 'Custom';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverBudget = (budget: Budget) => {
    return budget.spent > budget.amount;
  };

  const getBudgetStatusColor = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return '#ef4444'; // red
    if (percentage >= 80) return '#f59e0b'; // amber
    if (percentage >= 60) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  // Filter budgets based on search and filters
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = filterPeriod === 'all' || budget.period === filterPeriod;
    
    let matchesStatus = true;
    switch (filterStatus) {
      case 'active':
        matchesStatus = budget.isActive;
        break;
      case 'inactive':
        matchesStatus = !budget.isActive;
        break;
      case 'over_budget':
        matchesStatus = isOverBudget(budget);
        break;
      default:
        matchesStatus = true;
    }
    
    return matchesSearch && matchesPeriod && matchesStatus;
  });

  // Use mock data for development when API is not available
  const useMockData = error && error.includes('Network Error');
  const displayBudgets = useMockData ? mockBudgets : filteredBudgets;
  const displayCategories = useMockData ? mockCategories : categories;

  // Calculate summary statistics
  const statsSource = useMockData ? mockBudgets : budgets;
  const totalBudgetAmount = statsSource.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = statsSource.reduce((sum, budget) => sum + budget.spent, 0);
  const activeBudgets = statsSource.filter(budget => budget.isActive).length;
  const overBudgetCount = statsSource.filter(isOverBudget).length;

  if (loading && !useMockData) {
    return (
      <div className="budgets-page">
        <div className="page-header">
          <h1>Budgets</h1>
        </div>
        <LoadingSpinner message="Loading your budgets..." />
      </div>
    );
  }

  if (error && !useMockData) {
    return (
      <div className="budgets-page">
        <div className="page-header">
          <h1>Budgets</h1>
        </div>
        <ErrorState 
          message={error} 
          onRetry={() => dispatch(fetchBudgets())} 
        />
      </div>
    );
  }

  return (
    <div className="budgets-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Budgets</h1>
          <p>Track and manage your spending limits</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={20} />
          Add Budget
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon">
            <DollarSign size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Budget</h3>
            <p className="summary-amount">{formatCurrency(totalBudgetAmount)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Spent</h3>
            <p className="summary-amount">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <Target size={24} />
          </div>
          <div className="summary-content">
            <h3>Active Budgets</h3>
            <p className="summary-amount">{activeBudgets}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <AlertCircle size={24} />
          </div>
          <div className="summary-content">
            <h3>Over Budget</h3>
            <p className="summary-amount">{overBudgetCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search budgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as BudgetPeriod | 'all')}
          >
            <option value="all">All Periods</option>
            <option value={BudgetPeriod.Weekly}>Weekly</option>
            <option value={BudgetPeriod.Monthly}>Monthly</option>
            <option value={BudgetPeriod.Yearly}>Yearly</option>
            <option value={BudgetPeriod.Custom}>Custom</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'over_budget')}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="over_budget">Over Budget</option>
          </select>
        </div>
      </div>

      {/* Budgets Content */}
      {(useMockData ? mockBudgets : budgets).length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <h3>No budgets yet</h3>
          <p>Create your first budget to start tracking your spending</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={20} />
            Create Budget
          </button>
        </div>
      ) : displayBudgets.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h3>No matching budgets</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="budgets-grid">
          {displayBudgets.map((budget) => {
            const spentPercentage = Math.min((budget.spent / budget.amount) * 100, 100);
            const remainingAmount = budget.amount - budget.spent;
            const categoryName = budget.category?.name || 'All Categories';
            
            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-header">
                  <div className="budget-info">
                    <h4 className="budget-name">{budget.name}</h4>
                    <span className="budget-period">
                      {getBudgetPeriodLabel(budget.period)}
                    </span>
                  </div>
                  
                  <div className="budget-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => openEditModal(budget)}
                      title="Edit budget"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteBudget(budget.id)}
                      title="Delete budget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="budget-amounts">
                  <div className="amount-row">
                    <span>Budgeted:</span>
                    <span className="amount">{formatCurrency(budget.amount)}</span>
                  </div>
                  <div className="amount-row">
                    <span>Spent:</span>
                    <span className="amount spent">{formatCurrency(budget.spent)}</span>
                  </div>
                  <div className="amount-row">
                    <span>Remaining:</span>
                    <span className={`amount ${remainingAmount < 0 ? 'negative' : 'positive'}`}>
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                </div>

                <div className="budget-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${spentPercentage}%`,
                        backgroundColor: getBudgetStatusColor(budget)
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {spentPercentage.toFixed(1)}% used
                  </span>
                </div>

                <div className="budget-details">
                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
                  </div>
                  <div className="detail-item">
                    <Target size={16} />
                    <span>{categoryName}</span>
                  </div>
                </div>

                {budget.description && (
                  <p className="budget-description">{budget.description}</p>
                )}

                <div className="budget-footer">
                  <div className="budget-status">
                    <span className={`status-badge ${budget.isActive ? 'active' : 'inactive'}`}>
                      {budget.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {isOverBudget(budget) && (
                      <span className="status-badge over-budget">
                        Over Budget
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
        budget={editingBudget}
        categories={displayCategories}
      />
    </div>
  );
};

export default Budgets;