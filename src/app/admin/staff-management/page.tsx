'use client';
import StaffManagement from '@/_pages/StaffManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <StaffManagement />
    </ProtectedRoute>
  );
}
