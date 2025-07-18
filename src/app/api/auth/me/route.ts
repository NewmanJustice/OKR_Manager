import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number; email: string; roleName: string } } | null;
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ email: session.user.email, id: session.user.id, roleName: session.user.roleName });
}
