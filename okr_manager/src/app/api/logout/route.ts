import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/utils/session';

export async function GET(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
