import { NextResponse } from 'next/server';
import { getHealthService } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = getHealthService();
    const health = await service.getHealth();
    return NextResponse.json(health);
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch pipeline health', message: String(err) },
      { status: 500 }
    );
  }
}
