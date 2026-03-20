import { NextRequest, NextResponse } from 'next/server';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';

/**
 * GET /api/comparisons?ids=1,2,3
 * Returns detailed comparison data for the specified player IDs.
 */
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get('ids') || '';
  const ids = idsParam.split(',').map(Number).filter(Boolean);

  if (ids.length < 2 || ids.length > 4) {
    return NextResponse.json(
      { error: 'Provide 2-4 player IDs' },
      { status: 400 }
    );
  }

  const players = ids.map(id => ALL_MOCK_PLAYERS.find(p => p.id === id)).filter(Boolean);

  // Compute comparison metrics
  const maxPts = Math.max(...players.map(p => p!.points));
  const maxPPG = Math.max(...players.map(p => p!.pointsPerGame));
  const maxGoals = Math.max(...players.map(p => p!.goals));

  const data = players.map(p => ({
    ...p,
    ptsRatio: maxPts > 0 ? p!.points / maxPts : 0,
    ppgRatio: maxPPG > 0 ? p!.pointsPerGame / maxPPG : 0,
    goalsRatio: maxGoals > 0 ? p!.goals / maxGoals : 0,
  }));

  return NextResponse.json({ data });
}
