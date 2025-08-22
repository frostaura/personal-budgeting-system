import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">
          <AlertTriangle size={48} />
        </div>
        <h3>Something went wrong</h3>
        <p className="error-message">{message}</p>
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;