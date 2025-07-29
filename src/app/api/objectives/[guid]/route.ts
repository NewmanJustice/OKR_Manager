import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Extract guid from the URL
  const url = new URL(req.url);
  const guid = url.pathname.split("/").filter(Boolean).pop();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!guid) {
    return NextResponse.json({ error: "Missing guid" }, { status: 400 });
  }
  const objective = await prisma.objective.findUnique({
    where: { guid },
    include: {
      keyResults: {
        include: {
          successCriteria: true
        }
      }
    }
  });
  if (!objective) {
    return NextResponse.json({ error: "Objective not found" }, { status: 404 });
  }
  // Only allow access if the objective belongs to the logged-in user
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || objective.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ objective });
}
