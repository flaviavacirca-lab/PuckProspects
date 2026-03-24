'use client';

import { useMemo } from 'react';
import { PlayerSearchResult } from '@/types';

interface StatsSummaryProps {
  players: PlayerSearchResult[];
}

export default function StatsSummary({ players }: StatsSummaryProps) {
  const skaters = players.filter(p => p.position !== 'G');
  const leagues = new Set(players.map(p => p.leagueCode)).size;
  const countries = new Set(players.map(p => p.nationality)).size;
  const draftEligible = players.filter(p => p.draftStatus === 'draft_eligible').length;
  const avgPpg = skaters.length > 0
    ? (skaters.reduce((s, p) => s + p.pointsPerGame, 0) / skaters.length).toFixed(2)
    : '0.00';

  const leagueAvgs = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    for (const p of skaters) {
      const entry = map.get(p.leagueCode) || { name: p.leagueName, total: 0, count: 0 };
      entry.total += p.pointsPerGame;
      entry.count++;
      map.set(p.leagueCode, entry);
    }
    return Array.from(map.values())
      .map(e => ({ name: e.name, avg: e.total / e.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);
  }, [skaters]);

  const maxAvg = leagueAvgs.length > 0 ? Math.max(...leagueAvgs.map(l => l.avg)) : 1;

  const cards = [
    { label: 'Prospects', value: players.length, sub: `${countries} countries`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Leagues', value: leagues, sub: 'tracked', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Draft Eligible', value: draftEligible, sub: 'upcoming', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg PPG', value: avgPpg, sub: 'all skaters', color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card px-4 py-4">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${c.bg}`}>
                <div className={`w-2 h-2 rounded-full ${c.color.replace('text-', 'bg-')}`} />
              </div>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{c.label}</span>
            </div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* League PPG bar chart */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Avg PPG by League
        </h3>
        <div className="space-y-2.5">
          {leagueAvgs.map((l) => (
            <div key={l.name} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-14 text-right font-medium shrink-0">{l.name}</span>
              <div className="flex-1 h-5 bg-gray-50 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded transition-all duration-700"
                  style={{ width: `${(l.avg / maxAvg) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-gray-700 w-10 text-right">{l.avg.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
