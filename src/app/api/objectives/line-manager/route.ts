import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user's line manager
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { teamMemberOf: { include: { lineManager: true } } },
  });
  const lineManager = user?.teamMemberOf[0]?.lineManager;
  if (!lineManager) {
    return NextResponse.json({ objectives: [], lineManagerName: null });
  }

  // Fetch objectives, key results, and success criteria for the line manager
  const objectives = await prisma.objective.findMany({
    where: { userId: lineManager.id },
    include: {
      keyResults: {
        include: {
          successCriteria: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ objectives, lineManagerName: lineManager.name });
}
