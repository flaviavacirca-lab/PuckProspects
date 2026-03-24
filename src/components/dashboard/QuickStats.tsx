import { PlayerSearchResult } from '@/types';
import { LEAGUES } from '@/lib/leagues';

interface QuickStatsProps {
  players: PlayerSearchResult[];
}

export default function QuickStats({ players }: QuickStatsProps) {
  const totalPlayers = players.length;
  const leaguesWithData = new Set(players.map(p => p.leagueCode)).size;
  const draftEligible = players.filter(p => p.draftStatus === 'draft_eligible').length;
  const avgAge = players.length > 0
    ? (players.reduce((sum, p) => sum + p.age, 0) / players.length).toFixed(1)
    : '-';

  const stats = [
    { label: 'Total Players', value: totalPlayers.toLocaleString(), color: 'text-blue-600' },
    { label: 'Leagues Tracked', value: leaguesWithData, color: 'text-emerald-600' },
    { label: 'Draft Eligible', value: draftEligible, color: 'text-amber-600' },
    { label: 'Avg Age', value: avgAge, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card px-4 py-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</div>
          <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
