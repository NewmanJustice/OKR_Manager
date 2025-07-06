import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';
import { sendVerifyEmail } from '@/utils/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 10);
    const schema = z.object({
      email: z.string().email(),
    });
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'No account found for this email.' }, { status: 404, headers });
    }
    if (user.isVerified) {
      return NextResponse.json({ error: 'Account is already verified.' }, { status: 400, headers });
    }
    if (!user.verifyToken) {
      return NextResponse.json({ error: 'No verification token found. Please contact support.' }, { status: 400, headers });
    }
    try {
      await sendVerifyEmail(user.email, user.verifyToken, user.name);
    } catch (e) {
      console.error('Failed to send verification email:', e);
      return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500, headers });
    }
    return NextResponse.json({ message: 'Verification email resent. Please check your inbox.' }, { status: 200, headers });
  } catch (err) {
    return handleZodError(err);
  }
}
