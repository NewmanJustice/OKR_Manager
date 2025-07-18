import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendVerifyEmail } from '@/utils/email';
import prisma from '@/utils/prisma';

export async function POST(req: NextRequest) {
  // Resend verification logic (no authentication required for request)
  try {
    const schema = z.object({
      email: z.string().email(),
    });
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'No account found for this email.' }, { status: 404 });
    }
    if (user.isVerified) {
      return NextResponse.json({ error: 'Account is already verified.' }, { status: 400 });
    }
    if (!user.verifyToken) {
      return NextResponse.json({ error: 'No verification token found. Please contact support.' }, { status: 400 });
    }
    try {
      await sendVerifyEmail(user.email, user.verifyToken, user.name);
    } catch (e) {
      console.error('Failed to send verification email:', e);
      return NextResponse.json({ error: 'Failed to send verification email. Please try again later.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Verification email resent. Please check your inbox.' }, { status: 200 });
  } catch (err) {
    // Zod error handling
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
  }
}
