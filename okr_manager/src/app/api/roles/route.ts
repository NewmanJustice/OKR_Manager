import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const roles = await prisma.role.findMany({
    where: { name: { not: 'Admin' } },
    select: { id: true, name: true, description: true },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(roles);
}
