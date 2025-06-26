import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';

export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    // Return 200 with no user object for easier client logic
    return NextResponse.json({});
  }
  // Return only minimal info needed for UI
  return NextResponse.json({ id: session.id, email: session.email, roleName: session.roleName });
}
