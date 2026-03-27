import { NextRequest, NextResponse } from 'next/server';
import { getRecentLogs } from '@/lib/pipeline/core/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pipeline/logs
 * Returns recent structured log entries from the pipeline.
 * Query params:
 *   ?count=100  — number of entries (default 100, max 500)
 *   ?level=warn — minimum level filter (debug, info, warn, error)
 */
export async function GET(request: NextRequest) {
  const count = Math.min(
    parseInt(request.nextUrl.searchParams.get('count') || '100', 10),
    500
  );
  const level = request.nextUrl.searchParams.get('level') as 'debug' | 'info' | 'warn' | 'error' | null;

  const logs = getRecentLogs(count, level || undefined);

  return NextResponse.json({
    count: logs.length,
    logs,
  });
}
