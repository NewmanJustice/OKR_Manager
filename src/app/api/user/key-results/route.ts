import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET: List key results for a user's objective
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const objectiveId = Number(req.nextUrl.searchParams.get('objectiveId'));
  if (!objectiveId) return NextResponse.json({ error: 'Missing objectiveId' }, { status: 400 });
  const keyResults = await prisma.keyResult.findMany({
    where: { objective_id: objectiveId, created_by_id: userId },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(keyResults);
}

// POST: Create a new key result
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const { objectiveId, title, description } = await req.json();
  if (!objectiveId || !title) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  const keyResult = await prisma.keyResult.create({
    data: {
      objective_id: objectiveId,
      title,
      description: description ?? '',
      status: 'Not Started',
      created_by_id: userId,
    },
  });
  return NextResponse.json(keyResult);
}

// PUT: Update a key result
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const { id, title, description, status } = await req.json();
  if (!id || !title) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  const updated = await prisma.keyResult.update({
    where: { id, created_by_id: userId },
    data: { title, description, status },
  });
  return NextResponse.json(updated);
}

// DELETE: Hard delete a key result
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await prisma.keyResult.delete({ where: { id, created_by_id: userId } });
  return NextResponse.json({ success: true });
}
