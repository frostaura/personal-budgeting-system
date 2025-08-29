import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';
import { X } from 'lucide-react';
import '../styles/Modal.css';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (account: Partial<Account>) => void;
  account?: Account | null;
}

const AccountModal: React.FC<AccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  account 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: AccountType.Checking,
    balance: 0,
    creditLimit: 0,
    description: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (account) {
        setFormData({
          name: account.name,
          type: account.type,
          balance: account.balance,
          creditLimit: account.creditLimit || 0,
          description: account.description,
          isActive: account.isActive,
        });
      } else {
        setFormData({
          name: '',
          type: AccountType.Checking,
          balance: 0,
          creditLimit: 0,
          description: '',
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, account]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Account name must be less than 100 characters';
    }

    if (formData.type === AccountType.CreditCard && formData.creditLimit < 0) {
      newErrors.creditLimit = 'Credit limit cannot be negative';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const accountData: Partial<Account> = {
      name: formData.name.trim(),
      type: formData.type,
      balance: formData.balance,
      description: formData.description.trim(),
      isActive: formData.isActive,
    };

    if (formData.type === AccountType.CreditCard) {
      accountData.creditLimit = formData.creditLimit;
    }

    onSubmit(accountData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const accountTypeOptions = [
    { value: AccountType.Checking, label: 'Checking' },
    { value: AccountType.Savings, label: 'Savings' },
    { value: AccountType.CreditCard, label: 'Credit Card' },
    { value: AccountType.Investment, label: 'Investment' },
    { value: AccountType.Loan, label: 'Loan' },
    { value: AccountType.Other, label: 'Other' },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{account ? 'Edit Account' : 'Create Account'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="name">Account Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'input-error' : ''}
                placeholder="e.g., Chase Checking"
                maxLength={100}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Account Type *</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', Number(e.target.value) as AccountType)}
              >
                {accountTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="balance">
                {formData.type === AccountType.CreditCard ? 'Current Balance (negative for debt)' : 'Current Balance'}
              </label>
              <input
                type="number"
                id="balance"
                step="0.01"
                value={formData.balance}
                onChange={(e) => handleChange('balance', Number(e.target.value))}
                placeholder="0.00"
              />
            </div>

            {formData.type === AccountType.CreditCard && (
              <div className="form-group">
                <label htmlFor="creditLimit">Credit Limit</label>
                <input
                  type="number"
                  id="creditLimit"
                  step="0.01"
                  min="0"
                  value={formData.creditLimit}
                  onChange={(e) => handleChange('creditLimit', Number(e.target.value))}
                  className={errors.creditLimit ? 'input-error' : ''}
                  placeholder="0.00"
                />
                {errors.creditLimit && <span className="error-text">{errors.creditLimit}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className={errors.description ? 'input-error' : ''}
                placeholder="Optional description..."
                maxLength={500}
                rows={3}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                <span>Account is active</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {account ? 'Update' : 'Create'} Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountModal;