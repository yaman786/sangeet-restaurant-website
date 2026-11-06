import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, type JwtPayload } from '@/lib/auth';
import { prisma } from '@/lib/db';
import rbacService from '@/lib/services/rbacService';

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
 * still exists and is active, resolving live RBAC permissions for their role.
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

  const permissions = await rbacService.getPermissionsForRole(dbUser.role);

  return {
    user: {
      ...user,
      username: dbUser.username,
      email: dbUser.email,
      role: dbUser.role as JwtPayload['role'],
      permissions,
      is_super_admin: dbUser.role === 'admin'
    }
  };
}

/**
 * Authorizes users who can access Staff Management:
 * Super Admin ('admin') OR any role granted the 'staff' module permission (e.g. GM, Operations Manager).
 */
export async function authorizeAdmin(req: NextRequest): Promise<GuardResult> {
  const result = await authorizeActiveUser(req);
  if (result.errorResponse || !result.user) return result;

  const isSuperAdmin = result.user.role === 'admin';
  const hasStaffPermission = Array.isArray(result.user.permissions) && result.user.permissions.includes('staff');

  if (!isSuperAdmin && !hasStaffPermission) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied. Staff Management permission required.' },
        { status: 403 }
      )
    };
  }

  return result;
}

/**
 * Strictly requires Super Admin ('admin') for Role Creation & Permission Matrix changes.
 */
export async function authorizeSuperAdmin(req: NextRequest): Promise<GuardResult> {
  const result = await authorizeActiveUser(req);
  if (result.errorResponse || !result.user) return result;

  if (result.user.role !== 'admin') {
    return {
      errorResponse: NextResponse.json(
        { error: 'Access denied. Only Super Admin can manage roles and permissions.' },
        { status: 403 }
      )
    };
  }

  return result;
}
