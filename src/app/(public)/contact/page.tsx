import ContactPage from '@/_pages/ContactPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Sangeet Restaurant',
  description: 'Get in touch with Sangeet Restaurant for reservations, private events, or general inquiries.',
};

export default function Page() {
  return <ContactPage />;
}
