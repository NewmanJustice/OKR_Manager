import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';
import { sendVerifyEmail } from '@/utils/email';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8).max(100),
      name: z.string().min(1).max(100),
      roleId: z.union([z.string().regex(/^[0-9]+$/), z.number()]),
      captcha: z.string(),
    });
    const { email, password, name, roleId, captcha } = schema.parse(await req.json());
    // Verify hCaptcha token
    const hcaptchaSecret = process.env.HCAPTCHA_SECRET_KEY;
    const verifyRes = await fetch(
      "https://hcaptcha.com/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${hcaptchaSecret}&response=${captcha}`,
      }
    );
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: "CAPTCHA failed." }, { status: 400, headers });
    }
    // Prevent registering as admin by role name
    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400, headers });
    }
    if (role.name === 'Admin') {
      return NextResponse.json({ error: 'Cannot register as admin' }, { status: 403, headers });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409, headers });
    }
    const password_hash = await bcrypt.hash(password, 10);
    // Set isLineManager or isAdmin based on role
    const isLineManager = role.name === 'Principal Development Manager';
    const isAdmin = role.name === 'Admin';
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        name,
        roleId: Number(roleId),
        isLineManager,
        isAdmin,
        notify_preferences: {},
        isVerified: false,
        verifyToken,
      },
    });
    // Send verification email
    await sendVerifyEmail(user.email, verifyToken, user.name);
    // Do not set session cookie yet; require verification
    return NextResponse.json(
      { message: 'Registration successful. Please check your email to verify your account.' },
      { headers }
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
