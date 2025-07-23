import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";
import { rateLimit } from "../../_middleware/rateLimit";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  if (!rateLimit(req)) {
    return NextResponse.json({ message: "Too many requests. Please try again later." }, { status: 429 });
  }
  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
  // Find token record
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return NextResponse.json({ message: "Verification token not found." }, { status: 404 });
  }
  // Find user
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }
  // Generate new token
  const newToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
  await prisma.verificationToken.delete({ where: { token } });
  await prisma.verificationToken.create({
    data: {
      token: newToken,
      userId: user.id,
      expiresAt,
    },
  });
  await sendVerificationEmail(user.name, user.email, newToken);
  return NextResponse.json({ message: "Verification email resent." }, { status: 200 });
}
