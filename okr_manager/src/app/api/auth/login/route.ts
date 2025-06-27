import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { setSessionCookie } from '@/utils/session';
import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8).max(100), // restored min length to 8
    });
    const { email, password } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers });
    }
    const res = NextResponse.json(
      { id: user.id, email: user.email, name: user.name, roleId: user.roleId, isAdmin: user.isAdmin, isLineManager: user.isLineManager },
      { headers }
    );
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
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
