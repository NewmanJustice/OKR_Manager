import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth/authOptions';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// PATCH and DELETE for Success Criteria
export async function PATCH(req: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guid, krid, scid } = params;
  const data = await req.json();
  // Only allow updating user's own success criteria
  const sc = await prisma.successCriteria.findFirst({
    where: {
      id: Number(scid),
      keyResult: {
        id: Number(krid),
        objective: { guid, user: { email: session.user.email } },
      },
    },
  });
  if (!sc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.successCriteria.update({
    where: { id: Number(scid) },
    data,
  });
  return NextResponse.json({ successCriteria: updated });
}

export async function DELETE(req: Request, context: any) {
  const { params } = context;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { guid, krid, scid } = params;
  // Only allow deleting user's own success criteria
  const sc = await prisma.successCriteria.findFirst({
    where: {
      id: Number(scid),
      keyResult: {
        id: Number(krid),
        objective: { guid, user: { email: session.user.email } },
      },
    },
  });
  if (!sc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.successCriteria.delete({ where: { id: Number(scid) } });
  return NextResponse.json({ success: true });
}
