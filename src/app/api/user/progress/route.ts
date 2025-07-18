import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';
import { NextRequest, NextResponse } from "next/server";
import prisma from '@/utils/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { withCORSHeaders, handleOptions } from '@/utils/cors';

// POST: Save or update progress for a key result (monthly)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const headers = withCORSHeaders(limiter.checkNext(req, 20));
    // Debug: return session user id
    if (req.headers.get('x-debug-session') === 'true') {
      return NextResponse.json({ debugUserId: session.user.id }, { headers });
    }
    const schema = z.object({
      key_result_id: z.union([z.string().regex(/^[\d]+$/), z.number()]),
      status: z.string().min(1).max(50),
      metric_value: z.number().nullable().optional(),
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
        user_id: Number(session.user.id),
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
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const keyResultIdsRaw = searchParams.get('keyResultIds') || '';
  // Validate keyResultIds using Zod
  const keyResultIdsSchema = z.array(z.number().int().positive());
  let keyResultIds: number[] = [];
  try {
    keyResultIds = keyResultIdsRaw.split(',').map((id) => {
      const num = Number(id);
      if (!Number.isInteger(num) || num <= 0) throw new Error('Invalid keyResultId');
      return num;
    });
    keyResultIdsSchema.parse(keyResultIds);
  } catch (_err) {
    return NextResponse.json({ error: 'Invalid keyResultIds parameter' }, { status: 400 });
  }
  // If month and year are provided, filter by them, else return all months/years
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  if (!keyResultIds.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const where: Record<string, unknown> = {
      key_result_id: { in: keyResultIds },
      user_id: Number(userId), // Ensure user_id is an integer
    };
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    const progressArr = await prisma.keyResultProgress.findMany({
      where,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    return NextResponse.json(progressArr, { headers: withCORSHeaders() });
  } catch (err) {
    // Log error for debugging
    console.error('Error fetching user progress:', err);
    return NextResponse.json({ error: 'Unexpected error', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// OPTIONS: CORS preflight
export function OPTIONS() {
  return handleOptions();
}
