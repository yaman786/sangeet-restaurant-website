import ReservationsPage from '@/_pages/ReservationsPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reservations | Sangeet Restaurant',
  description: 'Book your table at Sangeet Restaurant. Experience authentic South Asian cuisine in a luxurious setting in the heart of Hong Kong.',
};

export default function Page() {
  return <ReservationsPage />;
}
