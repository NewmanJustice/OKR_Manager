import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { limiter } from '../../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../../_middleware/handleZodError';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(1).max(100),
    });
    const { email, name } = schema.parse(await req.json());
    // Find admin roleId
    const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
    if (!adminRole) {
      return NextResponse.json({ error: 'Admin role not found' }, { status: 500, headers });
    }
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.isAdmin) {
        return NextResponse.json({ error: 'User is already an admin' }, { status: 409, headers });
      }
      // Upgrade existing user to admin
      const updated = await prisma.user.update({
        where: { email },
        data: { isAdmin: true, roleId: adminRole.id },
      });
      return NextResponse.json({ id: updated.id, email: updated.email, name: updated.name }, { headers });
    }
    // Create a random password for the admin (should be reset by admin)
    const password = Math.random().toString(36).slice(-10);
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password_hash,
        isAdmin: true,
        isLineManager: false,
        roleId: adminRole.id,
        notify_preferences: {},
      },
    });
    // Optionally, send password to admin via email (not implemented)
    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(err);
  }
}
