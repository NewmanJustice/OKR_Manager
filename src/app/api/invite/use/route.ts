import { NextResponse } from "next/server";
import db from "@/lib/db";

// POST: mark invite as used
export async function POST(req: Request) {
  try{
    const { token } = await req.json();
    const invite = await db.invite.findUnique({ where: { token } });
    if (!invite || invite.status === "used") {
      return NextResponse.json({ error: "Invalid or already used" }, { status: 400 });
    }
    await db.invite.update({
      where: { token },
      data: { status: "used", dateUsed: new Date() },
    });
    return NextResponse.json({ success: true });
  }
  catch (err: any){
    console.error('Error using invite', err)
  }
}
