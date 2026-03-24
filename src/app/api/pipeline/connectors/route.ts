import { NextResponse } from 'next/server';
import { getIngestionService } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const service = getIngestionService();
    const connectors = service.listConnectors();
    return NextResponse.json({ connectors });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to list connectors', message: String(err) },
      { status: 500 }
    );
  }
}
