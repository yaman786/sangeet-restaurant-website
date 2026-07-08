'use client';
import AdminDashboard from '@/_pages/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception', 'waiter']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
