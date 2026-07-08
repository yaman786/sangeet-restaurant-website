'use client';
import QRManagement from '@/_pages/QRManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <QRManagement />
    </ProtectedRoute>
  );
}
