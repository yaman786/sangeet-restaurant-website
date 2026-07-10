export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';
import qrService from '@/lib/services/qrService';

export async function PUT(req: NextRequest, { params }: { params: { qrCodeId: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    // Require admin
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const design = await req.json();
    const result = await qrService.updateQRCodeDesign(params.qrCodeId, design);
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
