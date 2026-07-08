import HistoryDashboard from '@/_pages/HistoryDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'History | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin History',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception']}>
      <HistoryDashboard />
    </ProtectedRoute>
  );
}
