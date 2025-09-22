import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from "@/utils/sendPasswordRestRequest";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;
    if (!email || typeof email !== 'string') {
      console.error('Password reset request error: Email required.', { email });
      return new Response(JSON.stringify({ error: 'Email required.' }), { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success, even if user not found
    if (!user) {
      return new Response(JSON.stringify({ message: 'If your email is registered, you will receive a reset link.' }), { status: 200 });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        used: false,
      },
    });

    // Send email via Gov Notify
    await sendPasswordResetEmail(
      user.name,
      user.email,
      token
    );

    return new Response(JSON.stringify({ message: 'If your email is registered, you will receive a reset link.' }), { status: 200 });
  } catch (err: any) {
    console.error('Password reset API error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error.' }), { status: 500 });
  }
}
