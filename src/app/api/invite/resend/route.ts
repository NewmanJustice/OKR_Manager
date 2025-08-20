import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import db from "@/lib/db";
import { sendInviteEmailGovNotify } from "@/utils/sendInviteEmailGovNotify";

// POST: resend invite
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isLineManager) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { inviteId } = await req.json();
  const invite = await db.invite.findUnique({ where: { id: inviteId } });
  // Fix: get user id from session.user (cast to any)
  const userId = (session.user as any).id;
  if (!invite || invite.lineManagerId !== userId) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }
  // Resend email with same token using GOV Notify
  await sendInviteEmailGovNotify(
    session.user.name || "Line Manager",
    "User", // fallback, since inviteeName is not in the Invite model
    invite.email,
    invite.token
  );
  // Update dateSent and status
  await db.invite.update({
    where: { id: inviteId },
    data: { dateSent: new Date(), status: "resent" },
  });
  return NextResponse.json({ success: true });
}
