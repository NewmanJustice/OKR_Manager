import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/auth/authOptions';

// DELETE /api/team/remove
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: number; isLineManager?: boolean };
  if (!user?.id || !user?.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  await prisma.lineManagerTeam.delete({
    where: { lineManagerId_userId: { lineManagerId: user.id, userId } },
  });
  return NextResponse.json({ success: true });
}
