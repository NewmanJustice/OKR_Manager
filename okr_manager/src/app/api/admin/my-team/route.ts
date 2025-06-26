import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';
import prisma from '@/utils/prisma';

// GET: Get current admin's team
export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const team = await prisma.teamMembership.findMany({
    where: { adminId: session.id },
    include: { user: true },
  });
  return NextResponse.json(team.map((tm: any) => tm.user));
}
