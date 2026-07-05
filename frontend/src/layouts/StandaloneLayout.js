import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

const StandaloneLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default StandaloneLayout;
