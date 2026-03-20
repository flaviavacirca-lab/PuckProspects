import { NextRequest, NextResponse } from 'next/server';
import { LEAGUES } from '@/lib/leagues';

/**
 * GET /api/ingestion
 * Returns ingestion status for all leagues.
 *
 * POST /api/ingestion
 * Triggers ingestion for specified leagues.
 * Body: { leagues: string[] } or {} for all
 *
 * In production, POST triggers the Python pipeline runner.
 */
export async function GET() {
  const status = LEAGUES.map(league => ({
    leagueCode: league.code,
    leagueName: league.name,
    shortName: league.shortName,
    connectorStatus: league.connectorStatus,
    lastIngested: league.connectorStatus !== 'placeholder'
      ? new Date(Date.now() - Math.random() * 86400000 * 2).toISOString()
      : null,
    healthy: Math.random() > 0.1,
    recordCount: league.connectorStatus !== 'placeholder'
      ? Math.floor(Math.random() * 200) + 20
      : 0,
  }));

  return NextResponse.json({ data: status });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const leagues: string[] = body.leagues || LEAGUES.map(l => l.code);

  // In production, this would spawn the Python pipeline runner
  // For now, return a mock response
  return NextResponse.json({
    message: `Ingestion triggered for ${leagues.length} leagues`,
    leagues,
    status: 'queued',
  });
}
