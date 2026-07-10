export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';
import qrService from '@/lib/services/qrService';


export async function DELETE(req: NextRequest, { params }: { params: { qrCodeId: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    // Require admin
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    await qrService.deleteQRCode(params.qrCodeId);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
