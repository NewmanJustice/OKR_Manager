import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { setSessionCookie } from '@/utils/session';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, roleId: user.roleId, isAdmin: user.isAdmin, isLineManager: user.isLineManager });
    // Clear any existing session cookie before setting a new one
    res.cookies.set({ name: 'okr_session', value: '', maxAge: 0, path: '/' });
    await setSessionCookie(res, {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role?.name || '',
      isAdmin: user.isAdmin,
      isLineManager: user.isLineManager,
    });
    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
