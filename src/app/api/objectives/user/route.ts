import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Fetch objectives for user, sorted by dueDate ascending
  const objectives = await prisma.objective.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
    select: {
      guid: true,
      title: true,
      dueDate: true,
      createdAt: true,
      keyResults: {
        select: {
          id: true,
          title: true,
          metric: true,
          targetValue: true,
          createdAt: true,
          successCriteria: {
            select: {
              id: true,
              description: true,
              threshold: true,
            },
          },
          reviews: {
            select: {
              id: true,
              month: true,
              year: true,
              progress: true,
              notes: true,
            },
          },
        },
      },
    },
  });
  return NextResponse.json({ objectives });
}
