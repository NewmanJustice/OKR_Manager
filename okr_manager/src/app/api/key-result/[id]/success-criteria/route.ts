import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getSessionUserFromRequest } from '@/utils/session';
import { limiter } from '../../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../../_middleware/handleZodError';

// PATCH: Update success_criteria for a key result
export async function PATCH(req: NextRequest) {
  // Extract id from the URL pathname
  const url = new URL(req.url);
  const idMatch = url.pathname.match(/key-result\/(\d+)\/success-criteria/);
  const keyResultId = idMatch ? Number(idMatch[1]) : NaN;
  if (isNaN(keyResultId)) {
    return NextResponse.json({ error: 'Invalid key result id' }, { status: 400 });
  }
  try {
    const headers = limiter.checkNext(req, 20);
    const session = await getSessionUserFromRequest(req);
    if (!session || !session.isLineManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }
    const schema = z.object({ success_criteria: z.string().min(1).max(2000) });
    const { success_criteria } = schema.parse(await req.json());
    const updated = await prisma.keyResult.update({
      where: { id: keyResultId },
      data: { success_criteria },
    });
    return NextResponse.json(updated, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}

// DELETE: Remove success_criteria for a key result
export async function DELETE(req: NextRequest) {
  // Extract id from the URL pathname
  const url = new URL(req.url);
  const idMatch = url.pathname.match(/key-result\/(\d+)\/success-criteria/);
  const keyResultId = idMatch ? Number(idMatch[1]) : NaN;
  if (isNaN(keyResultId)) {
    return NextResponse.json({ error: 'Invalid key result id' }, { status: 400 });
  }
  try {
    const headers = limiter.checkNext(req, 20);
    const session = await getSessionUserFromRequest(req);
    if (!session || !session.isLineManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }
    const updated = await prisma.keyResult.update({
      where: { id: keyResultId },
      data: { success_criteria: null },
    });
    return NextResponse.json(updated, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}

// GET: Fetch success_criteria for a key result (public)
export async function GET(req: NextRequest) {
  // Extract id from the URL pathname
  const url = new URL(req.url);
  const idMatch = url.pathname.match(/key-result\/(\d+)\/success-criteria/);
  const keyResultId = idMatch ? Number(idMatch[1]) : NaN;
  if (isNaN(keyResultId)) {
    return NextResponse.json({ error: 'Invalid key result id' }, { status: 400 });
  }
  try {
    const keyResult = await prisma.keyResult.findUnique({
      where: { id: keyResultId },
      select: { success_criteria: true },
    });
    if (!keyResult) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(keyResult);
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
