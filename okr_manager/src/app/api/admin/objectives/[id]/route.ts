import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { title, description, quarter, year, pdm_id, keyResults } = await req.json();
    if (!title || !quarter || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Update the objective
    const updatedObjective = await prisma.objective.update({
      where: { id },
      data: {
        title,
        description,
        quarter,
        year,
        pdm_id,
      },
    });
    // Delete removed key results
    await prisma.keyResult.deleteMany({
      where: {
        objective_id: id,
        id: { notIn: (keyResults || []).filter((kr: any) => kr.id).map((kr: any) => kr.id) },
      },
    });
    // Upsert key results
    for (const kr of keyResults || []) {
      if (kr.id) {
        await prisma.keyResult.update({
          where: { id: kr.id },
          data: {
            title: kr.title || kr.text || '',
            description: kr.description || '',
            status: kr.status || 'Not Started',
          },
        });
      } else {
        await prisma.keyResult.create({
          data: {
            title: kr.title || kr.text || '',
            description: kr.description || '',
            status: kr.status || 'Not Started',
            objective_id: id,
            created_by_id: kr.created_by_id || 1, // fallback, ideally use session
          },
        });
      }
    }
    // Return updated objective with key results
    const objectiveWithKRs = await prisma.objective.findUnique({
      where: { id },
      include: { key_results: true },
    });
    return NextResponse.json(objectiveWithKRs);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update objective', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    // Delete related key results first
    await prisma.keyResult.deleteMany({ where: { objective_id: id } });
    // Delete assignments (if any)
    await prisma.okrAssignment.deleteMany({ where: { okrId: id } });
    // Delete the objective
    await prisma.objective.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete objective', details: String(err) }, { status: 500 });
  }
}
