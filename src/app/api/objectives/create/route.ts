import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await req.json();
  // Validate required fields
  if (!data.title || !data.dueDate || !Array.isArray(data.keyResults) || data.keyResults.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  // Validate key results and success criteria
  for (const kr of data.keyResults) {
    if (!kr.title || !kr.metric || !kr.targetValue || !Array.isArray(kr.successCriteria) || kr.successCriteria.length === 0) {
      return NextResponse.json({ error: "Each key result must have title, metric, targetValue, and at least one success criteria" }, { status: 400 });
    }
    for (const sc of kr.successCriteria) {
      if (!sc.description || !sc.threshold) {
        return NextResponse.json({ error: "Each success criteria must have description and threshold" }, { status: 400 });
      }
    }
  }
  // Find user by id (preferred), fallback to email for legacy sessions
  const userId = session.user && (session.user as any).id;
  let user = null;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  } else if (session.user?.email) {
    user = await prisma.user.findUnique({ where: { email: session.user.email } });
  }
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Create objective with nested key results and success criteria
  const objective = await prisma.objective.create({
    data: {
      title: data.title,
      description: data.description || "",
      dueDate: new Date(data.dueDate),
      userId: user.id,
      keyResults: {
        create: data.keyResults.map((kr: any) => ({
          title: kr.title,
          metric: kr.metric,
          targetValue: kr.targetValue,
          successCriteria: {
            create: kr.successCriteria.map((sc: any) => ({
              description: sc.description,
              threshold: sc.threshold,
            })),
          },
        })),
      },
    },
  });
  return NextResponse.json({ id: objective.id });
}
