export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { name, display_order, is_active } = body;
    
    try {
      const category = await prisma.categories.update({
        where: { id },
        data: {
          name, 
          display_order: display_order || 0, 
          is_active: is_active !== false
        }
      });
      return NextResponse.json(category);
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Category');
      throw e;
    }
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

    const id = parseInt(params.id, 10);
    try {
      await prisma.categories.update({
        where: { id },
        data: { is_active: false }
      });
      return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Category');
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
