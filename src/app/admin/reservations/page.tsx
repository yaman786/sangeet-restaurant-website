'use client';
import ReservationManagementPage from '@/_pages/ReservationManagementPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception']}>
      <ReservationManagementPage />
    </ProtectedRoute>
  );
}
