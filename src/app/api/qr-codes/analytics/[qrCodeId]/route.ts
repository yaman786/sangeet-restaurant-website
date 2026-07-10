export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';
import qrService from '@/lib/services/qrService';

export async function GET(req: NextRequest, { params }: { params: { qrCodeId: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    // Require staff or admin
    const roleError = requireRole(authResult.user!, ['admin', 'staff']);
    if (roleError) return roleError;

    const result = await qrService.getQRCodeAnalytics(params.qrCodeId);
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
