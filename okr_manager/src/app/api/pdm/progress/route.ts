import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getSessionUserFromRequest } from '@/utils/session';

// POST: Save or update progress for a key result (monthly)
export async function POST(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session || session.role.toLowerCase() !== 'pdm') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Debug: return session user id
  if (req.headers.get('x-debug-session') === 'true') {
    return NextResponse.json({ debugUserId: session.id });
  }
  const { key_result_id, status, metric_value, evidence, comments, month, year } = await req.json();
  if (!key_result_id || !month || !year || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    console.log('Received progress POST:', { sessionId: session.id, key_result_id, status, metric_value, evidence, comments, month, year });
    const progress = await prisma.keyResultProgress.upsert({
      where: {
        key_result_id_user_id_month_year: {
          key_result_id,
          user_id: session.id,
          month,
          year,
        },
      },
      update: {
        status,
        metric_value,
        evidence,
        comments,
      },
      create: {
        key_result_id,
        user_id: session.id,
        month,
        year,
        status,
        metric_value,
        evidence,
        comments,
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
  if (!session || session.role.toLowerCase() !== 'pdm') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const keyResultIds = (searchParams.get('keyResultIds') || '').split(',').map(Number).filter(Boolean);
  const month = Number(searchParams.get('month'));
  const year = Number(searchParams.get('year'));
  if (!keyResultIds.length || !month || !year) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const progressArr = await prisma.keyResultProgress.findMany({
      where: {
        key_result_id: { in: keyResultIds },
        user_id: session.id,
        month,
        year,
      },
    });
    return NextResponse.json(progressArr);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
