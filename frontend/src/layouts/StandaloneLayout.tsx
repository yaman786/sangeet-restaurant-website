"use client";
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

const StandaloneLayout = ({ children }: any) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default StandaloneLayout;
