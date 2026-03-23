import { NextResponse } from 'next/server';
import { getPlayerService } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const svc = getPlayerService();
  const analytics = await svc.getAnalytics();
  return NextResponse.json(analytics);
}
