import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSessionUserFromCookies } from '../../../../utils/session';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const objectives = await prisma.objective.findMany({
      include: { key_results: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(objectives, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const { z } = await import('zod');
    const schema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      quarter: z.number().int().min(1).max(4),
      year: z.number().int().min(2000).max(2100),
      pdm_id: z.union([z.string().regex(/^\d+$/), z.number()]),
      keyResults: z.array(z.object({
        text: z.string().min(1).max(1000).optional(),
        title: z.string().min(1).max(1000).optional()
      }))
    });
    const { title, description, quarter, year, pdm_id, keyResults } = schema.parse(await req.json());
    console.log('POST /api/admin/objectives', { title, description, quarter, year, pdm_id, keyResults });
    if (!title || !quarter || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Get session for created_by_id
    const session = await getSessionUserFromCookies();
    if (!session?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers });
    }
    // Validate key results
    const validKeyResults = (keyResults || []).filter((kr) => (kr.text || kr.title || '').trim() !== '');
    if (validKeyResults.length === 0) {
      return NextResponse.json({ error: 'At least one key result is required and must not be empty.' }, { status: 400, headers });
    }
    // Calculate next objective_number for the year/quarter
    const lastObj = await prisma.objective.findFirst({
      where: { year, quarter },
      orderBy: { objective_number: 'desc' },
    });
    const nextObjectiveNumber = lastObj ? lastObj.objective_number + 1 : 1;
    const objective = await prisma.objective.create({
      data: {
        title,
        description: description ?? '',
        quarter,
        year,
        pdm_id: Number(pdm_id),
        objective_number: nextObjectiveNumber,
        created_by_id: session.id,
        key_results: {
          create: validKeyResults.map((kr) => ({
            title: kr.title ?? kr.text ?? '',
            description: '',
            status: 'Not Started',
            created_by: { connect: { id: session.id } },
            text: kr.text ?? kr.title ?? '',
          })),
        },
      },
    });
    return NextResponse.json(objective, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
