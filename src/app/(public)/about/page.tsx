import AboutPage from '@/_pages/AboutPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Sangeet Restaurant Wan Chai',
  description: 'About Sangeet — South Asian fine dining in Wan Chai, Hong Kong. Authentic tandoori grills, slow-cooked regional curries, 100% Halal certified meats, and private dining.',
};

export default function Page() {
  return <AboutPage />;
}
