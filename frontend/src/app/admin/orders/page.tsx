'use client';
import AdminOrders from '@/_pages/AdminOrders';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception', 'waiter']}>
      <AdminOrders />
    </ProtectedRoute>
  );
}
