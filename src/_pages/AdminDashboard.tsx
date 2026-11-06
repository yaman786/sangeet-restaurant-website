"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useNavigate } from '@/utils/router-mock';
import { getProfile, getRolesCatalog } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AdminHeader from '../components/AdminHeader';
import {
  ADMIN_MODULES,
  BADGE_COLOR_STYLES,
  DEFAULT_SYSTEM_ROLES,
  hasModulePermission,
  type RoleDefinition,
} from '@/lib/rbac';

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [rolesCatalog, setRolesCatalog] = useState<Record<string, RoleDefinition>>(DEFAULT_SYSTEM_ROLES);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { user: authUser, isAuthenticated }: any = useAuth();

  useEffect(() => {
    const fetchProfileAndRoles = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        const [userData, rolesRes] = await Promise.all([
          getProfile().catch(() => null),
          getRolesCatalog().catch(() => null),
        ]);

        if (rolesRes?.roles) {
          setRolesCatalog(rolesRes.roles);
        }

        const resolvedUser = (userData as any)?.user ?? userData;
        setUser(resolvedUser?.role ? resolvedUser : authUser);
      } catch {
        if (authUser) {
          setUser(authUser);
        } else {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndRoles();
  }, [isAuthenticated, navigate, authUser]);

  const roleDef = useMemo(() => {
    const roleKey = user?.role || 'waiter';
    return (
      rolesCatalog[roleKey] ||
      DEFAULT_SYSTEM_ROLES[roleKey] || {
        key: roleKey,
        label: roleKey,
        icon: '🛡️',
        description: 'Custom staff role',
        tier: 'operational',
        badgeColor: 'blue',
        isSystem: false,
        permissions: Array.isArray(user?.permissions) ? user.permissions : [],
      }
    );
  }, [user, rolesCatalog]);

  const visibleModules = useMemo(() => {
    return ADMIN_MODULES.filter((mod) => hasModulePermission(user, mod.key, rolesCatalog));
  }, [user, rolesCatalog]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sangeet-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sangeet-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const badgeStyle = BADGE_COLOR_STYLES[roleDef.badgeColor] || BADGE_COLOR_STYLES.blue;

  return (
    <div className="min-h-screen bg-sangeet-neutral-950">
      <AdminHeader title="Admin Dashboard" subtitle="Overview" showBackButton={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome & Role Status Banner */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-sangeet-neutral-900/60 border border-sangeet-neutral-800 rounded-2xl p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-sangeet-400">
                Welcome back, {user?.full_name?.split(' ')[0] || user?.username || 'Admin'}! 👋
              </h2>
              <span
                data-testid="dashboard-role-badge"
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeStyle}`}
              >
                <span>{roleDef.icon}</span>
                <span>{roleDef.label}</span>
              </span>
            </div>
            <p className="text-sangeet-neutral-400 text-sm">
              {roleDef.description || 'Manage your restaurant operations from this central dashboard.'}
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center">
            <div className="px-4 py-2 rounded-xl bg-sangeet-neutral-950 border border-sangeet-neutral-800 text-xs text-sangeet-neutral-300">
              <span className="font-bold text-sangeet-400" data-testid="dashboard-module-count">
                {visibleModules.length}
              </span>{' '}
              {visibleModules.length === 1 ? 'Module' : 'Modules'} Assigned
            </div>
          </div>
        </div>

        {/* Dashboard Grid — Dynamically Rendered According to Role Permissions */}
        {visibleModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" data-testid="dashboard-cards-grid">
            {visibleModules.map((mod) => (
              <div
                key={mod.key}
                data-testid={`dashboard-card-${mod.key}`}
                className={`bg-sangeet-neutral-900 rounded-xl p-6 border border-sangeet-neutral-700 ${mod.accentClass} transition-all duration-300 group flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${mod.iconBgClass} rounded-lg flex items-center justify-center transition-colors`}
                    >
                      <span className="text-2xl">{mod.icon}</span>
                    </div>
                    <span
                      className={
                        mod.key === 'kitchen'
                          ? 'text-orange-400 text-xs font-semibold uppercase tracking-wider'
                          : mod.key === 'bar'
                          ? 'text-purple-400 text-xs font-semibold uppercase tracking-wider'
                          : 'text-sangeet-neutral-500 text-sm'
                      }
                    >
                      {mod.badgeText}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-sangeet-neutral-100 mb-2">{mod.label}</h3>
                  <p className="text-sangeet-neutral-400 text-sm mb-4">{mod.description}</p>
                </div>
                <Link
                  href={mod.href}
                  className="inline-flex items-center text-sangeet-400 hover:text-sangeet-300 font-medium text-sm group-hover:underline"
                >
                  {mod.ctaLabel}
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-sangeet-neutral-900 rounded-2xl border border-sangeet-neutral-800 p-12 text-center mt-8">
            <div className="text-5xl mb-3">🔒</div>
            <h3 className="text-xl font-bold text-sangeet-neutral-200 mb-2">No Modules Assigned Yet</h3>
            <p className="text-sangeet-neutral-400 text-sm max-w-md mx-auto">
              Your role ({roleDef.label}) currently has no active dashboard cards assigned. Please contact the Super Admin to enable module access.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
