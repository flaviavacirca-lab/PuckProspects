import { NextRequest, NextResponse } from 'next/server';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';

/**
 * GET /api/players
 *
 * Query parameters:
 *   search, league, position, nationality, draftStatus, nhlTeam,
 *   ageMin, ageMax, sortBy, sortDir, page, pageSize
 *
 * In production, this queries PostgreSQL. Currently uses mock data.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get('search')?.toLowerCase() || '';
  const league = params.get('league') || 'all';
  const position = params.get('position') || 'all';
  const nationality = params.get('nationality') || 'all';
  const draftStatus = params.get('draftStatus') || 'all';
  const nhlTeam = params.get('nhlTeam') || 'all';
  const ageMin = params.get('ageMin') ? parseInt(params.get('ageMin')!) : null;
  const ageMax = params.get('ageMax') ? parseInt(params.get('ageMax')!) : null;
  const sortBy = params.get('sortBy') || 'points';
  const sortDir = params.get('sortDir') || 'desc';
  const page = parseInt(params.get('page') || '1');
  const pageSize = Math.min(parseInt(params.get('pageSize') || '50'), 200);

  let filtered = ALL_MOCK_PLAYERS.filter((p) => {
    if (search && !p.fullName.toLowerCase().includes(search) && !p.teamName.toLowerCase().includes(search)) return false;
    if (league !== 'all' && p.leagueCode !== league) return false;
    if (position !== 'all') {
      if (position === 'F' && !['C', 'LW', 'RW'].includes(p.position)) return false;
      if (position !== 'F' && p.position !== position) return false;
    }
    if (nationality !== 'all' && p.nationality !== nationality) return false;
    if (draftStatus !== 'all' && p.draftStatus !== draftStatus) return false;
    if (nhlTeam !== 'all' && p.nhlRightsHolder !== nhlTeam) return false;
    if (ageMin !== null && p.age < ageMin) return false;
    if (ageMax !== null && p.age > ageMax) return false;
    return true;
  });

  // Sort
  const sortKey = sortBy as keyof typeof ALL_MOCK_PLAYERS[0];
  filtered.sort((a, b) => {
    const va = (a as unknown as Record<string, unknown>)[sortKey] ?? -999;
    const vb = (b as unknown as Record<string, unknown>)[sortKey] ?? -999;
    const cmp = typeof va === 'string' ? (va as string).localeCompare(vb as string) : (va as number) - (vb as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    data,
    meta: { total, page, pageSize, totalPages },
  });
}
