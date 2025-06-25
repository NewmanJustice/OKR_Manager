import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = process.env.AUTH_SECRET || 'dev-secret';
const COOKIE_NAME = 'okr_session';

export async function setSessionCookie(res: NextResponse, user: { id: number; email: string; role: string }) {
  const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(SECRET));
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: false, // Always false in dev for local testing
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSessionUserFromRequest(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, new TextEncoder().encode(SECRET));
    return payload as { id: number; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getSessionUserFromCookies() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie, new TextEncoder().encode(SECRET));
    return payload as { id: number; email: string; role: string };
  } catch {
    return null;
  }
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({ name: COOKIE_NAME, value: '', maxAge: 0, path: '/' });
}
