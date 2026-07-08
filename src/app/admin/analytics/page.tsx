import AnalyticsReportsPage from '@/_pages/AnalyticsReportsPage';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Analytics',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <AnalyticsReportsPage />
    </ProtectedRoute>
  );
}
