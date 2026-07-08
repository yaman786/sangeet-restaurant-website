import AboutPage from '@/_pages/AboutPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Sangeet Restaurant',
  description: 'Learn about our story, meet our team, and discover what makes Sangeet the premier destination for authentic South Asian cuisine in Hong Kong.',
};

export default function Page() {
  return <AboutPage />;
}
