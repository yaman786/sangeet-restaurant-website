'use client';
import RestaurantWebsiteManagementPage from '@/_pages/RestaurantWebsiteManagementPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Page() {
  return (
    <ProtectedRoute requiredRole={'admin'}>
      <RestaurantWebsiteManagementPage />
    </ProtectedRoute>
  );
}
