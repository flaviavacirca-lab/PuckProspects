import { NextRequest, NextResponse } from 'next/server';
import { getPlayerService } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const svc = getPlayerService();

  const result = await svc.getFilteredPlayers(
    {
      league: params.get('league') || undefined,
      position: params.get('position') || undefined,
      nationality: params.get('nationality') || undefined,
      draftStatus: params.get('draftStatus') || undefined,
      nhlTeam: params.get('nhlTeam') || undefined,
      ageMin: params.get('ageMin') ? parseInt(params.get('ageMin')!) : undefined,
      ageMax: params.get('ageMax') ? parseInt(params.get('ageMax')!) : undefined,
      search: params.get('search') || undefined,
    },
    params.get('sort') || 'points',
    (params.get('order') as 'asc' | 'desc') || 'desc',
    parseInt(params.get('page') || '1'),
    parseInt(params.get('limit') || '50'),
  );

  return NextResponse.json({
    players: result.data,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}
