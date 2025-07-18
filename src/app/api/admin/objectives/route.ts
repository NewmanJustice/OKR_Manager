import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { limiter } from "../../_middleware/rateLimit";
import { handleZodError } from "../../_middleware/handleZodError";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as
    { user?: { id: number; isLineManager?: boolean; isAdmin?: boolean } } | null;
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const headers = limiter.checkNext(req, 20);
    const objectives = await prisma.objective.findMany({
      include: { key_results: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(objectives, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === "Rate limit exceeded") {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return handleZodError(err);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number; isLineManager?: boolean; isAdmin?: boolean } } | null;
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const headers = limiter.checkNext(req, 20);
    const { z } = await import("zod");
    const schema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      quarter: z.number().int().min(1).max(4),
      year: z.number().int().min(2000).max(2100),
      professionId: z.union([z.string().regex(/^[0-9]+$/), z.number()]),
      keyResults: z.array(
        z.object({
          text: z.string().min(1).max(1000).optional(),
          title: z.string().min(1).max(1000).optional(),
        })
      ),
    });
    const { title, description, quarter, year, professionId, keyResults } =
      schema.parse(await req.json());
    if (!title || !quarter || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    // Validate key results
    const validKeyResults = (keyResults || []).filter(
      (kr) => (kr.text || kr.title || "").trim() !== ""
    );
    if (validKeyResults.length === 0) {
      return NextResponse.json(
        { error: "At least one key result is required and must not be empty." },
        { status: 400, headers }
      );
    }
    // Calculate next objective_number for the year/quarter
    const lastObj = await prisma.objective.findFirst({
      where: { year, quarter },
      orderBy: { objective_number: "desc" },
    });
    const nextObjectiveNumber = lastObj ? lastObj.objective_number + 1 : 1;
    const objective = await prisma.objective.create({
      data: {
        title,
        description: description ?? "",
        quarter,
        year,
        professionId: Number(professionId),
        objective_number: nextObjectiveNumber,
        created_by_id: session.user.id,
        key_results: {
          create: validKeyResults.map((kr) => ({
            title: kr.title ?? kr.text ?? "",
            description: "",
            status: "Not Started",
            created_by: { connect: { id: session.user?.id } },
          })),
        },
      },
      include: { key_results: true }, // Correctly placed include
    });
    return NextResponse.json(objective, { headers });
  } catch (err) {
    if (err instanceof Error && err.message === "Rate limit exceeded") {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    return handleZodError(err);
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions as Record<string, unknown>) as 
    { user?: { id: number; isLineManager?: boolean; isAdmin?: boolean } } | null;
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const headers = limiter.checkNext(req, 20);
    const { z } = await import("zod");
    const schema = z.object({
      id: z.number(),
      title: z.string().min(1).max(200),
      description: z.string().max(2000).optional(),
      quarter: z.number().int().min(1).max(4),
      year: z.number().int().min(2000).max(2100),
      professionId: z.union([z.string().regex(/^[0-9]+$/), z.number()]),
      key_results: z.array(
        z.object({
          id: z.number().optional(),
          title: z.string().min(1).max(1000),
        })
      ),
    });
    const { id, title, description, quarter, year, professionId, key_results } =
      schema.parse(await req.json());
    // Find existing key result IDs
    const existing = await prisma.keyResult.findMany({
      where: { objective_id: id },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((kr) => kr.id));
    const incomingIds = new Set(key_results.filter((kr) => kr.id).map((kr) => kr.id));
    // Prepare nested update
    type UpdateData = {
      title: string;
      description: string;
      quarter: number;
      year: number;
      professionId: number;
      key_results: {
        deleteMany: { id: number }[];
        updateMany: { where: { id: number }; data: { title: string } }[];
        create: { title: string; description: string; status: string; created_by: { connect: { id: number } } }[];
      };
    };
    const updateData: UpdateData = {
      title,
      description: description ?? "",
      quarter,
      year,
      professionId: Number(professionId),
      key_results: {
        deleteMany: Array.from(existingIds)
          .filter((eid) => !incomingIds.has(eid))
          .map((id) => ({ id })),
        updateMany: key_results
          .filter((kr): kr is { id: number; title: string } => typeof kr.id === "number")
          .map((kr) => ({
            where: { id: kr.id as number },
            data: { title: kr.title },
          })),
        create: key_results
          .filter((kr) => !kr.id)
          .map((kr) => ({
            title: kr.title,
            description: "",
            status: "Not Started",
            created_by: { connect: { id: session?.user?.id ?? 0 } },
          })),
      },
    };
    const updated = await prisma.objective.update({
      where: { id },
      data: updateData,
      include: { key_results: true },
    });
    return NextResponse.json(updated, { headers });
  } catch (err) {
    return handleZodError(err);
  }
}
