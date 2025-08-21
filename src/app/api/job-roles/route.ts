import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Return all job roles
export async function GET(req: NextRequest) {
  const jobRoles = await prisma.jobRole.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ jobRoles });
}
