import KitchenDisplayPage from '@/_pages/KitchenDisplayPage';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bar Display (BOT) | Admin - Sangeet',
  description: 'Sangeet Restaurant Bar Order Ticket (BOT) Display',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'kitchen', 'waiter', 'reception']}>
      <KitchenDisplayPage defaultStation="bot" />
    </ProtectedRoute>
  );
}

