import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import { limiter } from '../../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../../_middleware/handleZodError';

// GET: Fetch all success criteria for a key result
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const url = new URL(req.url);
  const idMatch = url.pathname.match(/key-result\/(\d+)\/success-criteria/);
  const keyResultId = idMatch ? Number(idMatch[1]) : NaN;
  if (isNaN(keyResultId)) {
    return NextResponse.json({ error: 'Invalid key result id' }, { status: 400 });
  }
  try {
    const criteria = await prisma.successCriteria.findMany({
      where: { key_result_id: keyResultId },
      select: { id: true, text: true },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ success_criteria: criteria });
  } catch {
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}

// POST: Add a new success criterion
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const url = new URL(req.url);
  const idMatch = url.pathname.match(/key-result\/(\d+)\/success-criteria/);
  const keyResultId = idMatch ? Number(idMatch[1]) : NaN;
  if (isNaN(keyResultId)) {
    return NextResponse.json({ error: 'Invalid key result id' }, { status: 400 });
  }
  try {
    const headers = limiter.checkNext(req, 20);
    const keyResult = await prisma.keyResult.findUnique({ where: { id: keyResultId }, select: { created_by_id: true } });
    if (!keyResult || (String(keyResult.created_by_id) !== String(session.user.id) && !session.user.isLineManager)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers });
    }
    const schema = z.object({ text: z.string().min(1).max(2000) });
    const { text } = schema.parse(await req.json());
    const created = await prisma.successCriteria.create({
      data: { key_result_id: keyResultId, text },
      select: { id: true, text: true },
    });
    return NextResponse.json(created, { headers });
  } catch (err) {
    return handleZodError(err);
  }
}

// PATCH: Edit a success criterion by id
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const url = new URL(req.url);
  const idMatch = url.pathname.match(/key-result\/(\d+)\/success-criteria/);
  const keyResultId = idMatch ? Number(idMatch[1]) : NaN;
  if (isNaN(keyResultId)) {
    return NextResponse.json({ error: 'Invalid key result id' }, { status: 400 });
  }
  try {
    const headers = limiter.checkNext(req, 20);
    const keyResult = await prisma.keyResult.findUnique({ where: { id: keyResultId }, select: { created_by_id: true } });
    if (!keyResult || (String(keyResult.created_by_id) !== String(session.user.id) && !session.user.isLineManager)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers });
    }
    const schema = z.object({ id: z.number(), text: z.string().min(1).max(2000) });
    const { id, text } = schema.parse(await req.json());
    const updated = await prisma.successCriteria.update({
      where: { id },
      data: { text },
      select: { id: true, text: true },
    });
    return NextResponse.json(updated, { headers });
  } catch (err) {
    return handleZodError(err);
  }
}

// DELETE: Remove a success criterion by id
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  const url = new URL(req.url);
  const idMatch = url.pathname.match(/key-result\/(\d+)\/success-criteria/);
  const keyResultId = idMatch ? Number(idMatch[1]) : NaN;
  if (isNaN(keyResultId)) {
    return NextResponse.json({ error: 'Invalid key result id' }, { status: 400 });
  }
  try {
    const headers = limiter.checkNext(req, 20);
    const keyResult = await prisma.keyResult.findUnique({ where: { id: keyResultId }, select: { created_by_id: true } });
    if (!keyResult || (String(keyResult.created_by_id) !== String(session.user.id) && !session.user.isLineManager)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers });
    }
    const schema = z.object({ id: z.number() });
    const { id } = schema.parse(await req.json());
    await prisma.successCriteria.delete({ where: { id } });
    return NextResponse.json({ success: true }, { headers });
  } catch (err) {
    return handleZodError(err);
  }
}
