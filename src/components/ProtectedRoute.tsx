"use client";
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const Navigate = ({ to }: { to: string }) => {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
};

const ProtectedRoute = ({ children, requiredRole = null }: { children: React.ReactNode, requiredRole?: string | string[] | null }) => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname() || '';

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on the route
    const isKitchenRoute = pathname.startsWith('/kitchen');
    const isAdminRoute = pathname.startsWith('/admin');
    
    if (isKitchenRoute) {
      return <Navigate to="/kitchen/login" />;
    } else if (isAdminRoute) {
      return <Navigate to="/admin/login" />;
    } else {
      return <Navigate to="/login" />;
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
              You don&apos;t have permission to access this page.
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
