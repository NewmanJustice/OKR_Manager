import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserFromRequest } from '../utils/session';

// Accepts a predicate function for role-based access
export function withRole(check: (user: any) => boolean) {
  return async (req: NextRequest) => {
    const user = await getSessionUserFromRequest(req);
    if (!user || !check(user)) {
      return NextResponse.redirect('/login');
    }
    return NextResponse.next();
  };
}

// Example usage:
// withRole(user => user.isAdmin)
// withRole(user => user.roleName === 'Principal Development Manager')
