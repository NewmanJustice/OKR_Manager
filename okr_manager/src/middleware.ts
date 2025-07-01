import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = process.env.AUTH_SECRET || 'dev-secret';
const COOKIE_NAME = 'okr_session';

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  let user = null;
  if (cookie) {
    try {
      const { payload } = await jwtVerify(cookie, new TextEncoder().encode(SECRET));
      user = payload;
    } catch {
      // Invalid token, treat as not logged in
    }
  }

  // If not logged in, redirect to login for all protected routes
  const publicPaths = [
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/roles',
    '/favicon.ico',
    '/_next',
    '/api/public',
    '/reset-password',
    '/reset-password/request',
    '/verify', // allow public access to verification page
    '/api/auth/verify', // allow public access to verification API
  ];
  const isPublic = publicPaths.some((p) => req.nextUrl.pathname.startsWith(p));
  if (!user && !isPublic) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  // If logged in, redirect / to dashboard based on new fields
  if (req.nextUrl.pathname === '/') {
    if (user?.isLineManager) {
      const pdmUrl = req.nextUrl.clone();
      pdmUrl.pathname = '/pdm';
      return NextResponse.redirect(pdmUrl);
    }
    if (user?.isAdmin) {
      const adminUrl = req.nextUrl.clone();
      adminUrl.pathname = '/admin';
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|api/public).*)'],
};
