import { NextResponse } from 'next/server';
import { getSessionUserFromCookies } from '@/utils/session';

export async function GET() {
  const user = await getSessionUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ email: user.email, id: user.id, roleName: user.roleName });
}
