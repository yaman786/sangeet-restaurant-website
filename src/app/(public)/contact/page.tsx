import ContactPage from '@/_pages/ContactPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Sangeet Restaurant Wan Chai',
  description: 'Get in touch with Sangeet Restaurant in Wan Chai, Hong Kong. Inquiries for table reservations, private dining rooms, corporate events, and catering.',
};

export default function Page() {
  return <ContactPage />;
}
