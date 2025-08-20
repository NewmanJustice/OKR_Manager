import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import { sendInviteEmailGovNotify } from "@/utils/sendInviteEmailGovNotify";
import type { Invite as PrismaInvite } from "@prisma/client";

// Use lowercase 'invite' for Prisma model and type
function getInviteStatus(invite: PrismaInvite) {
  const now = new Date();
  if (invite.status === "used") return "used";
  if (invite.status === "invalidated") return "invalidated";
  if (invite.expiresAt && now > new Date(invite.expiresAt)) return "expired";
  if (invite.status === "resent") return "resent";
  return "pending";
}

// POST: create/send invite
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isLineManager) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const { email, inviteeName } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  // Generate unique token
  const token = uuidv4();
  const now = new Date();
  // Save invite to DB
  const invite = await db.invite.create({
    data: {
      email,
      token,
      lineManagerId: userId,
      dateSent: now,
      status: "pending",
      expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  // Send invite email via GOV Notify
  await sendInviteEmailGovNotify(
    session.user.name || "Line Manager",
    inviteeName || "User",
    email,
    token
  );
  return NextResponse.json({ invite });
}

// GET: list invites for line manager
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isLineManager) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id;
  let invites = await db.invite.findMany({
    where: { lineManagerId: userId },
    orderBy: { dateSent: "desc" },
  });
  // Map status for expiry
  invites = invites.map((invite: PrismaInvite) => ({ ...invite, status: getInviteStatus(invite) }));
  return NextResponse.json({ invites });
}
