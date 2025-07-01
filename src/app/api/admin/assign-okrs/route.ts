import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  const { userIds, okrIds } = await req.json();
  if (!Array.isArray(userIds) || !Array.isArray(okrIds)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  // For each user and each OKR, create assignment if not already exists
  const assignments = [];
  for (const userId of userIds) {
    for (const okrId of okrIds) {
      // Check if assignment exists
      const exists = await prisma.okrAssignment.findFirst({
        where: { userId, okrId },
      });
      if (!exists) {
        assignments.push(
          prisma.okrAssignment.create({ data: { userId, okrId } })
        );
      }
    }
  }
  await Promise.all(assignments);
  return NextResponse.json({ success: true });
}
