import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

interface KeyResultInput {
  id?: number;
  title: string;
  description?: string;
  status?: string;
  created_by_id?: number;
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = Number(url.pathname.split('/').pop());
    const { title, description, quarter, year, pdm_id, professionId, keyResults }: {
      title: string;
      description: string;
      quarter: number;
      year: number;
      pdm_id?: number;
      professionId?: number | string;
      keyResults: KeyResultInput[];
    } = await req.json();
    if (!title || !quarter || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Coerce professionId to number if present and not null
    let finalProfessionId: number | undefined = undefined;
    if (professionId !== undefined && professionId !== null && professionId !== '') {
      const num = Number(professionId);
      if (!isNaN(num)) finalProfessionId = num;
    }
    // Prepare key result operations
    const existingKRs: KeyResultInput[] = (keyResults || []).filter((kr) => kr.id !== undefined);
    const newKRs: KeyResultInput[] = (keyResults || []).filter((kr) => kr.id === undefined);
    const existingKRIds: number[] = existingKRs.map((kr) => kr.id as number);
    // Build key_results update object
    const keyResultsUpdate: Record<string, unknown> = {
      updateMany: existingKRs.map((kr) => ({
        where: { id: kr.id },
        data: {
          title: kr.title,
          description: kr.description || '',
          status: kr.status || 'Not Started',
        },
      })),
      create: newKRs.map((kr) => ({
        title: kr.title,
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
          professionId: finalProfessionId,
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
