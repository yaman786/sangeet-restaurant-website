import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface JwtPayload {
  id: number;
  username: string;
  role: 'admin' | 'kitchen' | 'reception' | 'waiter';
  email: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'sangeet-restaurant-secret-key';

export const VALID_ROLES = ['admin', 'kitchen', 'reception', 'waiter'];

/**
 * Extracts and verifies the JWT token from the Authorization header
 * @param req NextRequest
 * @returns The decoded user payload, or an error Response if invalid
 */
export async function authenticateToken(req: NextRequest): Promise<{ user?: JwtPayload; errorResponse?: NextResponse }> {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return { errorResponse: NextResponse.json({ error: 'Access token required' }, { status: 401 }) };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return { user: decoded };
  } catch (err) {
    return { errorResponse: NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 }) };
  }
}

/**
 * Checks if the user has one of the required roles (admin always has access)
 */
export function requireRole(user: JwtPayload, roles: string[]): NextResponse | null {
  if (user.role === 'admin') {
    return null; // OK
  }
  
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: `Access denied. Requires one of roles: ${roles.join(', ')}` }, { status: 403 });
  }

  return null; // OK
}

/**
 * Checks if the user is authenticated and has any valid role
 */
export function requireAuth(user: JwtPayload): NextResponse | null {
  if (!VALID_ROLES.includes(user.role)) {
    return NextResponse.json({ error: 'Access denied. Valid staff authentication required.' }, { status: 403 });
  }
  return null;
}

export function requireAdmin(user: JwtPayload): NextResponse | null {
  return requireRole(user, ['admin']);
}

/**
 * Extracts and verifies the JWT token from cookies (for Server Actions & Server Components)
 */

export async function getAuthUser(): Promise<JwtPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    return null;
  }
}
