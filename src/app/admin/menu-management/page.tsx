'use client';
import MenuManagement from '@/_pages/MenuManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <MenuManagement />
    </ProtectedRoute>
  );
}
