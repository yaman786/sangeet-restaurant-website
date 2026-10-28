export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import qrService from '@/lib/services/qrService';

export async function GET(req: NextRequest, props: { params: Promise<{ tableNumber: string }> }) {
  const params = await props.params;
  try {
    const table = await qrService.getTableByQRCode(params.tableNumber, { allowIdFallback: false });
    return NextResponse.json(table);
  } catch (error) {
    return handleApiError(error);
  }
}
