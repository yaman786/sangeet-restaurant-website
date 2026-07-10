export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, requireRole } from '@/lib/auth';
import qrService from '@/lib/services/qrService';

export async function GET(req: NextRequest, { params }: { params: { qrCodeId: string, format: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    // Require staff or admin
    const roleError = requireRole(authResult.user!, ['admin', 'staff']);
    if (roleError) return roleError;

    const searchParams = req.nextUrl.searchParams;
    const design = searchParams.get('design') || 'classic';
    const theme = searchParams.get('theme') || 'modern';

    const { qrCodeBuffer, tableNumber } = await qrService.generatePrintableQRCode(params.qrCodeId, params.format, design, theme);

    // Serve the image buffer
    return new NextResponse(qrCodeBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="Table-${tableNumber}-QR.svg"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });
  } catch (error: any) {
    console.error('Print QR Code error:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
