import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '../utils/session';

export function withRole(requiredRole: string) {
  return async (req: NextRequest) => {
    const user = await getSessionUser(req);
    if (!user || user.role !== requiredRole) {
      return NextResponse.redirect('/login');
    }
    return NextResponse.next();
  };
}
