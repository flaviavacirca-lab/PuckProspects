'use client';

import { PlayerSearchResult } from '@/types';

interface StatsSummaryProps {
  players: PlayerSearchResult[];
}

export default function StatsSummary({ players }: StatsSummaryProps) {
  const totalPlayers = players.length;
  const skaters = players.filter(p => p.position !== 'G');
  const leagues = new Set(players.map(p => p.leagueCode)).size;
  const countries = new Set(players.map(p => p.nationality)).size;
  const draftEligible = players.filter(p => p.draftStatus === 'draft_eligible').length;
  const avgPpg = skaters.length > 0
    ? (skaters.reduce((s, p) => s + p.pointsPerGame, 0) / skaters.length).toFixed(2)
    : '0.00';
  const avgAge = players.length > 0
    ? (players.reduce((s, p) => s + p.age, 0) / players.length).toFixed(1)
    : '-';

  const cards = [
    { label: 'Prospects', value: totalPlayers, sub: `${countries} nationalities`, color: 'from-blue-500/20 to-blue-500/5', accent: 'text-blue-400' },
    { label: 'Leagues', value: leagues, sub: 'tracked globally', color: 'from-emerald-500/20 to-emerald-500/5', accent: 'text-emerald-400' },
    { label: 'Draft Eligible', value: draftEligible, sub: `of ${totalPlayers} total`, color: 'from-amber-500/20 to-amber-500/5', accent: 'text-amber-400' },
    { label: 'Avg PPG', value: avgPpg, sub: `avg age ${avgAge}`, color: 'from-purple-500/20 to-purple-500/5', accent: 'text-purple-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`card p-4 bg-gradient-to-br ${c.color}`}>
          <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">{c.label}</div>
          <div className={`text-3xl font-bold mt-1 ${c.accent}`}>{c.value}</div>
          <div className="text-[11px] text-slate-500 mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
