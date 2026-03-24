import { NextRequest, NextResponse } from 'next/server';
import { getHealthService } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20', 10);
    const service = getHealthService();
    const runs = await service.getRecentRuns(limit);
    return NextResponse.json({ runs });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch runs', message: String(err) },
      { status: 500 }
    );
  }
}
