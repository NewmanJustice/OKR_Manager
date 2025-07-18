import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/utils/prisma';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';
import { withCORSHeaders, handleOptions } from '@/utils/cors';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number } } | null;
  const headers = withCORSHeaders(limiter.checkNext(req, 20));
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401, headers });
  }
  try {
    const userId = typeof session.user.id === 'string' ? parseInt(session.user.id, 10) : session.user.id;
    // Fetch OKRs assigned to this user
    const assignments = await prisma.okrAssignment.findMany({
      where: { userId },
      include: {
        okr: {
          include: { key_results: true }
        }
      }
    });
    const objectives = assignments.map((a: typeof assignments[0]) => a.okr);
    return NextResponse.json(objectives, { headers });
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
