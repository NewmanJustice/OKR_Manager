import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// Use Next.js App Route Handler context type for compatibility
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { guid, krid } = context.params;
  const { description, threshold } = await req.json();
  if (!description || !threshold) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  // Find the key result and check user ownership
  const keyResult = await prisma.keyResult.findFirst({
    where: {
      id: Number(krid),
      objective: {
        guid,
        user: { email: session.user.email },
      },
    },
  });
  if (!keyResult) {
    return NextResponse.json({ error: "Key result not found or unauthorized" }, { status: 404 });
  }
  // Create the success criteria
  const sc = await prisma.successCriteria.create({
    data: {
      description,
      threshold,
      keyResultId: keyResult.id,
    },
  });
  return NextResponse.json({ successCriteria: sc });
}
