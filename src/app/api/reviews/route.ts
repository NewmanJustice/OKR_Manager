import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: List all reviews for the current user (optionally filter by objectiveId, period, isDraft)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const objectiveId = url.searchParams.get("objectiveId");
  const period = url.searchParams.get("period");
  const isDraft = url.searchParams.get("isDraft");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const where: any = { userId: user.id };
  if (objectiveId) where.objectiveId = Number(objectiveId);
  if (period) where.period = period;
  if (isDraft !== null) where.isDraft = isDraft === "true";
  const reviews = await prisma.keyResultReview.findMany({
    where,
    include: {
      keyResult: true,
    },
    orderBy: { id: "desc" },
  });
  return NextResponse.json({ reviews });
}

// POST: Create a new key result review
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const data = await req.json();
  // data: { keyResultId, month, year, progress, notes }
  if (!data.keyResultId || !data.month || !data.year) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const review = await prisma.keyResultReview.create({
    data: {
      keyResultId: data.keyResultId,
      month: data.month,
      year: data.year,
      progress: data.progress ?? 0,
      notes: data.notes,
    },
    include: { keyResult: true },
  });
  return NextResponse.json({ review });
}

export {};
