import KitchenDisplayPage from '@/_pages/KitchenDisplayPage';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kitchen | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Kitchen',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'kitchen', 'waiter']}>
      <KitchenDisplayPage />
    </ProtectedRoute>
  );
}
