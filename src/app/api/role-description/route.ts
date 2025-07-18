import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { limiter } from "../_middleware/rateLimit";
import { handleZodError } from "../_middleware/handleZodError";

const prisma = new PrismaClient();

// GET /api/profession?role=RoleName
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as
    { user?: { id: number; isLineManager?: boolean; isAdmin?: boolean } } | null;
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const headers = limiter.checkNext(req, 20); // 20 requests per minute per IP
    const { searchParams } = new URL(req.url);
    const roleName = searchParams.get("role");
    if (roleName) {
      // Validate roleName
      z.string().min(1).max(50).parse(roleName);
      // Allow any authenticated user to fetch a profession description
      const desc = await prisma.profession.findUnique({ where: { roleName } });
      if (!desc) {
        return NextResponse.json({ description: "" }, { headers });
      }
      return NextResponse.json({ description: desc.description }, { headers });
    } else {
      // Only admin can fetch all profession descriptions
      if (!session.user.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const allDescs = await prisma.profession.findMany();
      return NextResponse.json({ professions: allDescs }, { headers });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return handleZodError(error);
  }
}

// POST /api/profession
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as { user?: { id: number; isLineManager?: boolean; isAdmin?: boolean } } | null;
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const headers = limiter.checkNext(req, 20);
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const schema = z.object({
      roleName: z.string().min(1).max(50),
      description: z.string().min(1).max(1000),
    });
    const { roleName, description } = schema.parse(body);
    const upserted = await prisma.profession.upsert({
      where: { roleName },
      update: { description },
      create: { roleName, description },
    });
    return NextResponse.json({ success: true, description: upserted.description }, { headers });
  } catch (error) {
    if (error instanceof Error && error.message === "Rate limit exceeded") {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return handleZodError(error);
  }
}
