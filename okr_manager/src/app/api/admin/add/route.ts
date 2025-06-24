import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();
  if (!email || !name) {
    return NextResponse.json({ error: 'Missing email or name' }, { status: 400 });
  }
  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === 'ADMIN') {
      return NextResponse.json({ error: 'User is already an admin' }, { status: 409 });
    }
    // Upgrade existing user to admin
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    return NextResponse.json({ id: updated.id, email: updated.email, name: updated.name });
  }
  // Create a random password for the admin (should be reset by admin)
  const password = Math.random().toString(36).slice(-10);
  const password_hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password_hash,
      role: 'ADMIN',
      notify_preferences: {},
    },
  });
  // Optionally, send password to admin via email (not implemented)
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
