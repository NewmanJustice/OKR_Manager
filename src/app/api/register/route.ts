import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "../_middleware/rateLimit";
import crypto from "crypto";
import { sendVerificationEmail } from "@/utils/sendVerificationEmail";

async function verifyCaptcha(token: string): Promise<boolean> {
  const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
  if (!hcaptchaSecret) return false;
  const res = await fetch("https://hcaptcha.com/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${hcaptchaSecret}&response=${token}`,
  });
  const data = await res.json();
  return !!data.success;
}

export async function POST(req: Request) {
  // Rate limiting: max 5 requests per IP per 10 minutes
  if (!rateLimit(req)) {
    return NextResponse.json({ message: "Too many registration attempts. Please try again later." }, { status: 429 });
  }
  try {
    const { name, email, password, role, captchaToken } = await req.json();
    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address." }, { status: 400 });
    }
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return NextResponse.json({ message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character." }, { status: 400 });
    }
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email already registered." }, { status: 409 });
    }
     // Validate captcha
    if (!captchaToken || !(await verifyCaptcha(captchaToken))) {
      return NextResponse.json({ message: "CAPTCHA validation failed." }, { status: 400 });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user (status: pending verification)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "pending",
      },
    });
    // Generate and persist verification token
    const verificationToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours expiry
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt,
      },
    });
    // Send verification email
    await sendVerificationEmail(name,email, verificationToken);
    return NextResponse.json({ message: "Registration successful. Please check your email to verify your account." }, { status: 201 });
  } catch (err: any) {
    console.error("Registration API error:", err);
    return NextResponse.json({ message: err?.message || "Registration failed. Please try again." }, { status: 500 });
  }
}
