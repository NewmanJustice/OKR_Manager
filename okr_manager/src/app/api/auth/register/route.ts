import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { setSessionCookie } from '@/utils/session';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, password, name, role } = await req.json();
  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (role === 'ADMIN') {
    return NextResponse.json({ error: 'Cannot register as admin' }, { status: 403 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      name,
      role,
      notify_preferences: {},
    },
  });
  const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  await setSessionCookie(res, user);
  return res;
}
