import { NextResponse } from 'next/server';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';
import { LEAGUES } from '@/lib/leagues';

/**
 * GET /api/analytics
 * Returns aggregate analytics data for charts and visualizations.
 */
export async function GET() {
  // League breakdown
  const leagueStats = LEAGUES
    .filter(l => l.tier <= 2)
    .map(league => {
      const players = ALL_MOCK_PLAYERS.filter(p => p.leagueCode === league.code);
      const avgPPG = players.length > 0
        ? players.reduce((s, p) => s + p.pointsPerGame, 0) / players.length
        : 0;
      return {
        code: league.code,
        name: league.shortName,
        fullName: league.name,
        playerCount: players.length,
        avgPPG: Math.round(avgPPG * 100) / 100,
        avgAge: players.length > 0
          ? Math.round(players.reduce((s, p) => s + p.age, 0) / players.length * 10) / 10
          : 0,
      };
    })
    .filter(l => l.playerCount > 0)
    .sort((a, b) => b.avgPPG - a.avgPPG);

  // Age distribution
  const ageDist: Record<number, number> = {};
  ALL_MOCK_PLAYERS.forEach(p => {
    ageDist[p.age] = (ageDist[p.age] || 0) + 1;
  });

  // Nationality breakdown
  const natDist: Record<string, number> = {};
  ALL_MOCK_PLAYERS.forEach(p => {
    natDist[p.nationality] = (natDist[p.nationality] || 0) + 1;
  });

  // Position breakdown
  const posDist: Record<string, number> = {};
  ALL_MOCK_PLAYERS.forEach(p => {
    posDist[p.position] = (posDist[p.position] || 0) + 1;
  });

  // Draft status breakdown
  const draftDist: Record<string, number> = {};
  ALL_MOCK_PLAYERS.forEach(p => {
    draftDist[p.draftStatus] = (draftDist[p.draftStatus] || 0) + 1;
  });

  return NextResponse.json({
    leagueStats,
    ageDistribution: Object.entries(ageDist)
      .map(([age, count]) => ({ age: parseInt(age), count }))
      .sort((a, b) => a.age - b.age),
    nationalityBreakdown: Object.entries(natDist)
      .map(([nationality, count]) => ({ nationality, count }))
      .sort((a, b) => b.count - a.count),
    positionBreakdown: Object.entries(posDist)
      .map(([position, count]) => ({ position, count }))
      .sort((a, b) => b.count - a.count),
    draftStatusBreakdown: Object.entries(draftDist)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    totalPlayers: ALL_MOCK_PLAYERS.length,
  });
}
