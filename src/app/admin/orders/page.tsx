import AdminOrders from '@/_pages/AdminOrders';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Orders',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception', 'waiter']}>
      <AdminOrders />
    </ProtectedRoute>
  );
}
