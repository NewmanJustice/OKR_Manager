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
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('Login attempt for', email, 'found user:', user);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    // Clear any existing session cookie before setting a new one
    res.cookies.set({ name: 'okr_session', value: '', maxAge: 0, path: '/' });
    await setSessionCookie(res, user);
    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
