import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a single key result review (with related key result)
export async function GET(req: Request) {
  // Extract id from the URL
  const url = new URL(req.url);
  const idStr = url.pathname.split("/").filter(Boolean).pop();
  const reviewId = Number(idStr);

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const review = await prisma.keyResultReview.findUnique({
    where: { id: reviewId },
    include: {
      keyResult: true,
    },
  });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // No userId on KeyResultReview, so just return the review
  return NextResponse.json({ review });
}

// PATCH: Update a key result review
export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const idStr = url.pathname.split("/").filter(Boolean).pop();
  const reviewId = Number(idStr);

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const review = await prisma.keyResultReview.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data = await req.json();
  // Only allow updating allowed fields
  const updateData: any = {};
  ["progress", "notes", "month", "year"].forEach(field => {
    if (field in data) updateData[field] = data[field];
  });
  const updated = await prisma.keyResultReview.update({
    where: { id: reviewId },
    data: updateData,
    include: { keyResult: true },
  });
  return NextResponse.json({ review: updated });
}

// DELETE: Delete a key result review
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const idStr = url.pathname.split("/").filter(Boolean).pop();
  const reviewId = Number(idStr);

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const review = await prisma.keyResultReview.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.keyResultReview.delete({ where: { id: reviewId } });
  return NextResponse.json({ success: true });
}

export {};
