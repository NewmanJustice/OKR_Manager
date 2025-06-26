import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSessionUserFromRequest } from '@/utils/session';
import { limiter } from '../_middleware/rateLimit';
import { z } from 'zod';
import { handleZodError } from '../_middleware/handleZodError';

const prisma = new PrismaClient();

// GET /api/role-description?role=RoleName
export async function GET(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20); // 20 requests per minute per IP
    const session = await getSessionUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const roleName = searchParams.get('role');
    if (roleName) {
      // Validate roleName
      z.string().min(1).max(50).parse(roleName);
      // Allow any authenticated user to fetch a role description
      const desc = await prisma.roleDescription.findUnique({ where: { roleName } });
      if (!desc) {
        return NextResponse.json({ description: '' }, { headers });
      }
      return NextResponse.json({ description: desc.description }, { headers });
    } else {
      // Only admin can fetch all role descriptions
      if (!session.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const allDescs = await prisma.roleDescription.findMany();
      return NextResponse.json({ roleDescriptions: allDescs }, { headers });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(error);
  }
}

// POST /api/role-description
export async function POST(req: NextRequest) {
  try {
    const headers = limiter.checkNext(req, 20);
    const session = await getSessionUserFromRequest(req);
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const schema = z.object({
      roleName: z.string().min(1).max(50),
      description: z.string().min(1).max(1000)
    });
    const { roleName, description } = schema.parse(body);
    const upserted = await prisma.roleDescription.upsert({
      where: { roleName },
      update: { description },
      create: { roleName, description },
    });
    return NextResponse.json({ success: true, description: upserted.description }, { headers });
  } catch (error) {
    if (error instanceof Error && error.message === 'Rate limit exceeded') {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    return handleZodError(error);
  }
}
