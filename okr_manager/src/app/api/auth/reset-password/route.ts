import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { limiter } from '../../_middleware/rateLimit';
import { handleZodError } from '../../_middleware/handleZodError';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 10);
    const schema = z.object({ token: z.string(), password: z.string().min(8).max(100) });
    const { token, password } = schema.parse(await req.json());
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400, headers });
    }
    const user = await prisma.user.findUnique({ where: { id: resetToken.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers });
    }
    const password_hash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password_hash } });
    await prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } });
    return NextResponse.json({ message: 'Password has been reset successfully.' }, { headers });
  } catch (err) {
    return handleZodError(err);
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
