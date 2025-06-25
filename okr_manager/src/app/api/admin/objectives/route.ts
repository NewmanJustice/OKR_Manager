import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSessionUserFromCookies } from '../../../../utils/session';

const prisma = new PrismaClient();

export async function GET() {
  const objectives = await prisma.objective.findMany({
    include: { key_results: true },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(objectives);
}

export async function POST(req: NextRequest) {
  const { title, description, quarter, year, pdm_id, keyResults } = await req.json();
  console.log('POST /api/admin/objectives', { title, description, quarter, year, pdm_id, keyResults });
  if (!title || !quarter || !year) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  // Get session for created_by_id
  const session = await getSessionUserFromCookies();
  if (!session?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  // Validate key results
  const validKeyResults = (keyResults || []).filter((kr: any) => (kr.text || kr.title || '').trim() !== '');
  if (validKeyResults.length === 0) {
    return NextResponse.json({ error: 'At least one key result is required and must not be empty.' }, { status: 400 });
  }
  // Calculate next objective_number for the year/quarter
  const lastObj = await prisma.objective.findFirst({
    where: { year, quarter },
    orderBy: { objective_number: 'desc' },
  });
  const nextObjectiveNumber = lastObj ? lastObj.objective_number + 1 : 1;
  try {
    const objective = await prisma.objective.create({
      data: {
        title,
        description,
        quarter,
        year,
        pdm_id,
        created_by_id: session.id,
        objective_number: nextObjectiveNumber,
        key_results: {
          create: validKeyResults.map((kr: any) => ({
            title: kr.title || kr.text || '',
            description: kr.description || '',
            status: kr.status || 'Not Started',
            created_by_id: session.id,
          })),
        },
      },
      include: { key_results: true },
    });
    return NextResponse.json(objective);
  } catch (err) {
    console.error('Prisma create error:', err);
    return NextResponse.json({ error: 'Prisma error', details: String(err) }, { status: 500 });
  }
}
