export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireRole, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const tableNumber = searchParams.get('tableNumber');
    
    // If no tableNumber is provided, require staff authentication
    if (!tableNumber) {
      const authResult = await authenticateToken(req);
      if (authResult.errorResponse) return authResult.errorResponse;
      const roleError = requireAuth(authResult.user!);
      if (roleError) return roleError;
    }
    
    // tableNumber is passed when polling from public view
    const order = await orderService.getOrderById(params.id, tableNumber || undefined);
    return NextResponse.json(order);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const result = await orderService.deleteOrder(params.id);
    return NextResponse.json({ message: 'Order deleted successfully', ...result });
  } catch (error) {
    return handleApiError(error);
  }
}
