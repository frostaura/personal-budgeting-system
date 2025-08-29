import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Account } from '../types';
import { X } from 'lucide-react';
import '../styles/Modal.css';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Partial<Transaction>) => void;
  transaction?: Transaction | null;
  accounts: Account[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  transaction,
  accounts 
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    type: TransactionType.Expense,
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    accountId: 0,
    categoryId: undefined as number | undefined,
    toAccountId: undefined as number | undefined,
    notes: '',
    isRecurring: false,
    recurrencePattern: '',
    nextRecurrenceDate: undefined as string | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setFormData({
          description: transaction.description,
          amount: Math.abs(transaction.amount), // Always show positive amount
          type: transaction.type,
          date: transaction.date.split('T')[0], // Extract date part
          accountId: transaction.accountId,
          categoryId: transaction.categoryId,
          toAccountId: transaction.toAccountId,
          notes: transaction.notes || '',
          isRecurring: transaction.isRecurring,
          recurrencePattern: transaction.recurrencePattern || '',
          nextRecurrenceDate: transaction.nextRecurrenceDate?.split('T')[0],
        });
      } else {
        setFormData({
          description: '',
          amount: 0,
          type: TransactionType.Expense,
          date: new Date().toISOString().split('T')[0],
          accountId: accounts.length > 0 ? accounts[0].id : 0,
          categoryId: undefined,
          toAccountId: undefined,
          notes: '',
          isRecurring: false,
          recurrencePattern: '',
          nextRecurrenceDate: undefined,
        });
      }
      setErrors({});
    }
  }, [isOpen, transaction, accounts]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Account is required';
    }

    if (formData.type === TransactionType.Transfer && !formData.toAccountId) {
      newErrors.toAccountId = 'Destination account is required for transfers';
    }

    if (formData.type === TransactionType.Transfer && formData.accountId === formData.toAccountId) {
      newErrors.toAccountId = 'Destination account must be different from source account';
    }

    if (formData.isRecurring && !formData.recurrencePattern.trim()) {
      newErrors.recurrencePattern = 'Recurrence pattern is required for recurring transactions';
    }

    if (formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const transactionData: Partial<Transaction> = {
      description: formData.description.trim(),
      amount: formData.amount,
      type: formData.type,
      date: new Date(formData.date).toISOString(),
      accountId: formData.accountId,
      notes: formData.notes.trim(),
      isRecurring: formData.isRecurring,
    };

    if (formData.categoryId) {
      transactionData.categoryId = formData.categoryId;
    }

    if (formData.type === TransactionType.Transfer && formData.toAccountId) {
      transactionData.toAccountId = formData.toAccountId;
    }

    if (formData.isRecurring) {
      transactionData.recurrencePattern = formData.recurrencePattern.trim();
      if (formData.nextRecurrenceDate) {
        transactionData.nextRecurrenceDate = new Date(formData.nextRecurrenceDate).toISOString();
      }
    }

    onSubmit(transactionData);
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

    // Reset transfer-specific fields when type changes
    if (field === 'type' && value !== TransactionType.Transfer) {
      setFormData(prev => ({
        ...prev,
        toAccountId: undefined
      }));
    }
  };

  const transactionTypeOptions = [
    { value: TransactionType.Income, label: 'Income' },
    { value: TransactionType.Expense, label: 'Expense' },
    { value: TransactionType.Transfer, label: 'Transfer' },
    { value: TransactionType.Investment, label: 'Investment' },
  ];

  const recurrencePatternOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>{transaction ? 'Edit Transaction' : 'Create Transaction'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <input
                  type="text"
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={errors.description ? 'input-error' : ''}
                  placeholder="e.g., Grocery shopping, Salary payment"
                  maxLength={200}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="amount">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', Number(e.target.value))}
                  className={errors.amount ? 'input-error' : ''}
                  placeholder="0.00"
                />
                {errors.amount && <span className="error-text">{errors.amount}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Transaction Type *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', Number(e.target.value) as TransactionType)}
                >
                  {transactionTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountId">Account *</label>
                <select
                  id="accountId"
                  value={formData.accountId}
                  onChange={(e) => handleChange('accountId', Number(e.target.value))}
                  className={errors.accountId ? 'input-error' : ''}
                >
                  <option value={0}>Select an account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
                {errors.accountId && <span className="error-text">{errors.accountId}</span>}
              </div>

              {formData.type === TransactionType.Transfer && (
                <div className="form-group">
                  <label htmlFor="toAccountId">To Account *</label>
                  <select
                    id="toAccountId"
                    value={formData.toAccountId || 0}
                    onChange={(e) => handleChange('toAccountId', Number(e.target.value))}
                    className={errors.toAccountId ? 'input-error' : ''}
                  >
                    <option value={0}>Select destination account</option>
                    {accounts
                      .filter(account => account.id !== formData.accountId)
                      .map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.type})
                        </option>
                      ))}
                  </select>
                  {errors.toAccountId && <span className="error-text">{errors.toAccountId}</span>}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className={errors.notes ? 'input-error' : ''}
                placeholder="Optional notes about this transaction..."
                maxLength={1000}
                rows={3}
              />
              {errors.notes && <span className="error-text">{errors.notes}</span>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => handleChange('isRecurring', e.target.checked)}
                />
                <span>This is a recurring transaction</span>
              </label>
            </div>

            {formData.isRecurring && (
              <div className="recurring-fields">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="recurrencePattern">Recurrence Pattern *</label>
                    <select
                      id="recurrencePattern"
                      value={formData.recurrencePattern}
                      onChange={(e) => handleChange('recurrencePattern', e.target.value)}
                      className={errors.recurrencePattern ? 'input-error' : ''}
                    >
                      <option value="">Select pattern</option>
                      {recurrencePatternOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.recurrencePattern && <span className="error-text">{errors.recurrencePattern}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="nextRecurrenceDate">Next Occurrence</label>
                    <input
                      type="date"
                      id="nextRecurrenceDate"
                      value={formData.nextRecurrenceDate || ''}
                      onChange={(e) => handleChange('nextRecurrenceDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {transaction ? 'Update' : 'Create'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;