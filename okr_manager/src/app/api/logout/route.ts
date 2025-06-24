import { NextResponse } from 'next/server';

export async function GET() {
  // Remove the session cookie by setting it to empty and expired
  return NextResponse.json({ success: true }, {
    headers: {
      'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    },
  });
}
