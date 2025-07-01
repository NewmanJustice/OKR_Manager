import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { limiter } from '../_middleware/rateLimit';
import { handleZodError } from '../_middleware/handleZodError';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const roles = await prisma.role.findMany({
      where: { name: { not: 'Admin' } },
      select: { id: true, name: true, description: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(roles, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
