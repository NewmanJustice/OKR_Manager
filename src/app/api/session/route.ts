import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import { limiter } from '../_middleware/rateLimit';
import { handleZodError } from '../_middleware/handleZodError';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  const headers = limiter.checkNext(req, 20);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json({ user: session.user }, { status: 200, headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}

/*
export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Handle your POST request logic here, using session.user as needed

  return NextResponse.json({ message: 'Success' }, { status: 200 });

}
*/
