import KitchenDisplayPage from '@/_pages/KitchenDisplayPage';
import StandaloneLayout from '@/layouts/StandaloneLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kitchen Display | Sangeet Restaurant',
  description: 'Sangeet Restaurant Kitchen Display System',
};

export default function Page() {
  return (
    <StandaloneLayout>
      <ProtectedRoute requiredRole={['admin', 'kitchen', 'waiter']}>
      <KitchenDisplayPage />
    </ProtectedRoute>
    </StandaloneLayout>
  );
}
