import QRCodeDisplayPage from '@/_pages/QRCodeDisplayPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Codes | Sangeet Restaurant',
  description: 'Scan QR codes at your table to view our menu and place orders instantly.',
};

export default function Page() {
  return <QRCodeDisplayPage />;
}
