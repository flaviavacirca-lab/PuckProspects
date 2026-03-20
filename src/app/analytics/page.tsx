'use client';

import { useMemo } from 'react';
import { usePlayersData } from '@/context/PlayersContext';
import { LEAGUES } from '@/lib/leagues';
import type { PlayerSearchResult, DraftStatus } from '@/types';
import { LoadingSpinner, ErrorState } from '@/components/ui/LoadingState';

// ── Helpers ──

const FLAG_MAP: Record<string, string> = {
  'Canada': '\u{1F1E8}\u{1F1E6}',
  'USA': '\u{1F1FA}\u{1F1F8}',
  'Sweden': '\u{1F1F8}\u{1F1EA}',
  'Finland': '\u{1F1EB}\u{1F1EE}',
  'Russia': '\u{1F1F7}\u{1F1FA}',
  'Czech Republic': '\u{1F1E8}\u{1F1FF}',
  'Switzerland': '\u{1F1E8}\u{1F1ED}',
  'Germany': '\u{1F1E9}\u{1F1EA}',
  'Slovakia': '\u{1F1F8}\u{1F1F0}',
  'Latvia': '\u{1F1F1}\u{1F1FB}',
  'Denmark': '\u{1F1E9}\u{1F1F0}',
  'Austria': '\u{1F1E6}\u{1F1F9}',
};

const TIER_COLORS: Record<number, string> = {
  1: 'bg-blue-500',
  2: 'bg-sky-400',
  3: 'bg-slate-500',
};

const TIER_TEXT_COLORS: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-sky-400',
  3: 'text-slate-400',
};

const POSITION_COLORS: Record<string, string> = {
  'C': 'bg-emerald-500',
  'LW': 'bg-cyan-500',
  'RW': 'bg-teal-500',
  'D': 'bg-amber-500',
  'G': 'bg-purple-500',
};

const POSITION_TEXT_COLORS: Record<string, string> = {
  'C': 'text-emerald-400',
  'LW': 'text-cyan-400',
  'RW': 'text-teal-400',
  'D': 'text-amber-400',
  'G': 'text-purple-400',
};

const DRAFT_COLORS: Record<string, string> = {
  'drafted': 'bg-blue-500',
  'undrafted': 'bg-slate-500',
  'draft_eligible': 'bg-amber-500',
  're_entry': 'bg-rose-500',
};

const DRAFT_LABELS: Record<string, string> = {
  'drafted': 'Drafted',
  'undrafted': 'Undrafted',
  'draft_eligible': 'Draft Eligible',
  're_entry': 'Re-Entry',
};

// ── Section Components ──

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main Component ──

export default function AnalyticsPage() {
  const { players, loading, error } = usePlayersData();

  // ── League Breakdown ──
  const leagueStats = useMemo(() => {
    const map = new Map<string, { code: string; name: string; tier: number; totalPpg: number; count: number }>();
    for (const p of players) {
      const existing = map.get(p.leagueCode);
      if (existing) {
        existing.totalPpg += p.pointsPerGame;
        existing.count += 1;
      } else {
        const league = LEAGUES.find(l => l.code === p.leagueCode);
        map.set(p.leagueCode, {
          code: p.leagueCode,
          name: p.leagueName,
          tier: league?.tier ?? 3,
          totalPpg: p.pointsPerGame,
          count: 1,
        });
      }
    }
    const result = Array.from(map.values()).map(l => ({
      ...l,
      avgPpg: Math.round((l.totalPpg / l.count) * 100) / 100,
    }));
    result.sort((a, b) => b.avgPpg - a.avgPpg);
    return result;
  }, [players]);

  const maxLeaguePpg = useMemo(() => Math.max(...leagueStats.map(l => l.avgPpg), 1), [leagueStats]);

  // ── Age Distribution ──
  const ageDistribution = useMemo(() => {
    const map = new Map<number, number>();
    for (const p of players) {
      map.set(p.age, (map.get(p.age) ?? 0) + 1);
    }
    const ages: { age: number; count: number }[] = [];
    for (let age = 16; age <= 26; age++) {
      ages.push({ age, count: map.get(age) ?? 0 });
    }
    return ages;
  }, [players]);

  const maxAgeCount = useMemo(() => Math.max(...ageDistribution.map(a => a.count), 1), [ageDistribution]);
  const peakAge = useMemo(() => ageDistribution.reduce((best, a) => a.count > best.count ? a : best, ageDistribution[0]).age, [ageDistribution]);

  // ── Nationality Breakdown ──
  const nationalityStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of players) {
      map.set(p.nationality, (map.get(p.nationality) ?? 0) + 1);
    }
    const total = players.length;
    const result = Array.from(map.entries())
      .map(([nationality, count]) => ({
        nationality,
        count,
        pct: Math.round((count / total) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return result;
  }, [players]);

  const maxNatCount = useMemo(() => nationalityStats[0]?.count ?? 1, [nationalityStats]);

  // ── Position Distribution ──
  const positionStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of players) {
      map.set(p.position, (map.get(p.position) ?? 0) + 1);
    }
    const order = ['C', 'LW', 'RW', 'D', 'G'];
    return order.map(pos => ({
      position: pos,
      count: map.get(pos) ?? 0,
      pct: Math.round(((map.get(pos) ?? 0) / players.length) * 1000) / 10,
    }));
  }, [players]);

  const totalPlayers = players.length;

  // ── Draft Status ──
  const draftStats = useMemo(() => {
    const map = new Map<DraftStatus, number>();
    for (const p of players) {
      map.set(p.draftStatus, (map.get(p.draftStatus) ?? 0) + 1);
    }
    const statuses: DraftStatus[] = ['drafted', 'undrafted', 'draft_eligible', 're_entry'];
    return statuses
      .map(status => ({
        status,
        count: map.get(status) ?? 0,
        pct: Math.round(((map.get(status) ?? 0) / players.length) * 1000) / 10,
      }))
      .filter(d => d.count > 0);
  }, [players]);

  const maxDraftCount = useMemo(() => Math.max(...draftStats.map(d => d.count), 1), [draftStats]);

  // ── Top Risers ──
  const topRisers = useMemo(() => {
    const skaters = players.filter(p => p.position !== 'G' && p.pointsPerGame >= 1.0);
    const sorted = [...skaters].sort((a, b) => b.pointsPerGame - a.pointsPerGame);
    return sorted.slice(0, 10);
  }, [players]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visual breakdowns across {totalPlayers} prospects -- 2025-26 season
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
            Tier 1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400" />
            Tier 2
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-500" />
            Tier 3
          </span>
        </div>
      </div>

      {/* Two-column grid for top sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Section 1: League Breakdown ── */}
        <SectionCard title="League Breakdown" subtitle="Average points-per-game by league">
          <div className="space-y-2.5">
            {leagueStats.map(league => (
              <div key={league.code} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-semibold uppercase ${TIER_TEXT_COLORS[league.tier] ?? 'text-slate-400'}`}>
                      {league.name}
                    </span>
                    <span className="text-[10px] text-slate-600">
                      {league.count} player{league.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    {league.avgPpg.toFixed(2)} PPG
                  </span>
                </div>
                <div className="h-5 w-full bg-slate-800/60 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all duration-700 ${TIER_COLORS[league.tier] ?? 'bg-slate-500'} opacity-80 group-hover:opacity-100`}
                    style={{ width: `${(league.avgPpg / maxLeaguePpg) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 2: Age Distribution ── */}
        <SectionCard title="Age Distribution" subtitle="Player counts by age (16-26)">
          <div className="flex items-end gap-1.5 h-48">
            {ageDistribution.map(({ age, count }) => {
              const isPeak = age === peakAge;
              const heightPct = maxAgeCount > 0 ? (count / maxAgeCount) * 100 : 0;
              return (
                <div key={age} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <span className={`text-[10px] font-mono mb-1 transition-colors ${isPeak ? 'text-emerald-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {count}
                  </span>
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${isPeak ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-blue-500/60 group-hover:bg-blue-500/80'}`}
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  />
                  <span className={`text-[10px] mt-1.5 font-mono ${isPeak ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {age}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Most common age: <span className="text-emerald-400 font-semibold">{peakAge}</span>
          </div>
        </SectionCard>

        {/* ── Section 3: Nationality Breakdown ── */}
        <SectionCard title="Nationality Breakdown" subtitle={`Top 10 out of ${new Set(players.map(p => p.nationality)).size} nationalities`}>
          <div className="space-y-2">
            {nationalityStats.map(({ nationality, count, pct }, i) => (
              <div key={nationality} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{FLAG_MAP[nationality] ?? '\u{1F3D2}'}</span>
                    <span className="text-sm text-slate-200 font-medium">{nationality}</span>
                    {i === 0 && (
                      <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-medium">
                        #1
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-300">{count}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">({pct}%)</span>
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-800/60 rounded overflow-hidden">
                  <div
                    className="h-full rounded bg-gradient-to-r from-blue-500 to-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ width: `${(count / maxNatCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 4: Position Distribution ── */}
        <SectionCard title="Position Distribution" subtitle="Skater and goaltender breakdown">
          {/* Ring-like segmented bar */}
          <div className="relative mb-6">
            <div className="h-8 w-full rounded-full overflow-hidden flex bg-slate-800/60">
              {positionStats.map(({ position, pct }) => (
                <div
                  key={position}
                  className={`${POSITION_COLORS[position]} opacity-80 hover:opacity-100 transition-opacity duration-200 relative group`}
                  style={{ width: `${pct}%` }}
                  title={`${position}: ${pct}%`}
                >
                  {pct > 8 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-white/90">
                      {position}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Position detail bars */}
          <div className="space-y-3">
            {positionStats.map(({ position, count, pct }) => (
              <div key={position} className="flex items-center gap-3">
                <span className={`w-8 text-sm font-bold font-mono ${POSITION_TEXT_COLORS[position]}`}>
                  {position}
                </span>
                <div className="flex-1 h-4 bg-slate-800/60 rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${POSITION_COLORS[position]} opacity-70`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="text-xs font-mono text-slate-300">{count}</span>
                  <span className="text-[10px] text-slate-500 ml-1">({pct}%)</span>
                </div>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div className="mt-4 pt-3 border-t border-slate-700/40 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-emerald-400">
                {positionStats.filter(p => ['C', 'LW', 'RW'].includes(p.position)).reduce((s, p) => s + p.count, 0)}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Forwards</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-400">
                {positionStats.find(p => p.position === 'D')?.count ?? 0}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Defense</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">
                {positionStats.find(p => p.position === 'G')?.count ?? 0}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Goalies</div>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 5: Draft Status ── */}
        <SectionCard title="Draft Status" subtitle="Breakdown by current draft eligibility">
          {/* Stacked bar overview */}
          <div className="h-6 w-full rounded-full overflow-hidden flex bg-slate-800/60 mb-5">
            {draftStats.map(({ status, pct }) => (
              <div
                key={status}
                className={`${DRAFT_COLORS[status]} opacity-80 hover:opacity-100 transition-opacity duration-200`}
                style={{ width: `${pct}%` }}
                title={`${DRAFT_LABELS[status]}: ${pct}%`}
              />
            ))}
          </div>
          {/* Detail rows */}
          <div className="space-y-3">
            {draftStats.map(({ status, count, pct }) => (
              <div key={status} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-sm ${DRAFT_COLORS[status]}`} />
                    <span className="text-sm text-slate-200">{DRAFT_LABELS[status]}</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-300">{count}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">({pct}%)</span>
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-800/60 rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${DRAFT_COLORS[status]} opacity-70 group-hover:opacity-100 transition-opacity duration-300`}
                    style={{ width: `${(count / maxDraftCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Section 6: Top Risers ── */}
        <SectionCard title="Top Risers" subtitle="Highest-performing prospects trending up">
          <div className="space-y-1.5">
            {topRisers.map((player, i) => (
              <div
                key={player.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors group"
              >
                <span className="w-6 text-center text-xs font-mono text-slate-600 font-bold">
                  {i + 1}
                </span>
                <div className="flex items-center gap-1.5 text-emerald-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                      {player.fullName}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${POSITION_TEXT_COLORS[player.position] ?? 'text-slate-400'}`}>
                      {player.position}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {player.teamName} &middot; {player.leagueName}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-bold text-emerald-400">
                    {player.pointsPerGame.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500">PPG</div>
                </div>
                {/* Mini sparkline bar */}
                <div className="w-16 h-3 bg-slate-800/60 rounded overflow-hidden shrink-0">
                  <div
                    className="h-full rounded bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-80"
                    style={{ width: `${Math.min((player.pointsPerGame / 2) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
