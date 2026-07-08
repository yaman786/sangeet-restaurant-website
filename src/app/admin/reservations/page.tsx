import ReservationManagementPage from '@/_pages/ReservationManagementPage';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservations | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Reservations',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception']}>
      <ReservationManagementPage />
    </ProtectedRoute>
  );
}
