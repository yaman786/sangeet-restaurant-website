import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DEFAULT_SYSTEM_ROLES, resolveRolePermissions } from './rbac';

import type { JwtPayload, UserRole } from './types';
export type { JwtPayload, UserRole };

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}

export const VALID_ROLES = Object.keys(DEFAULT_SYSTEM_ROLES);

/**
 * Extracts and verifies the JWT token from the Authorization cookie
 * @param req NextRequest
 * @returns The decoded user payload, or an error Response if invalid
 */
export async function authenticateToken(req: NextRequest): Promise<{ user?: JwtPayload; errorResponse?: NextResponse }> {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return { errorResponse: NextResponse.json({ error: 'Access token required' }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as JwtPayload;
    if (!Array.isArray(decoded.permissions)) {
      decoded.permissions = resolveRolePermissions(decoded.role);
    }
    decoded.is_super_admin = decoded.role === 'admin';
    return { user: decoded };
  } catch {
    return { errorResponse: NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 }) };
  }
}

/**
 * Checks if the user has one of the required roles or module permissions (Super Admin always has access)
 */
export function requireRole(user: JwtPayload, roles: string[]): NextResponse | null {
  if (user.role === 'admin' || user.is_super_admin) {
    return null; // Super Admin always OK
  }

  if (roles.includes(user.role)) {
    return null;
  }

  const perms = Array.isArray(user.permissions)
    ? user.permissions
    : resolveRolePermissions(user.role);

  // If the endpoint asks for 'admin' or 'staff', allow roles that hold management/module permissions
  if (roles.includes('admin') && perms.length > 0) {
    return null;
  }
  if (roles.includes('staff') && perms.length > 0) {
    return null;
  }

  return NextResponse.json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` }, { status: 403 });
}

/**
 * Checks if the user is authenticated and has a valid staff role
 */
export function requireAuth(user: JwtPayload): NextResponse | null {
  if (!user?.role || typeof user.role !== 'string' || user.role.trim().length < 2) {
    return NextResponse.json({ error: 'Access denied. Valid staff authentication required.' }, { status: 403 });
  }
  return null;
}

export function requireAdmin(user: JwtPayload): NextResponse | null {
  return requireRole(user, ['admin']);
}

export function requireSuperAdmin(user: JwtPayload): NextResponse | null {
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Access denied. Only Super Admin can perform this action.' }, { status: 403 });
  }
  return null;
}

/**
 * Extracts and verifies the JWT token from cookies (for Server Actions & Server Components)
 */
export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as JwtPayload;
    if (!Array.isArray(decoded.permissions)) {
      decoded.permissions = resolveRolePermissions(decoded.role);
    }
    decoded.is_super_admin = decoded.role === 'admin';
    return decoded;
  } catch {
    return null;
  }
}
