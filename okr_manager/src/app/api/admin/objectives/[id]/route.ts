import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { title, description, quarter, year, pdm_id, keyResults } = await req.json();
  if (!title || !quarter || !year) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const objective = await prisma.objective.update({
    where: { id },
    data: {
      title,
      description,
      quarter,
      year,
      pdm_id,
      key_results: {
        deleteMany: {},
        create: keyResults || [],
      },
    },
    include: { key_results: true },
  });
  return NextResponse.json(objective);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.keyResult.deleteMany({ where: { objective_id: id } });
  await prisma.objective.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
