import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());
    let { title, description, quarter, year, pdm_id, professionId, keyResults } = await req.json();
    if (!title || !quarter || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Coerce professionId to number if present and not null
    if (professionId !== undefined && professionId !== null && professionId !== '') {
      professionId = Number(professionId);
      if (isNaN(professionId)) professionId = undefined;
    } else {
      professionId = undefined;
    }
    // Prepare key result operations
    const existingKRs = (keyResults || []).filter((kr: { id?: number }) => kr.id);
    const newKRs = (keyResults || []).filter((kr: { id?: number }) => !kr.id);
    const existingKRIds = existingKRs.map((kr: { id: number }) => kr.id);
    // Build key_results update object
    const keyResultsUpdate: any = {
      updateMany: existingKRs.map((kr: any) => ({
        where: { id: kr.id },
        data: {
          title: kr.title || kr.text || '',
          description: kr.description || '',
          status: kr.status || 'Not Started',
        },
      })),
      create: newKRs.map((kr: any) => ({
        title: kr.title || kr.text || '',
        description: kr.description || '',
        status: kr.status || 'Not Started',
        created_by_id: kr.created_by_id, // must be provided
      })),
    };
    // Only add deleteMany if there are existing key results
    if (existingKRIds.length > 0) {
      keyResultsUpdate.deleteMany = {
        id: { notIn: existingKRIds },
        objective_id: id,
      };
    }
    // Use a transaction for atomicity
    const [updatedObjective] = await prisma.$transaction([
      prisma.objective.update({
        where: { id },
        data: {
          title,
          description,
          quarter,
          year,
          pdm_id,
          professionId,
          key_results: keyResultsUpdate,
        },
        include: { key_results: true },
      }),
    ]);

    return NextResponse.json(updatedObjective);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update objective', details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());
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
