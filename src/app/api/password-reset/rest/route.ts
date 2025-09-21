import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const body = await req.json();
  const { token, password } = body;
  if (!token || typeof token !== 'string') {
    return new Response(JSON.stringify({ error: 'Token required.' }), { status: 400 });
  }
  if (!password || typeof password !== 'string') {
    return new Response(JSON.stringify({ error: 'Password required.' }), { status: 400 });
  }

  // Password strength validation
  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    return new Response(JSON.stringify({ error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' }), { status: 400 });
  }

  // Find token
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token.' }), { status: 400 });
  }

  // Update password
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashed },
  });
  // Mark token as used
  await prisma.passwordResetToken.update({
    where: { token },
    data: { used: true },
  });

  return new Response(JSON.stringify({ message: 'Password has been reset successfully.' }), { status: 200 });
}
