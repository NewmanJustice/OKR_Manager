import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";

// Helper to check line manager
async function getLineManagerSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isLineManager) return null;
  return session;
}

export async function GET(req: Request) {
  const session = await getLineManagerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Get all job role descriptions for this manager's team
  const descriptions = await prisma.jobRoleDescription.findMany({
    where: { managerId: (session.user as any).id },
    include: { jobRole: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ descriptions });
}

export async function POST(req: Request) {
  const session = await getLineManagerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { jobRoleId, content } = body;
  if (!jobRoleId || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  // Validate jobRoleId exists
  const jobRole = await prisma.jobRole.findUnique({ where: { id: jobRoleId } });
  if (!jobRole) return NextResponse.json({ error: "Job role not found" }, { status: 404 });
  const description = await prisma.jobRoleDescription.create({
    data: {
      jobRoleId,
      managerId: (session.user as any).id,
      content,
    },
  });
  return NextResponse.json({ description });
}

export async function PUT(req: Request) {
  const session = await getLineManagerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, content } = body;
  if (!id || typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  // Validate description exists and belongs to manager
  const description = await prisma.jobRoleDescription.findUnique({ where: { id } });
  if (!description || description.managerId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }
  const updated = await prisma.jobRoleDescription.update({
    where: { id },
    data: { content },
  });
  return NextResponse.json({ description: updated });
}

export async function DELETE(req: Request) {
  const session = await getLineManagerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  // Validate description exists and belongs to manager
  const description = await prisma.jobRoleDescription.findUnique({ where: { id } });
  if (!description || description.managerId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  }
  await prisma.jobRoleDescription.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
