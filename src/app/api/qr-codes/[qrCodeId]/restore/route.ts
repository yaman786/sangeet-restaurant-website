export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';
import qrService from '@/lib/services/qrService';

export async function POST(
  req: NextRequest,
  { params }: { params: { qrCodeId: string } }
) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    // Require admin
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    await qrService.restoreQRCode(params.qrCodeId);
    
    return NextResponse.json({ success: true, message: 'QR Code restored' });
  } catch (error) {
    return handleApiError(error);
  }
}
