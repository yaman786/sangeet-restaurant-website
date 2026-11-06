import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { getRequiredModuleForPathname, resolveRolePermissions } from '@/lib/rbac';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Define protected paths
const protectedPaths = ['/admin', '/kitchen'];

export async function middleware(request: NextRequest) {
  // 1. Permanent redirect for *.vercel.app traffic to canonical domain
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  if (host.includes('vercel.app')) {
    const canonicalUrl = new URL(request.url);
    canonicalUrl.protocol = 'https:';
    canonicalUrl.host = 'www.sangeet.hk';
    canonicalUrl.port = '';
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const { pathname } = request.nextUrl;

  // Check if it's a protected route (excluding login pages)
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path)) &&
    !pathname.startsWith('/admin/login') &&
    !pathname.startsWith('/kitchen/login');

  if (isProtectedPath) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      const userRole = String(payload.role || '');

      if (!userRole || userRole.length < 2) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Super Admin ('admin') always has access to all protected routes
      if (userRole === 'admin') {
        return NextResponse.next();
      }

      const tokenPermissions = Array.isArray(payload.permissions)
        ? payload.permissions.map(String)
        : resolveRolePermissions(userRole);

      const requiredModule = getRequiredModuleForPathname(pathname);

      // Every authenticated staff role can access /admin/dashboard (cards are filtered by role permissions)
      if (requiredModule === 'dashboard') {
        return NextResponse.next();
      }

      if (requiredModule) {
        if (!tokenPermissions.includes(requiredModule)) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        return NextResponse.next();
      }

      // Default fallback for unknown /admin/* routes: require Super Admin
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } catch {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
