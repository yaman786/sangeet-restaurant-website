import OrderTrackingPage from '@/_pages/OrderTrackingPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order | Sangeet Restaurant',
  description: 'Track the status of your Sangeet Restaurant delivery or pickup order in real-time.',
};

export default function Page() {
  return <OrderTrackingPage />;
}
