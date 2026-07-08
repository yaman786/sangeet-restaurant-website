import AdminDashboard from '@/_pages/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Admin - Sangeet',
  description: 'Sangeet Restaurant Admin Dashboard',
};

export default function Page() {
  return (
    <ProtectedRoute requiredRole={['admin', 'reception', 'waiter']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
