export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await authenticateToken(req);
    if (errorResponse) return errorResponse;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.users.findUnique({
      where: { id: user.id }
    });

    if (!dbUser || !dbUser.is_active) {
      return NextResponse.json({ error: 'User inactive or not found' }, { status: 401 });
    }

    const { password_hash, ...userWithoutPassword } = dbUser;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return handleApiError(error);
  }
}
