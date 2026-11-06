"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getRequiredModuleForPathname, hasModulePermission } from '@/lib/rbac';

const Navigate = ({ to }: { to: string }) => {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return null;
};

const ProtectedRoute = ({
  children,
  requiredRole = null,
}: {
  children: React.ReactNode;
  requiredRole?: string | string[] | null;
}) => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname() || '';

  if (!isAuthenticated) {
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

  // Super Admin ('admin') always has access
  if (userRole === 'admin') {
    return children;
  }

  const requiredModule = getRequiredModuleForPathname(pathname);

  // Every authenticated staff member can access /admin/dashboard (cards are dynamically shown according to role)
  if (requiredModule === 'dashboard') {
    return children;
  }

  // Check module-based RBAC permission first
  if (requiredModule) {
    if (hasModulePermission(user, requiredModule)) {
      return children;
    }
  }

  // Fallback legacy role check
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (roles.includes(userRole as string)) {
      return children;
    }
  }

  return (
    <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-sangeet-neutral-900 border border-sangeet-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-sangeet-neutral-100 mb-2">Access Denied</h1>
        <p className="text-sangeet-neutral-400 mb-4">
          Your role (<span className="text-sangeet-400 font-semibold">{userRole || 'none'}</span>) does not have permission to access this module.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center px-5 py-2.5 bg-sangeet-400 text-sangeet-neutral-950 font-semibold rounded-lg hover:bg-sangeet-300 transition-colors text-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ProtectedRoute;
