import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getSessionUserFromRequest } from '@/utils/session';

// PATCH: Update success_criteria for a key result
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUserFromRequest(req);
  if (!session || !session.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const keyResultId = Number(params.id);
  const { success_criteria } = await req.json();
  if (!success_criteria) {
    return NextResponse.json({ error: 'Missing success_criteria' }, { status: 400 });
  }
  try {
    const updated = await prisma.keyResult.update({
      where: { id: keyResultId },
      data: { success_criteria },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: Remove success_criteria for a key result
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUserFromRequest(req);
  if (!session || !session.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const keyResultId = Number(params.id);
  try {
    const updated = await prisma.keyResult.update({
      where: { id: keyResultId },
      data: { success_criteria: null },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET: Fetch success_criteria for a key result (public)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const keyResultId = Number(params.id);
  try {
    const keyResult = await prisma.keyResult.findUnique({
      where: { id: keyResultId },
      select: { success_criteria: true },
    });
    if (!keyResult) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(keyResult);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
