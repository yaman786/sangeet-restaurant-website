export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, NotFoundError } from '@/lib/errors';
import { authenticateToken, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const item = await prisma.menu_items.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('Menu item');
    
    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateToken(req);
    if (authResult.errorResponse) return authResult.errorResponse;
    const roleError = requireRole(authResult.user!, ['admin']);
    if (roleError) return roleError;

    const id = parseInt(params.id, 10);
    const body = await req.json();
    const { name, description, price, category, image_url, is_vegetarian, is_spicy, is_popular, is_available, allergens, preparation_time } = body;
    
    try {
      const item = await prisma.menu_items.update({
        where: { id },
        data: {
          name, 
          description, 
          price, 
          category, 
          image_url: image_url || null, 
          is_vegetarian: is_vegetarian || false, 
          is_spicy: is_spicy || false, 
          is_popular: is_popular || false, 
          is_active: is_available !== false, 
          allergens: allergens || null, 
          preparation_time: preparation_time || 15, 
          updated_at: new Date()
        }
      });
      return NextResponse.json(item);
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Menu item');
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
      await prisma.menu_items.delete({ where: { id } });
      return NextResponse.json({ message: 'Menu item deleted successfully' });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundError('Menu item');
      throw e;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
