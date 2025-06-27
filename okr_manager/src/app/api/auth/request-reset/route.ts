import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';
import { sendResetEmail } from '@/utils/email'; // You will need to implement this

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 10);
    const schema = z.object({ email: z.string().email() });
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond with success to avoid leaking user existence
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { headers });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });
    // Send email with user's name for personalization
    await sendResetEmail(user.email, token, user.name);
    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' }, { headers });
  } catch (err) {
    return handleZodError(err);
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
