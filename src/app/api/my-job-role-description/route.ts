import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const jobRoleId = (session?.user as any)?.jobRoleId;
  if (!userId || !jobRoleId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Find line manager for this user
  const teamRow = await prisma.lineManagerTeam.findFirst({
    where: { userId },
    select: { lineManagerId: true }
  });
  if (!teamRow || !teamRow.lineManagerId) {
    return NextResponse.json({ description: null });
  }
  // Find job role description for user's jobRoleId and lineManagerId
  const description = await prisma.jobRoleDescription.findFirst({
    where: {
      jobRoleId,
      managerId: teamRow.lineManagerId
    },
    include: { jobRole: true }
  });
  return NextResponse.json({ description: description || null });
}
