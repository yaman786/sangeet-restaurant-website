import LocationPage from '@/_pages/LocationPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Location & Hours | Sangeet Restaurant',
  description: 'Find Sangeet Restaurant in Wanchai, Hong Kong. View our opening hours, address, and get directions to our authentic South Asian dining experience.',
};

export default function Page() {
  return <LocationPage />;
}
