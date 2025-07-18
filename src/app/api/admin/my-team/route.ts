import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import prisma from '@/utils/prisma';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';

// GET: Get current admin's team
export async function GET(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const session = (await getServerSession(authOptions as Record<string, unknown>)) as {
      user?: { id: number; isAdmin?: boolean };
    } | null;
    const user = session?.user;
    if (!session || !user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const team = await prisma.teamMembership.findMany({
      where: { adminId: user.id },
      include: { user: true },
    });
    return NextResponse.json(team.map((tm: { user: typeof team[0]["user"] }) => tm.user), { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
