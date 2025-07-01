import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';
import { limiter } from '../_middleware/rateLimit';
import { handleZodError } from '../_middleware/handleZodError';

export async function GET(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const user = await getSessionUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200, headers });
    }
    return NextResponse.json({ user }, { status: 200, headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
