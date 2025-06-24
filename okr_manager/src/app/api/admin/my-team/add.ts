import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';
import prisma from '@/utils/prisma';

// POST: Add a user to the admin's team
export async function POST(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session || session.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  try {
    const membership = await prisma.teamMembership.create({
      data: { adminId: session.id, userId },
    });
    return NextResponse.json(membership);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
