'use client';
import KitchenDisplayPage from '@/_pages/KitchenDisplayPage';
import StandaloneLayout from '@/layouts/StandaloneLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <StandaloneLayout>
      <ProtectedRoute requiredRole={['admin', 'kitchen', 'waiter']}>
      <KitchenDisplayPage />
    </ProtectedRoute>
    </StandaloneLayout>
  );
}
