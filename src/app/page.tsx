'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePlayersData } from '@/context/PlayersContext';
import { LoadingSpinner, ErrorState } from '@/components/ui/LoadingState';
import StatsSummary from '@/components/ui/StatsSummary';
import PlayerCard from '@/components/ui/PlayerCard';
import { PlayerSearchResult } from '@/types';

export default function DashboardPage() {
  const { players, loading, error } = usePlayersData();

  const topPerformers = useMemo(() =>
    [...players].filter(p => p.position !== 'G' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame).slice(0, 8),
    [players],
  );

  const draftEligible = useMemo(() =>
    [...players].filter(p => p.draftStatus === 'draft_eligible' && p.position !== 'G')
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame).slice(0, 6),
    [players],
  );

  const youngStandouts = useMemo(() =>
    [...players].filter(p => p.age <= 18 && p.position !== 'G' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame).slice(0, 6),
    [players],
  );

  const topDefensemen = useMemo(() =>
    [...players].filter(p => p.position === 'D' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame).slice(0, 6),
    [players],
  );

  const leagueLeaders = useMemo(() => {
    const map = new Map<string, PlayerSearchResult>();
    const sorted = [...players].filter(p => p.position !== 'G' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame);
    for (const p of sorted) if (!map.has(p.leagueCode)) map.set(p.leagueCode, p);
    return Array.from(map.values()).slice(0, 10);
  }, [players]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-[1300px]">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prospect Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Cross-league analytics — 2025-26 season</p>
      </div>

      <StatsSummary players={players} />

      <Section title="Top Performers" subtitle="Highest PPG with 20+ games" href="/rankings">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topPerformers.map((p, i) => <PlayerCard key={p.id} player={p} rank={i + 1} />)}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Draft Eligible" subtitle="Top upcoming prospects">
          <div className="card divide-y divide-gray-100">
            {draftEligible.map((p, i) => <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />)}
          </div>
        </Section>
        <Section title="Young Standouts" subtitle="Age 18 and under">
          <div className="card divide-y divide-gray-100">
            {youngStandouts.map((p, i) => <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />)}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Top Defensemen" subtitle="Highest-scoring D">
          <div className="card divide-y divide-gray-100">
            {topDefensemen.map((p, i) => <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />)}
          </div>
        </Section>
        <Section title="League Leaders" subtitle="Best prospect per league">
          <div className="card divide-y divide-gray-100">
            {leagueLeaders.map((p, i) => <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />)}
          </div>
        </Section>
      </div>

      <div className="text-center py-4">
        <Link href="/rankings" className="btn-primary">
          View all {players.length} prospects →
        </Link>
      </div>
    </div>
  );
}

function Section({ title, subtitle, href, children }: { title: string; subtitle: string; href?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        {href && <Link href={href} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">View all →</Link>}
      </div>
      {children}
    </section>
  );
}
