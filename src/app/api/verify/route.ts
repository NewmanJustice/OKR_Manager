import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ message: "Invalid verification link." }, { status: 400 });
  }
  // Find token
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ message: "Verification link expired or invalid." }, { status: 400 });
  }
  // Update user status
  await prisma.user.update({
    where: { id: record.userId },
    data: { status: "active" },
  });
  // Delete token
  await prisma.verificationToken.delete({ where: { token } });
  return NextResponse.json({ message: "Account verified successfully." }, { status: 200 });
}
