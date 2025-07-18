import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

// Only allow authenticated users to access their own reviews
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number } } | null;
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get('year'));
  const quarter = searchParams.get('quarter') ? Number(searchParams.get('quarter')) : undefined;
  if (!year) {
    return NextResponse.json({ error: 'Year required' }, { status: 400 });
  }
  // If quarter is provided, fetch single review
  if (quarter) {
    const review = await prisma.quarterlyReview.findFirst({
      where: { user_id: session.user.id, year, quarter },
    });
    return NextResponse.json(review || {});
  }
  // Otherwise, fetch all reviews for the year
  const reviews = await prisma.quarterlyReview.findMany({
    where: { user_id: session.user.id, year },
    orderBy: { quarter: 'asc' },
  });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number } } | null;
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { quarter, year, okr_grading, lessons_learned, strategic_adjustments, next_quarter_planning } = body;
  if (!quarter || !year) {
    return NextResponse.json({ error: 'Quarter and year required' }, { status: 400 });
  }
  // Upsert review for user
  const review = await prisma.quarterlyReview.upsert({
    where: {
      user_id_quarter_year: {
        user_id: Number(userId),
        quarter,
        year,
      },
    },
    update: {
      okr_grading,
      lessons_learned,
      strategic_adjustments,
      next_quarter_planning,
      submitted_at: new Date(),
    },
    create: {
      user_id: Number(userId),
      quarter,
      year,
      okr_grading,
      lessons_learned,
      strategic_adjustments,
      next_quarter_planning,
      submitted_at: new Date(),
    },
  });
  return NextResponse.json(review);
}
