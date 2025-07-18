import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number; email: string; roleName: string } } | null;
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Return only minimal info needed for UI
  return NextResponse.json({ id: session.user.id, email: session.user.email, roleName: session.user.roleName });
}
