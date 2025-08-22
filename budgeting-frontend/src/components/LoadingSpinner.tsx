import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <Loader2 className="animate-spin" size={32} />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;