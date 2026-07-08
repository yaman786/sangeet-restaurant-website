import RestaurantWebsiteManagementPage from '@/_pages/RestaurantWebsiteManagementPage';
import ProtectedRoute from '@/components/ProtectedRoute';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Website Management | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Website Management',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <RestaurantWebsiteManagementPage />
    </ProtectedRoute>
  );
}
