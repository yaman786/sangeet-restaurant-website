import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ErrorBoundary from '../components/ErrorBoundary';

const PublicLayout = ({ children }) => {
  return (
    <>
      <Header />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <Footer />
    </>
  );
};

export default PublicLayout;
