import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Missing verification token.' }, { status: 400 });
    }
    const user = await prisma.user.findFirst({ where: { verifyToken: token } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification token.' }, { status: 400 });
    }
    if (user.isVerified) {
      return NextResponse.json({ message: 'Account already verified.' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verifyToken: null },
    });
    return NextResponse.json({ message: 'Account verified successfully.' });
  } catch {
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}
