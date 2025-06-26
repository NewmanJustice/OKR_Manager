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
      email: z.string().email(),
      name: z.string().min(1).max(100),
    });
    const { id, email, name } = schema.parse(await req.json());
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data: { email, name },
    });
    return NextResponse.json(
      { id: updated.id, email: updated.email, name: updated.name },
      { headers }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
