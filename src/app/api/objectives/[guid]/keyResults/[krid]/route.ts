import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth/authOptions';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PATCH and DELETE for Key Result
export async function PATCH(req: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guid, krid } = params;
  const data = await req.json();
  // Only allow updating user's own key result
  const kr = await prisma.keyResult.findFirst({
    where: {
      id: Number(krid),
      objective: { guid, user: { email: session.user.email } },
    },
  });
  if (!kr) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.keyResult.update({
    where: { id: Number(krid) },
    data,
  });
  return NextResponse.json({ keyResult: updated });
}

export async function DELETE(req: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guid, krid } = params;
  // Only allow deleting user's own key result
  const kr = await prisma.keyResult.findFirst({
    where: {
      id: Number(krid),
      objective: { guid, user: { email: session.user.email } },
    },
  });
  if (!kr) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.keyResult.delete({ where: { id: Number(krid) } });
  return NextResponse.json({ success: true });
}
