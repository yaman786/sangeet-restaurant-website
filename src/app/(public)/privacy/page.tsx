import PrivacyPolicyPage from '@/_pages/PrivacyPolicyPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sangeet Restaurant Wan Chai',
  description: 'Privacy Policy and data protection practices for Sangeet Restaurant, 17 Fenwick Street, Wan Chai, Hong Kong. Compliant with Hong Kong PDPO (Cap. 486).',
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
