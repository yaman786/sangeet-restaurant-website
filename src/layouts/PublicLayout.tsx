"use client";
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';
import ActiveOrderTrackerPill from '../components/ActiveOrderTrackerPill';

const PublicLayout = ({ children }: any) => {
  return (
    <>
      <Header />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <ActiveOrderTrackerPill />
      <Footer />
    </>
  );
};

export default PublicLayout;
