import { NextResponse } from 'next/server';
import { getAllPlayers } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function GET() {
  const players = await getAllPlayers();

  // League breakdown
  const byLeague = new Map<string, { name: string; count: number; totalPpg: number }>();
  for (const p of players) {
    const entry = byLeague.get(p.leagueCode) || { name: p.leagueName, count: 0, totalPpg: 0 };
    entry.count++;
    entry.totalPpg += p.pointsPerGame;
    byLeague.set(p.leagueCode, entry);
  }
  const leagueBreakdown = Array.from(byLeague.entries()).map(([code, data]) => ({
    code,
    name: data.name,
    playerCount: data.count,
    avgPpg: parseFloat((data.totalPpg / data.count).toFixed(2)),
  }));

  // Age distribution
  const byAge = new Map<number, number>();
  for (const p of players) {
    byAge.set(p.age, (byAge.get(p.age) || 0) + 1);
  }
  const ageDistribution = Array.from(byAge.entries())
    .map(([age, count]) => ({ age, count }))
    .sort((a, b) => a.age - b.age);

  // Nationality breakdown
  const byNat = new Map<string, number>();
  for (const p of players) {
    byNat.set(p.nationality, (byNat.get(p.nationality) || 0) + 1);
  }
  const nationalityBreakdown = Array.from(byNat.entries())
    .map(([nationality, count]) => ({ nationality, count, pct: parseFloat((count / players.length * 100).toFixed(1)) }))
    .sort((a, b) => b.count - a.count);

  // Position distribution
  const byPos = new Map<string, number>();
  for (const p of players) {
    byPos.set(p.position, (byPos.get(p.position) || 0) + 1);
  }
  const positionDistribution = Array.from(byPos.entries())
    .map(([position, count]) => ({ position, count, pct: parseFloat((count / players.length * 100).toFixed(1)) }))
    .sort((a, b) => b.count - a.count);

  // Top performers
  const topRisers = [...players]
    .filter(p => p.pointsPerGame >= 1.0 && p.position !== 'G')
    .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
    .slice(0, 10);

  return NextResponse.json({
    total: players.length,
    leagueBreakdown,
    ageDistribution,
    nationalityBreakdown,
    positionDistribution,
    topRisers,
  });
}
