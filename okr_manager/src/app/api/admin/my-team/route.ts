import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';
import prisma from '@/utils/prisma';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';

// GET: Get current admin's team
export async function GET(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const session = await getSessionUserFromRequest(req);
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }
    const team = await prisma.teamMembership.findMany({
      where: { adminId: session.id },
      include: { user: true },
    });
    return NextResponse.json(team.map((tm) => tm.user), { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
