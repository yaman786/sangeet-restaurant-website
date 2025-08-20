import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      const kitchenToken = localStorage.getItem('kitchenToken');
      const adminUser = localStorage.getItem('adminUser');
      const kitchenUser = localStorage.getItem('kitchenUser');

      let authenticated = false;
      let role = null;

      // Check admin authentication first (admin can access everything)
      if (adminToken && adminUser) {
        try {
          JSON.parse(adminUser); // Validate JSON format
          authenticated = true;
          role = 'admin';
        } catch (error) {
          console.error('Error parsing admin user data:', error);
        }
      }
      // Check kitchen authentication
      else if (kitchenToken && kitchenUser) {
        try {
          JSON.parse(kitchenUser); // Validate JSON format
          authenticated = true;
          role = 'kitchen';
        } catch (error) {
          console.error('Error parsing kitchen user data:', error);
        }
      }

      setIsAuthenticated(authenticated);
      setUserRole(role);
      setIsLoading(false);
    };

    checkAuth();
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

  // Check role-specific access
  if (requiredRole && userRole !== requiredRole && userRole !== 'admin') {
    // Admin can access everything, but other roles need specific permissions
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-sangeet-neutral-100 mb-2">Access Denied</h1>
          <p className="text-sangeet-neutral-400 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-sangeet-neutral-500">
            Required role: {requiredRole} | Your role: {userRole}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
