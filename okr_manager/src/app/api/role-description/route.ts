import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getSessionUserFromRequest } from '@/utils/session';

const prisma = new PrismaClient();

// GET /api/role-description?role=RoleName
export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const roleName = searchParams.get('role');
  if (roleName) {
    // Allow any authenticated user to fetch a role description
    const desc = await prisma.roleDescription.findUnique({ where: { roleName } });
    if (!desc) {
      return NextResponse.json({ description: '' });
    }
    return NextResponse.json({ description: desc.description });
  } else {
    // Only admin can fetch all role descriptions
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const allDescs = await prisma.roleDescription.findMany();
    return NextResponse.json({ roleDescriptions: allDescs });
  }
}

// POST /api/role-description
export async function POST(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { roleName, description } = await req.json();
  if (!roleName || typeof description !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
  }
  const upserted = await prisma.roleDescription.upsert({
    where: { roleName },
    update: { description },
    create: { roleName, description },
  });
  return NextResponse.json({ success: true, description: upserted.description });
}
