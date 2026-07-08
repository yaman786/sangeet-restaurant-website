'use client';
import KitchenDisplayPage from '@/_pages/KitchenDisplayPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'kitchen', 'waiter']}>
      <KitchenDisplayPage />
    </ProtectedRoute>
  );
}
