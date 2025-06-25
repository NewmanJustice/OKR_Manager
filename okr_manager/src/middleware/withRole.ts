import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '../utils/session';

export function withRole(requiredRole: string) {
  return async (req: NextRequest) => {
    const user = await getSessionUserFromRequest(req);
    if (!user || user.role !== requiredRole) {
      return NextResponse.redirect('/login');
    }
    return NextResponse.next();
  };
}
