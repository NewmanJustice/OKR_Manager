import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/team/search-users?query=foo
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';
  if (!query || query.length < 2) {
    return NextResponse.json({ users: [] });
  }
  const users = await prisma.user.findMany({
    where: {
      status: 'active',
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      jobRole: { select: { name: true } },
    },
    take: 10,
  });
  return NextResponse.json({ users });
}
