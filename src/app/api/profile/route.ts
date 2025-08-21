import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

// PATCH: Update the current user's profile (name, email, password, isLineManager, jobRoleId)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const body = await req.json();
  const { name, email, currentPassword, newPassword, isLineManager, jobRoleId } = body;
  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  // Prepare update data
  const updateData: any = { name, isLineManager };
  if (email && email !== user.email) updateData.email = email;
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);
  if (jobRoleId !== undefined && jobRoleId !== null && jobRoleId !== "") updateData.jobRoleId = parseInt(jobRoleId, 10);
  const updatedUser = await prisma.user.update({ where: { id: user.id }, data: updateData });
  // Fetch jobRole for response
  let jobRoleName = null;
  if (typeof updatedUser.jobRoleId === "number" && !isNaN(updatedUser.jobRoleId)) {
    const jobRole = await prisma.jobRole.findUnique({ where: { id: updatedUser.jobRoleId } });
    jobRoleName = jobRole?.name || null;
  }
  // If email changed, update session
  let sessionUpdate = false;
  if (email && email !== user.email) sessionUpdate = true;
  return NextResponse.json({ user: { name: updatedUser.name, email: updatedUser.email, isLineManager: updatedUser.isLineManager, jobRoleId: updatedUser.jobRoleId ?? null, jobRole: jobRoleName }, sessionUpdate });
}

// GET: Get the current user's profile (including jobRole)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  let jobRoleName = null;
  if (typeof user.jobRoleId === "number" && !isNaN(user.jobRoleId)) {
    const jobRole = await prisma.jobRole.findUnique({ where: { id: user.jobRoleId } });
    jobRoleName = jobRole?.name || null;
  }
  return NextResponse.json({ user: { name: user.name, email: user.email, isLineManager: user.isLineManager, jobRoleId: user.jobRoleId ?? null, jobRole: jobRoleName } });
}
