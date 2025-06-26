import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { setSessionCookie } from '@/utils/session';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, roleId } = await req.json();
    if (!email || !password || !name || !roleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Prevent registering as admin by role name
    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (role.name === 'Admin') {
      return NextResponse.json({ error: 'Cannot register as admin' }, { status: 403 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const password_hash = await bcrypt.hash(password, 10);
    // Set isLineManager or isAdmin based on role
    const isLineManager = role.name === 'Principal Development Manager';
    const isAdmin = role.name === 'Admin';
    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        name,
        roleId: Number(roleId),
        isLineManager,
        isAdmin,
        notify_preferences: {},
      },
    });
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, roleId: user.roleId });
    await setSessionCookie(res, {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: role.name,
      isAdmin: user.isAdmin,
      isLineManager: user.isLineManager,
    });
    return res;
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
