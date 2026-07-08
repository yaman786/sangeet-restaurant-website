import UnifiedDashboard from '@/_pages/UnifiedDashboard';
import Layout from '@/layouts/StandaloneLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Waiter Dashboard | Sangeet Restaurant',
  description: 'Sangeet Restaurant unified waiter dashboard',
};

export default function Page() {
  return <Layout><UnifiedDashboard /></Layout>;
}
