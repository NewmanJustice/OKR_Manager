import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try{
    const gddRoles = await prisma.gddRole.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json({ gddRoles });
  }
  catch(err: any){
    console.error('Error getting gdd roles', err);
  }
}
