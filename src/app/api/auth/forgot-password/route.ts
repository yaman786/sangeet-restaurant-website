export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/services/authService';
import { handleApiError } from '@/lib/errors';
import { checkRateLimit } from '@/lib/utils/rateLimit';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'login');
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const body = await req.json();

    if (body?.action === 'reset_super_admin') {
      const result = await authService.resetSuperAdminPassword({
        method: body?.method === 'recovery_key' ? 'recovery_key' : 'otp',
        code: typeof body?.code === 'string' ? body.code : '',
        newPassword: typeof body?.newPassword === 'string' ? body.newPassword : ''
      });
      return NextResponse.json(result);
    }

    const identifier = typeof body?.identifier === 'string' ? body.identifier : '';

    const result = await authService.requestPasswordReset(identifier);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
