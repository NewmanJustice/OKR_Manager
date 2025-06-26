import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getSessionUserFromRequest } from '@/utils/session';

// POST: Save or update progress for a key result (monthly)
export async function POST(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session || !session.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Debug: return session user id
  if (req.headers.get('x-debug-session') === 'true') {
    return NextResponse.json({ debugUserId: session.id });
  }
  const { key_result_id, status, metric_value, evidence, comments, blockers, resources_needed, month, year } = await req.json();
  if (!key_result_id || !month || !year || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    console.log('Received progress POST:', { sessionId: session.id, key_result_id, status, metric_value, evidence, comments, blockers, resources_needed, month, year });
    const progress = await prisma.keyResultProgress.create({
      data: {
        key_result_id,
        user_id: session.id,
        month,
        year,
        status,
        metric_value,
        evidence,
        comments,
        blockers,
        resources_needed,
      },
    });
    return NextResponse.json(progress);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET: Fetch progress for key results for the current user and month/year
export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session || !session.isLineManager) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const keyResultIds = (searchParams.get('keyResultIds') || '').split(',').map(Number).filter(Boolean);
  // If month and year are provided, filter by them, else return all months/years
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  if (!keyResultIds.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const where: any = {
      key_result_id: { in: keyResultIds },
      user_id: session.id,
    };
    if (month && year) {
      where.month = Number(month);
      where.year = Number(year);
    }
    const progressArr = await prisma.keyResultProgress.findMany({
      where,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    return NextResponse.json(progressArr);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
