import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// Cannot use jsonwebtoken in Edge Runtime (Middleware). We use jose instead.
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sangeet-restaurant-secret-key'
);

// Define protected paths
const protectedPaths = ['/admin', '/kitchen'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a protected route
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify token
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      
      // Basic Role Checks based on pathname
      if (pathname.startsWith('/admin') && payload.role !== 'admin' && payload.role !== 'staff') {
         return NextResponse.redirect(new URL('/login', request.url));
      }

      // If valid, continue
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
