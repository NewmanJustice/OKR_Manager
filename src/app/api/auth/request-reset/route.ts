import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';
import { sendResetEmail } from '@/utils/email'; // You will need to implement this
import prisma from '@/utils/prisma';
import { addMinutes } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 10);
    const schema = z.object({ email: z.string().email(), captcha: z.string() });
    const { email, captcha } = schema.parse(await req.json());

    // Verify hCaptcha token with hCaptcha API
    // This ensures the request is from a real user and not a bot
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

    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond with success to avoid leaking user existence
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { headers });
    }

    // --- Lockout logic ---
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 60;
    if (user.resetLockoutUntil && user.resetLockoutUntil > new Date()) {
      return NextResponse.json({ error: 'Too many reset attempts. Please try again later.' }, { status: 429, headers });
    }

    // Count recent attempts (could be improved with a time window, but simple counter for now)
    let attempts = user.resetAttempts || 0;
    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetAttempts: attempts,
          resetLockoutUntil: addMinutes(new Date(), LOCKOUT_MINUTES),
        },
      });
      return NextResponse.json({ error: 'Too many reset attempts. Please try again later.' }, { status: 429, headers });
    }

    // Save incremented attempts
    await prisma.user.update({
      where: { id: user.id },
      data: { resetAttempts: attempts },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
    // Reset attempts on successful request
    await prisma.user.update({
      where: { id: user.id },
      data: { resetAttempts: 0, resetLockoutUntil: null },
    });
    await sendResetEmail(user.email, token);
    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { headers });
  } catch (err) {
    return handleZodError(err);
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
