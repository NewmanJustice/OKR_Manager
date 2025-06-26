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
      password: z.string().min(8).max(100),
      name: z.string().min(1).max(100),
      roleId: z.union([z.string().regex(/^\d+$/), z.number()]),
    });
    const { email, password, name, roleId } = schema.parse(await req.json());
    // Prevent registering as admin by role name
    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400, headers });
    }
    if (role.name === 'Admin') {
      return NextResponse.json({ error: 'Cannot register as admin' }, { status: 403, headers });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409, headers });
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
    const res = NextResponse.json(
      { id: user.id, email: user.email, name: user.name, roleId: user.roleId, isAdmin: user.isAdmin, isLineManager: user.isLineManager },
      { headers }
    );
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
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
