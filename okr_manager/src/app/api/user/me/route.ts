import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';
import { withCORSHeaders, handleOptions } from '@/utils/cors';

export async function GET(req: NextRequest) {
  try {
    const headers = withCORSHeaders(limiter.checkNext(req, 20));
    const session = await getSessionUserFromRequest(req);
    if (!session) {
      // Return 200 with no user object for easier client logic
      return NextResponse.json({}, { headers });
    }
    // Return only minimal info needed for UI
    return NextResponse.json({ id: session.id, email: session.email, roleName: session.roleName }, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: withCORSHeaders() });
    }
    return handleZodError(err);
  }
}

// OPTIONS: CORS preflight
export function OPTIONS() {
  return handleOptions();
}
