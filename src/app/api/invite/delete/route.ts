import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/authOptions";
import db from "@/lib/db";

// DELETE: delete invite
export async function DELETE(req: Request) {
  try{
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
    // Instead of deleting, invalidate the invite
    await db.invite.update({ where: { id: inviteId }, data: { status: "invalidated" } });
    return NextResponse.json({ success: true });
  }
  catch(err: any){
    console.error('Error when deleting invite', err)
  }
}
