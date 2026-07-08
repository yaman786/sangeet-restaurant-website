import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const body = await req.json();
    const order = await orderService.updateOrderStatus(params.id, body.status);
    
    return NextResponse.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    return handleApiError(error);
  }
}
