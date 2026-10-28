import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set');
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Define protected paths
const protectedPaths = ['/admin', '/kitchen'];

const ADMIN_ROUTE_ROLES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/admin/orders', roles: ['admin', 'reception', 'waiter'] },
  { prefix: '/admin/dashboard', roles: ['admin', 'reception', 'waiter', 'kitchen'] },
  { prefix: '/admin/reservations', roles: ['admin', 'reception'] },
  { prefix: '/admin/history', roles: ['admin', 'reception'] },
  { prefix: '/admin/kitchen', roles: ['admin', 'kitchen'] },
];

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

      // Role Checks based on pathname aligned with page-level ProtectedRoute rules
      if (pathname.startsWith('/admin')) {
        const matchedRoute = ADMIN_ROUTE_ROLES.find(route => pathname.startsWith(route.prefix));
        const allowedRoles = matchedRoute ? matchedRoute.roles : ['admin'];
        if (!allowedRoles.includes(userRole)) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }

      if (pathname.startsWith('/kitchen') && userRole !== 'admin' && userRole !== 'kitchen') {
         return NextResponse.redirect(new URL('/login', request.url));
      }

      // If valid, continue
      return NextResponse.next();
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
