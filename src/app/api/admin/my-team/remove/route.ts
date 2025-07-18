import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions as Record<string, unknown>)) as {
      user?: { id: number; isAdmin?: boolean };
    } | null;
    const user = session?.user;
    if (!session || !user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  try {
    await prisma.teamMembership.delete({
      where: { adminId_userId: { adminId: user.id, userId } },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 400 });
  }
}
