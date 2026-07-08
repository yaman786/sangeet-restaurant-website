'use client';
import AnalyticsReportsPage from '@/_pages/AnalyticsReportsPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <AnalyticsReportsPage />
    </ProtectedRoute>
  );
}
