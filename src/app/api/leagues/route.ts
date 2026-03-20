import { NextResponse } from 'next/server';
import { LEAGUES } from '@/lib/leagues';

/**
 * GET /api/leagues
 * Returns all registered leagues with their connector status.
 */
export async function GET() {
  return NextResponse.json({
    data: LEAGUES,
    meta: { total: LEAGUES.length },
  });
}
