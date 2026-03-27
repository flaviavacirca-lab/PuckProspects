import { NextRequest, NextResponse } from 'next/server';
import { getHealthService } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pipeline/flagged
 * Returns flagged identity matches needing review.
 * Query params:
 *   ?limit=50 — max results (default 50)
 */
export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const service = getHealthService();
    const flagged = await service.getFlaggedMatches(limit);
    return NextResponse.json({
      count: flagged.length,
      flagged,
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch flagged matches', message: String(err) },
      { status: 500 }
    );
  }
}
