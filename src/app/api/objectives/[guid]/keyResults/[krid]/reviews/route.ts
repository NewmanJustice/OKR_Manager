import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";

// Helper to extract params from URL
function extractParamsFromUrl(url: string) {
  // /api/objectives/[guid]/keyResults/[krid]/reviews
  const match = url.match(/objectives\/([^/]+)\/keyResults\/([^/]+)\/reviews/);
  return match ? { guid: match[1], krid: match[2] } : { guid: undefined, krid: undefined };
}

// POST: Create or update a review for a key result and month
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { month, year, progress, notes } = await req.json();
  if (!month || !year) {
    return NextResponse.json({ error: "Month and year required" }, { status: 400 });
  }
  const { krid } = extractParamsFromUrl(req.url);
  if (!krid) {
    return NextResponse.json({ error: "KeyResult ID missing in URL" }, { status: 400 });
  }
  const keyResultId = parseInt(krid, 10);
  try {
    const review = await prisma.keyResultReview.upsert({
      where: { keyResultId_month_year: { keyResultId, month, year } },
      update: { progress, notes },
      create: { keyResultId, month, year, progress, notes },
    });
    return NextResponse.json({ review });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}

// DELETE: Delete a review for a key result and month
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { month, year } = await req.json();
  if (!month || !year) {
    return NextResponse.json({ error: "Month and year required" }, { status: 400 });
  }
  const { krid } = extractParamsFromUrl(req.url);
  if (!krid) {
    return NextResponse.json({ error: "KeyResult ID missing in URL" }, { status: 400 });
  }
  const keyResultId = parseInt(krid, 10);
  try {
    await prisma.keyResultReview.delete({
      where: { keyResultId_month_year: { keyResultId, month, year } },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
