'use client';
import HistoryDashboard from '@/_pages/HistoryDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception']}>
      <HistoryDashboard />
    </ProtectedRoute>
  );
}
