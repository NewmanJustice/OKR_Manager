import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;
    if (!token || typeof token !== 'string') {
      console.error('Password reset error: Token required.', { token });
      return new Response(JSON.stringify({ error: 'Token required.' }), { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      console.error('Password reset error: Password required.', { password });
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
      console.error('Password reset error: Weak password.', { password });
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' }), { status: 400 });
    }

    // Find token
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      console.error('Password reset error: Invalid or expired token.', { token });
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
  } catch (err: any) {
    console.error('Password reset REST API error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error.' }), { status: 500 });
  }
}
