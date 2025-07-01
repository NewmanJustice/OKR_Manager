import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/utils/session';
import { limiter } from '../_middleware/rateLimit';
import { handleZodError } from '../_middleware/handleZodError';

export async function GET(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const res = NextResponse.json({ ok: true }, { headers });
    clearSessionCookie(res);
    return res;
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
