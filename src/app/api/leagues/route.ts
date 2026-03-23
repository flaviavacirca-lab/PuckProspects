import { NextResponse } from 'next/server';
import { LEAGUES } from '@/lib/leagues';
import { getPlayerRepository } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const repo = getPlayerRepository();
  const players = await repo.getAllPlayers();

  const leagueStats = LEAGUES.map(league => {
    const leaguePlayers = players.filter(p => p.leagueCode === league.code);
    return {
      ...league,
      playerCount: leaguePlayers.length,
      avgPpg: leaguePlayers.length > 0
        ? parseFloat((leaguePlayers.reduce((sum, p) => sum + p.pointsPerGame, 0) / leaguePlayers.length).toFixed(2))
        : 0,
    };
  });

  return NextResponse.json(leagueStats);
}
