import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getSessionUserFromRequest } from '@/utils/session';

// GET: List or fetch a quarterly review
export async function GET(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const quarter = Number(searchParams.get('quarter'));
  const year = Number(searchParams.get('year'));
  // If quarter/year provided, fetch single review, else list all for user
  if (quarter && year) {
    const review = await prisma.quarterlyReview.findFirst({
      where: { pdm_id: user.id, quarter, year },
    });
    return NextResponse.json(review);
  } else {
    const reviews = await prisma.quarterlyReview.findMany({
      where: { pdm_id: user.id },
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
    });
    return NextResponse.json(reviews);
  }
}

// POST: Create or update a quarterly review
export async function POST(req: NextRequest) {
  const user = await getSessionUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { quarter, year, okr_grading, lessons_learned, strategic_adjustments, next_quarter_planning } = body;
  // Upsert: one review per user/quarter/year
  let review = await prisma.quarterlyReview.findFirst({
    where: { pdm_id: user.id, quarter, year },
  });
  if (review) {
    review = await prisma.quarterlyReview.update({
      where: { id: review.id },
      data: { okr_grading, lessons_learned, strategic_adjustments, next_quarter_planning },
    });
  } else {
    review = await prisma.quarterlyReview.create({
      data: {
        pdm_id: user.id,
        review_date: new Date(),
        quarter,
        year,
        okr_grading,
        lessons_learned,
        strategic_adjustments,
        next_quarter_planning,
        stakeholder_feedback: '',
        submitted_at: new Date(),
      },
    });
  }
  return NextResponse.json(review);
}
