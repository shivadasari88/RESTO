import React from 'react';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded ${className}`}>
      <div className="flex items-center">
        <span className="mr-2">⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;