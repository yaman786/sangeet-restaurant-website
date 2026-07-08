import MenuManagement from '@/_pages/MenuManagement';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Menu Management | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Menu Management',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <MenuManagement />
    </ProtectedRoute>
  );
}
