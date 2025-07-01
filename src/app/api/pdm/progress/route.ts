import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getSessionUserFromRequest } from '@/utils/session';
import { withCORSHeaders, handleOptions } from '@/utils/cors';

// POST: Save or update progress for a key result (monthly)
export async function POST(req: NextRequest) {
  try {
    const headers = withCORSHeaders(limiter.checkNext(req, 20));
    const session = await getSessionUserFromRequest(req);
    if (!session || !session.isLineManager) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }
    // Debug: return session user id
    if (req.headers.get('x-debug-session') === 'true') {
      return NextResponse.json({ debugUserId: session.id }, { headers });
    }
    const schema = z.object({
      key_result_id: z.union([z.string().regex(/^\d+$/), z.number()]),
      status: z.string().min(1).max(50),
      metric_value: z.number().optional(),
      evidence: z.string().max(2000).optional(),
      comments: z.string().max(2000).optional(),
      blockers: z.string().max(2000).optional(),
      resources_needed: z.string().max(2000).optional(),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(2000).max(2100)
    });
    const { key_result_id, status, metric_value, evidence, comments, blockers, resources_needed, month, year } = schema.parse(await req.json());
    const progress = await prisma.keyResultProgress.create({
      data: {
        key_result_id: Number(key_result_id),
        user_id: session.id,
        month,
        year,
        status,
        metric_value: metric_value ?? 0,
        evidence: evidence ?? '',
        comments: comments ?? '',
        blockers: blockers ?? '',
        resources_needed: resources_needed ?? ''
      },
    });
    return NextResponse.json(progress, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: withCORSHeaders() });
    }
    return handleZodError(err);
  }
}

// GET: Fetch progress for key results for the current user and month/year
export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session || !session.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: withCORSHeaders() });
  }
  const { searchParams } = new URL(req.url);
  const keyResultIds = (searchParams.get('keyResultIds') || '').split(',').map(Number).filter(Boolean);
  // If month and year are provided, filter by them, else return all months/years
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  if (!keyResultIds.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: withCORSHeaders() });
  }
  try {
    const where: Record<string, unknown> = {
      key_result_id: { in: keyResultIds },
      user_id: session.id,
    };
    if (month && year) {
      where.month = Number(month);
      where.year = Number(year);
    }
    const progressArr = await prisma.keyResultProgress.findMany({
      where,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    return NextResponse.json(progressArr, { headers: withCORSHeaders() });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 500, headers: withCORSHeaders() });
  }
}

// OPTIONS: CORS preflight
export function OPTIONS() {
  return handleOptions();
}
