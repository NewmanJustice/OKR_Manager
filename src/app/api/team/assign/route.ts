import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/auth/authOptions';

// POST /api/team/assign
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: number; isLineManager?: boolean };
  if (!user?.id || !user?.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  // Prevent duplicate assignment
  const exists = await prisma.lineManagerTeam.findUnique({
    where: { lineManagerId_userId: { lineManagerId: user.id, userId } },
  });
  if (exists) {
    return NextResponse.json({ error: 'User already assigned' }, { status: 400 });
  }
  await prisma.lineManagerTeam.create({
    data: {
      lineManagerId: user.id,
      userId,
    },
  });
  return NextResponse.json({ success: true });
}
