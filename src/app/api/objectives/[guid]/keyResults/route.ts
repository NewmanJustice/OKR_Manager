import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest, context: any) {
  const { guid } = context.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title, metric, targetValue, successCriteria } = await req.json();
  if (!title || !metric || !targetValue) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // Find the objective by guid and user
  const objective = await prisma.objective.findFirst({
    where: {
      guid,
      user: { email: session.user.email },
    },
  });
  if (!objective) {
    return NextResponse.json({ error: "Objective not found" }, { status: 404 });
  }
  // Create the key result and its success criteria in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const keyResult = await tx.keyResult.create({
      data: {
        title,
        metric,
        targetValue,
        objectiveId: objective.id,
      },
    });
    if (Array.isArray(successCriteria) && successCriteria.length > 0) {
      await tx.successCriteria.createMany({
        data: successCriteria.filter(sc => sc.description && sc.threshold).map(sc => ({
          description: sc.description,
          threshold: sc.threshold,
          keyResultId: keyResult.id,
        })),
      });
    }
    return keyResult;
  });
  return NextResponse.json({ keyResult: result });
}
