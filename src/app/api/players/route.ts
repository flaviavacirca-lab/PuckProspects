import { NextRequest, NextResponse } from 'next/server';
import { getPlayerRepository } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const repo = getPlayerRepository();
  let players = await repo.getAllPlayers();

  // Filters
  const league = params.get('league');
  const position = params.get('position');
  const nationality = params.get('nationality');
  const draftStatus = params.get('draftStatus');
  const nhlTeam = params.get('nhlTeam');
  const ageMin = params.get('ageMin');
  const ageMax = params.get('ageMax');
  const search = params.get('search');
  const sort = params.get('sort') || 'points';
  const order = params.get('order') || 'desc';
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '50');

  if (league) players = players.filter(p => p.leagueCode === league);
  if (position) players = players.filter(p => p.position === position);
  if (nationality) players = players.filter(p => p.nationality.toLowerCase().includes(nationality.toLowerCase()));
  if (draftStatus) players = players.filter(p => p.draftStatus === draftStatus);
  if (nhlTeam) players = players.filter(p => p.nhlRightsHolder === nhlTeam);
  if (ageMin) players = players.filter(p => p.age >= parseInt(ageMin));
  if (ageMax) players = players.filter(p => p.age <= parseInt(ageMax));
  if (search) {
    const q = search.toLowerCase();
    players = players.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.teamName.toLowerCase().includes(q)
    );
  }

  // Sort
  const sortKey = sort as keyof typeof players[0];
  players.sort((a: any, b: any) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const total = players.length;
  const start = (page - 1) * limit;
  const paginated = players.slice(start, start + limit);

  return NextResponse.json({
    players: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
