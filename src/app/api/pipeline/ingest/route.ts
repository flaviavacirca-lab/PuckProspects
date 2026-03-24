import { NextRequest, NextResponse } from 'next/server';
import { getIngestionService } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

/**
 * POST /api/pipeline/ingest
 *
 * Trigger an ingestion run. Body options:
 *   { source?: string, league?: string, dryRun?: boolean }
 *
 * - No body: run all enabled sources
 * - source: run a specific connector
 * - league: run all connectors for a league
 * - dryRun: validate without persisting
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { source, league, dryRun } = body as {
      source?: string;
      league?: string;
      dryRun?: boolean;
    };

    const service = getIngestionService();

    if (source) {
      const result = dryRun
        ? await service.dryRun(source)
        : await service.ingestSource(source, { dryRun });
      return NextResponse.json({
        status: result.run.status,
        run: {
          connector: result.run.connectorName,
          league: result.run.league,
          recordsFetched: result.run.recordsFetched,
          recordsInserted: result.run.recordsInserted,
          recordsUpdated: result.run.recordsUpdated,
          recordsSkipped: result.run.recordsSkipped,
          errors: result.run.errors.length,
          durationMs: result.run.durationMs,
        },
        players: result.players.length,
        skaterStats: result.skaterStats.length,
        goalieStats: result.goalieStats.length,
      });
    }

    if (league) {
      const results = await service.ingestLeague(league, { dryRun });
      return NextResponse.json({
        league,
        runs: results.map(r => ({
          connector: r.run.connectorName,
          status: r.run.status,
          recordsFetched: r.run.recordsFetched,
          recordsInserted: r.run.recordsInserted,
          durationMs: r.run.durationMs,
        })),
      });
    }

    // Run all
    const results = await service.ingestAll({ dryRun });
    return NextResponse.json({
      total: results.length,
      succeeded: results.filter(r => r.run.status === 'success').length,
      failed: results.filter(r => r.run.status === 'failed').length,
      runs: results.map(r => ({
        connector: r.run.connectorName,
        league: r.run.league,
        status: r.run.status,
        durationMs: r.run.durationMs,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Ingestion failed', message: String(err) },
      { status: 500 }
    );
  }
}
