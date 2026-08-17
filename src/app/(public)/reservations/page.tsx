import ReservationsPage from '@/_pages/ReservationsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservations | Sangeet Restaurant Wan Chai',
  description: 'Reserve a table at Sangeet Restaurant in Wan Chai, Hong Kong. Online reservations with instant email confirmation. Halal certified South Asian fine dining.',
};

export default function Page() {
  return <ReservationsPage />;
}
