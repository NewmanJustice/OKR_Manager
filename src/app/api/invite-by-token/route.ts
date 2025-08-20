import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  // Validate token format (UUID v4)
  if (!token || !/^[0-9a-fA-F-]{36}$/.test(token)) {
    return NextResponse.json({ invite: null, error: "Invalid token format" }, { status: 400 });
  }

  try {
    const invite = await prisma.invite.findUnique({
      where: { token },
      select: {
        email: true,
        status: true,
        expiresAt: true,
        dateUsed: true,
      },
    });
    if (!invite) {
      return NextResponse.json({ invite: null }, { status: 404 });
    }
    // Optionally, check expiry/invalidated/used status here
    return NextResponse.json({ invite });
  } catch (err) {
    return NextResponse.json({ invite: null, error: "Server error" }, { status: 500 });
  }
}
