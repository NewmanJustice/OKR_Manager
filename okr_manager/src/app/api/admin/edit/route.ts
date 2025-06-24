import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { id, email, name } = await req.json();
  if (!id || !email || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { email, name },
    });
    return NextResponse.json({ id: updated.id, email: updated.email, name: updated.name });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 });
  }
}
