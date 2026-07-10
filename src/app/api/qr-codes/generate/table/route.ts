export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';
import qrService from '@/lib/services/qrService';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    // Require admin
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const data = await req.json();
    const result = await qrService.generateTableQRCode(data);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('CREATE error:', error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
