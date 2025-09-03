import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/auth/authOptions';

// GET /api/team/list
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: number; isLineManager?: boolean };
  if (!user?.id || !user?.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const team = await prisma.lineManagerTeam.findMany({
    where: { lineManagerId: user.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          jobRole: { select: { name: true } },
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });
  return NextResponse.json({ team });
}
