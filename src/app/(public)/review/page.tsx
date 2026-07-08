import ReviewSubmissionPage from '@/_pages/ReviewSubmissionPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leave a Review | Sangeet Restaurant',
  description: 'Share your dining experience at Sangeet Restaurant. We value your feedback and strive to provide the best South Asian cuisine in Hong Kong.',
};

export default function Page() {
  return <ReviewSubmissionPage />;
}
