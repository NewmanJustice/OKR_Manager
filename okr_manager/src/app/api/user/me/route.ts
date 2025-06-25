import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '@/utils/session';

export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Return only minimal info needed for UI
  return NextResponse.json({ id: session.id, role: session.role });
}
