import StaffManagement from '@/_pages/StaffManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Management | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Staff Management',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <StaffManagement />
    </ProtectedRoute>
  );
}
