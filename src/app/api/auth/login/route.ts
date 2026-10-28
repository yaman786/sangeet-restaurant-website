export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { loginSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import authService from '@/lib/services/authService';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, 'login');
    if (!rateLimit.success && rateLimit.response) {
      return rateLimit.response;
    }

    const rawBody = await req.json();
    const { username, password } = loginSchema.parse(rawBody);

    const { token, user } = await authService.login({ username, password });

    const response = NextResponse.json({
      message: 'Login successful',
      user
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
