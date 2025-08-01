import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";

// GET: Get a single quarterly review
export async function GET(req: NextRequest, context: any) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = params;
  const review = await prisma.objectiveQuarterlyReview.findUnique({ where: { id: Number(id) }, include: { objective: true } });
  if (!review) return NextResponse.json({ error: 'Quarterly review not found' }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || review.objective.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ review });
}

// PUT: Update a quarterly review
export async function PUT(req: NextRequest, context: any) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = params;
  const review = await prisma.objectiveQuarterlyReview.findUnique({ where: { id: Number(id) }, include: { objective: true } });
  if (!review) return NextResponse.json({ error: 'Quarterly review not found' }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || review.objective.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const updated = await prisma.objectiveQuarterlyReview.update({
    where: { id: Number(id) },
    data: body,
  });
  return NextResponse.json({ review: updated });
}

// DELETE: Delete a quarterly review
export async function DELETE(req: NextRequest, context: any) {
  const params = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = params;
  const review = await prisma.objectiveQuarterlyReview.findUnique({ where: { id: Number(id) }, include: { objective: true } });
  if (!review) return NextResponse.json({ error: 'Quarterly review not found' }, { status: 404 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || review.objective.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.objectiveQuarterlyReview.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
