import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }: { children: React.ReactNode, requiredRole?: string | string[] | null }) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Small delay to allow context to initialize if needed
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sangeet-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on the route
    const isKitchenRoute = location.pathname.startsWith('/kitchen');
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    if (isKitchenRoute) {
      return <Navigate to="/kitchen/login" replace />;
    } else if (isAdminRoute) {
      return <Navigate to="/admin/login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  const userRole = user?.role;

  // Check role-specific access
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!roles.includes(userRole as string) && userRole !== 'admin') {
      return (
        <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-sangeet-neutral-100 mb-2">Access Denied</h1>
            <p className="text-sangeet-neutral-400 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-sangeet-neutral-500">
              Required roles: {roles.join(', ')} | Your role: {userRole || 'none'}
            </p>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
