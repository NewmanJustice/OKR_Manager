import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { limiter } from '../_middleware/rateLimit';
import { handleZodError } from '../_middleware/handleZodError';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const headers = limiter.checkNext(req, 20);
    // NextAuth uses its own signOut and session cookie management
    // Just return ok, let client call signOut from next-auth/react
    return NextResponse.json({ ok: true }, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
