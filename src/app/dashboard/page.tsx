import UnifiedDashboard from '@/_pages/UnifiedDashboard';
import Layout from '@/layouts/StandaloneLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Order | Sangeet Fine Dining',
  description: 'Sangeet Restaurant unified dashboard',
};

export default function Page() {
  return <Layout><UnifiedDashboard /></Layout>;
}
