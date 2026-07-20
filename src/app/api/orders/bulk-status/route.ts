export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import orderService from '@/lib/services/orderService';
import { handleApiError } from '@/lib/errors';
import { authenticateToken, requireAuth } from '@/lib/auth';
import { z } from 'zod';
import { orderStatusSchema } from '@/lib/validations/order';

const bulkUpdateSchema = z.object({
  orderIds: z.array(z.number().or(z.string()).transform(val => Number(val))),
  status: orderStatusSchema,
});

export async function PATCH(req: NextRequest) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    
    // Require admin or staff role for updating order statuses
    const roleError = requireAuth(authResult.user!);
    if (roleError) return roleError;

    const rawBody = await req.json();
    const body = bulkUpdateSchema.parse(rawBody);

    const result = await orderService.bulkUpdateOrderStatus(body.orderIds, body.status);
    
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
