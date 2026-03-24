import { NextResponse } from 'next/server';
import { registry, getSourcesSummary } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const descriptors = registry.listDescriptors();
    const summary = registry.getSummary();
    const sourceSummary = getSourcesSummary();

    return NextResponse.json({
      total: registry.size,
      summary: sourceSummary,
      byMaturity: {
        implemented: summary.implemented.length,
        partial: summary.partial.length,
        scaffolded: summary.scaffolded.length,
        future: summary.future.length,
        blocked: summary.blocked.length,
      },
      connectors: descriptors.map(d => ({
        name: d.sourceName,
        type: d.sourceType,
        league: d.league,
        url: d.sourceUrl,
        maturity: d.maturity,
        tier: d.tier,
        cadence: d.ingestionCadence,
        leaguesCovered: d.leaguesCovered || [],
        limitations: d.knownLimitations,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to list connectors', message: String(err) },
      { status: 500 }
    );
  }
}
