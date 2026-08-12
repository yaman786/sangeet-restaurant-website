export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { sendEmail } from '@/lib/utils/emailService';
import config from '@/lib/utils/env';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'contact');
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    const adminEmail = config.ADMIN_NOTIFY_EMAIL || 'ranaji13@sangeet.hk';

    // Send the enquiry notification to admin (info@sangeet.hk is handled by Prithvi)
    const result = await sendEmail(adminEmail, 'contactEnquiry', {
      customer_name: `${firstName} ${lastName}`,
      email,
      phone: phone || 'Not provided',
      subject,
      message,
    } as any, email);

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
