import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

// PATCH: Update the current user's profile (name, email, password, isLineManager)
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
  const { name, email, currentPassword, newPassword, isLineManager } = body;
  // Verify current password
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }
  // Prepare update data
  const updateData: any = { name, isLineManager };
  if (email && email !== user.email) updateData.email = email;
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 10);
  const updatedUser = await prisma.user.update({ where: { id: user.id }, data: updateData });
  // If email changed, update session
  let sessionUpdate = false;
  if (email && email !== user.email) sessionUpdate = true;
  return NextResponse.json({ user: { name: updatedUser.name, email: updatedUser.email, isLineManager: updatedUser.isLineManager }, sessionUpdate });
}
