import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const schema = z.object({
      id: z.union([z.string().regex(/^\d+$/), z.number()]),
    });
    const { id } = schema.parse(await req.json());
    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true }, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
