import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';
import prisma from '@/utils/prisma';

export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  // Fetch OKRs assigned to this user
  const assignments = await prisma.okrAssignment.findMany({
    where: { userId },
    include: {
      okr: {
        include: { key_results: true }
      }
    }
  });
  const objectives = assignments.map(a => a.okr);
  return NextResponse.json(objectives);
}
