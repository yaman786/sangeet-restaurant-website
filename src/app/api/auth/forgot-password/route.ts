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
    const identifier = typeof body?.identifier === 'string' ? body.identifier : '';

    const result = await authService.requestPasswordReset(identifier);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
