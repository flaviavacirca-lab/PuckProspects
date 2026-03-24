import { PlayerSearchResult } from '@/types';

export function getPercentileColor(pct: number | null): string {
  if (pct === null) return 'bg-gray-200';
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 75) return 'bg-blue-500';
  if (pct >= 50) return 'bg-amber-500';
  if (pct >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getPercentileTextColor(pct: number | null): string {
  if (pct === null) return 'text-gray-400';
  if (pct >= 90) return 'text-emerald-600';
  if (pct >= 75) return 'text-blue-600';
  if (pct >= 50) return 'text-amber-600';
  if (pct >= 25) return 'text-orange-600';
  return 'text-red-600';
}

export function formatPlusMinus(val: number | null): string {
  if (val === null || val === undefined) return '-';
  return val > 0 ? `+${val}` : `${val}`;
}

export function flagEmoji(country: string): string {
  const map: Record<string, string> = {
    'Canada': '🇨🇦', 'USA': '🇺🇸', 'Sweden': '🇸🇪', 'Finland': '🇫🇮',
    'Russia': '🇷🇺', 'Czech Republic': '🇨🇿', 'Switzerland': '🇨🇭',
    'Germany': '🇩🇪', 'Slovakia': '🇸🇰', 'Latvia': '🇱🇻',
    'Denmark': '🇩🇰', 'Austria': '🇦🇹', 'Norway': '🇳🇴',
  };
  return map[country] || '';
}

export function positionColor(pos: string): string {
  switch (pos) {
    case 'C': return 'text-blue-600';
    case 'LW': return 'text-emerald-600';
    case 'RW': return 'text-teal-600';
    case 'D': return 'text-amber-600';
    case 'G': return 'text-purple-600';
    default: return 'text-gray-500';
  }
}

export function draftStatusLabel(status: string): string {
  switch (status) {
    case 'drafted': return 'Drafted';
    case 'undrafted': return 'Undrafted';
    case 'draft_eligible': return 'Eligible';
    case 're_entry': return 'Re-entry';
    default: return status;
  }
}

export type SortField = keyof Pick<PlayerSearchResult, 'fullName' | 'age' | 'gamesPlayed' | 'goals' | 'assists' | 'points' | 'pointsPerGame' | 'plusMinus' | 'leaguePercentile' | 'agePercentile'>;

export function sortPlayers(players: PlayerSearchResult[], field: SortField, dir: 'asc' | 'desc'): PlayerSearchResult[] {
  return [...players].sort((a, b) => {
    const va = a[field] ?? -999;
    const vb = b[field] ?? -999;
    if (typeof va === 'string' && typeof vb === 'string') {
      return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return dir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
  });
}

export function filterPlayers(
  players: PlayerSearchResult[],
  filters: {
    search?: string;
    league?: string;
    position?: string;
    nationality?: string;
    draftStatus?: string;
    nhlTeam?: string;
    ageMin?: number;
    ageMax?: number;
  },
): PlayerSearchResult[] {
  return players.filter((p) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.fullName.toLowerCase().includes(q) &&
          !p.teamName.toLowerCase().includes(q) &&
          !p.leagueName.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filters.league && filters.league !== 'all' && p.leagueCode !== filters.league) return false;
    if (filters.position && filters.position !== 'all') {
      if (filters.position === 'F' && !['C', 'LW', 'RW'].includes(p.position)) return false;
      if (filters.position !== 'F' && p.position !== filters.position) return false;
    }
    if (filters.nationality && filters.nationality !== 'all' && p.nationality !== filters.nationality) return false;
    if (filters.draftStatus && filters.draftStatus !== 'all' && p.draftStatus !== filters.draftStatus) return false;
    if (filters.nhlTeam && filters.nhlTeam !== 'all' && p.nhlRightsHolder !== filters.nhlTeam) return false;
    if (filters.ageMin && p.age < filters.ageMin) return false;
    if (filters.ageMax && p.age > filters.ageMax) return false;
    return true;
  });
}
