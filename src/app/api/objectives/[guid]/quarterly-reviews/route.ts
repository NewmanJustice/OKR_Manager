import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";

// GET: List all quarterly reviews for an objective
export async function GET(req: NextRequest, context: any) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { guid } = params;
  const objective = await prisma.objective.findUnique({
    where: { guid },
    include: { quarterlyReviews: true, user: true },
  });
  if (!objective) return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || objective.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ quarterlyReviews: objective.quarterlyReviews });
}

// POST: Create or upsert a quarterly review for an objective
export async function POST(req: NextRequest, context: any) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { guid } = params;
  const body = await req.json();
  const { quarter, year, grading, lessonsLearned, strategicAdjustment, nextQuarterPlanning, engagement, actionCompletion, strategicAlignment, feedbackQuality } = body;
  const objective = await prisma.objective.findUnique({ where: { guid } });
  if (!objective) return NextResponse.json({ error: 'Objective not found' }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || objective.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const review = await prisma.objectiveQuarterlyReview.upsert({
    where: { objectiveId_quarter_year: { objectiveId: objective.id, quarter, year } },
    update: { grading, lessonsLearned, strategicAdjustment, nextQuarterPlanning, engagement, actionCompletion, strategicAlignment, feedbackQuality },
    create: { objectiveId: objective.id, quarter, year, grading, lessonsLearned, strategicAdjustment, nextQuarterPlanning, engagement, actionCompletion, strategicAlignment, feedbackQuality },
  });
  return NextResponse.json({ review });
}
