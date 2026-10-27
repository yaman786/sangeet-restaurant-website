import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, requireAdmin, type JwtPayload } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface GuardResult {
  user?: JwtPayload;
  errorResponse?: NextResponse;
}

async function loadActiveUser(userId: number) {
  return prisma.users.findUnique({
    where: { id: userId },
    select: { id: true, username: true, email: true, role: true, is_active: true, deleted_at: true }
  });
}

/**
 * Authenticates the request and confirms against the database that the caller
 * still exists and is active, so a JWT issued before an account was disabled,
 * deleted or demoted cannot keep acting for the rest of its 24h lifetime.
 */
export async function authorizeActiveUser(req: NextRequest): Promise<GuardResult> {
  const { user, errorResponse } = await authenticateToken(req);
  if (errorResponse || !user) {
    return { errorResponse: errorResponse ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const dbUser = await loadActiveUser(user.id);
  if (!dbUser || !dbUser.is_active || dbUser.deleted_at) {
    return { errorResponse: NextResponse.json({ error: 'User inactive or not found' }, { status: 401 }) };
  }

  return {
    user: {
      ...user,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role as JwtPayload['role']
    }
  };
}

/** Same as authorizeActiveUser, additionally requiring the admin role from the database. */
export async function authorizeAdmin(req: NextRequest): Promise<GuardResult> {
  const result = await authorizeActiveUser(req);
  if (result.errorResponse || !result.user) return result;

  const roleError = requireAdmin(result.user);
  if (roleError) return { errorResponse: roleError };

  return result;
}
