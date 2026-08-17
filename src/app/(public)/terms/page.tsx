import TermsOfServicePage from '@/_pages/TermsOfServicePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Sangeet Restaurant Wan Chai',
  description: 'Guest policy, table reservation terms, and dining guidelines for Sangeet Restaurant, 17 Fenwick Street, Wan Chai, Hong Kong.',
};

export default function Page() {
  return <TermsOfServicePage />;
}
