import React, { useState, useEffect } from 'react';
import { Budget, BudgetPeriod, Category } from '../types';
import { X } from 'lucide-react';
import '../styles/Modal.css';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (budget: Partial<Budget>) => void;
  budget?: Budget | null;
  categories: Category[];
}

const BudgetModal: React.FC<BudgetModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  budget,
  categories 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    period: BudgetPeriod.Monthly,
    startDate: '',
    endDate: '',
    description: '',
    categoryId: undefined as number | undefined,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      if (budget) {
        setFormData({
          name: budget.name,
          amount: budget.amount,
          period: budget.period,
          startDate: budget.startDate.split('T')[0],
          endDate: budget.endDate.split('T')[0],
          description: budget.description,
          categoryId: budget.categoryId,
          isActive: budget.isActive,
        });
      } else {
        setFormData({
          name: '',
          amount: 0,
          period: BudgetPeriod.Monthly,
          startDate: startOfMonth.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0],
          description: '',
          categoryId: undefined,
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, budget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'categoryId' && value === '') {
      processedValue = undefined;
    } else if (name === 'categoryId') {
      processedValue = parseInt(value);
    } else if (name === 'period') {
      processedValue = parseInt(value);
      // Auto-adjust dates based on period
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();
      
      switch(parseInt(value)) {
        case BudgetPeriod.Weekly:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
          endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
          break;
        case BudgetPeriod.Monthly:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case BudgetPeriod.Yearly:
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          // Custom - keep current dates
          return setFormData(prev => ({ ...prev, [name]: processedValue }));
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    onSubmit(formData);
  };

  if (!isOpen) return null;

  const budgetPeriods = [
    { value: BudgetPeriod.Weekly, label: 'Weekly' },
    { value: BudgetPeriod.Monthly, label: 'Monthly' },
    { value: BudgetPeriod.Yearly, label: 'Yearly' },
    { value: BudgetPeriod.Custom, label: 'Custom' },
  ];

  const expenseCategories = categories.filter(cat => cat.isActive);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{budget ? 'Edit Budget' : 'Add Budget'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Budget Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter budget name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Budget Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={errors.amount ? 'error' : ''}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
            {errors.amount && <span className="error-text">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="period">Period *</label>
            <select
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
            >
              {budgetPeriods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date *</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'error' : ''}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date *</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={errors.endDate ? 'error' : ''}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={handleChange}
            >
              <option value="">All Categories</option>
              {expenseCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {budget ? 'Update' : 'Create'} Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;