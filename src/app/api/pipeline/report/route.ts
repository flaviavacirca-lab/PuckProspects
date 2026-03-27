import { NextResponse } from 'next/server';
import { getHealthService } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pipeline/report
 * Returns a text report of pipeline health status.
 * Useful for monitoring tools, Slack webhooks, or quick terminal checks:
 *   curl http://localhost:3000/api/pipeline/report
 */
export async function GET() {
  try {
    const service = getHealthService();
    const report = await service.generateReport();
    return new NextResponse(report, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    return new NextResponse(`Error generating report: ${String(err)}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
