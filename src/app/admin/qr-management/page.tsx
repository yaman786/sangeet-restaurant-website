import QRManagement from '@/_pages/QRManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qr Management | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Qr Management',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <QRManagement />
    </ProtectedRoute>
  );
}
