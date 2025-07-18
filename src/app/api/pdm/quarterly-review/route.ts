import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { withCORSHeaders, handleOptions } from '@/utils/cors';

// GET: List or fetch a quarterly review
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user || !session.user.isLineManager) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const headers = withCORSHeaders(limiter.checkNext(req, 20));
    const { searchParams } = new URL(req.url);
    const quarter = searchParams.get('quarter');
    const year = searchParams.get('year');
    let response;
    if (quarter && year) {
      // Validate input
      const schema = z.object({
        quarter: z.string().regex(/^\d+$/),
        year: z.string().regex(/^\d+$/)
      });
      schema.parse({ quarter, year });
      const review = await prisma.quarterlyReview.findFirst({
        where: { pdm_id: session.user.id, quarter: Number(quarter), year: Number(year) },
      });
      response = review;
    } else {
      const reviews = await prisma.quarterlyReview.findMany({
        where: { pdm_id: session.user.id },
        orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
      });
      response = reviews;
    }
    return NextResponse.json(response, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: withCORSHeaders() });
    }
    return handleZodError(err);
  }
}

// POST: Create or update a quarterly review
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean } } | null;
  if (!session || !session.user || !session.user.isLineManager) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const headers = withCORSHeaders(limiter.checkNext(req, 20));
    const schema = z.object({
      quarter: z.number().int().min(1).max(4),
      year: z.number().int().min(2000).max(2100),
      okr_grading: z.string().max(1000).optional(),
      lessons_learned: z.string().max(2000).optional(),
      strategic_adjustments: z.string().max(2000).optional(),
      next_quarter_planning: z.string().max(2000).optional()
    });
    const body = schema.parse(await req.json());
    // Upsert: one review per user/quarter/year
    let review = await prisma.quarterlyReview.findFirst({
      where: { pdm_id: session.user.id, quarter: body.quarter, year: body.year },
    });
    if (review) {
      review = await prisma.quarterlyReview.update({
        where: { id: review.id },
        data: {
          okr_grading: body.okr_grading ?? '',
          lessons_learned: body.lessons_learned ?? '',
          strategic_adjustments: body.strategic_adjustments ?? '',
          next_quarter_planning: body.next_quarter_planning ?? ''
        },
      });
    } else {
      review = await prisma.quarterlyReview.create({
        data: {
          pdm_id: session.user.id,
          quarter: body.quarter,
          year: body.year,
          okr_grading: body.okr_grading ?? '',
          lessons_learned: body.lessons_learned ?? '',
          strategic_adjustments: body.strategic_adjustments ?? '',
          next_quarter_planning: body.next_quarter_planning ?? '',
          review_date: new Date(),
          stakeholder_feedback: '',
          submitted_at: new Date()
        },
      });
    }
    return NextResponse.json(review, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: withCORSHeaders() });
    }
    return handleZodError(err);
  }
}

// OPTIONS: CORS preflight
export function OPTIONS() {
  return handleOptions();
}
