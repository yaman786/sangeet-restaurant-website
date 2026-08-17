import LocationPage from '@/_pages/LocationPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Location & Transit | Sangeet Restaurant Wan Chai',
  description: 'Find Sangeet Restaurant in Wan Chai, Hong Kong. Opening hours, MTR and tramway transit guide, and neighborhood directions.',
};

export default function Page() {
  return <LocationPage />;
}
