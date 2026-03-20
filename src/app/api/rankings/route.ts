import { NextRequest, NextResponse } from 'next/server';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';

/**
 * GET /api/rankings
 *
 * Query parameters:
 *   type: 'overall' | 'position' | 'age_adjusted' | 'draft_eligible' | 'nhl_affiliated'
 *   position: filter by position
 *   limit: max results (default 50)
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get('type') || 'overall';
  const position = params.get('position');
  const limit = Math.min(parseInt(params.get('limit') || '50'), 200);

  let players = [...ALL_MOCK_PLAYERS];

  // Filter by type
  switch (type) {
    case 'draft_eligible':
      players = players.filter(p => p.draftStatus === 'draft_eligible');
      break;
    case 'nhl_affiliated':
      players = players.filter(p => p.nhlRightsHolder !== null);
      break;
  }

  // Filter by position
  if (position && position !== 'all') {
    if (position === 'F') {
      players = players.filter(p => ['C', 'LW', 'RW'].includes(p.position));
    } else {
      players = players.filter(p => p.position === position);
    }
  }

  // Sort based on ranking type
  switch (type) {
    case 'age_adjusted': {
      players.sort((a, b) => {
        const aScore = a.pointsPerGame * (1 + (20 - a.age) * 0.08);
        const bScore = b.pointsPerGame * (1 + (20 - b.age) * 0.08);
        return bScore - aScore;
      });
      break;
    }
    default:
      players.sort((a, b) => b.pointsPerGame - a.pointsPerGame);
  }

  const data = players.slice(0, limit).map((p, i) => ({
    rank: i + 1,
    ...p,
  }));

  return NextResponse.json({ data, meta: { total: data.length, type } });
}
