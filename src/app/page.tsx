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
    [...players]
      .filter(p => p.position !== 'G' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
      .slice(0, 8),
    [players],
  );

  const topDraftEligible = useMemo(() =>
    [...players]
      .filter(p => p.draftStatus === 'draft_eligible' && p.position !== 'G')
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
      .slice(0, 6),
    [players],
  );

  const youngStandouts = useMemo(() =>
    [...players]
      .filter(p => p.age <= 18 && p.position !== 'G' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
      .slice(0, 6),
    [players],
  );

  const topDefensemen = useMemo(() =>
    [...players]
      .filter(p => p.position === 'D' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
      .slice(0, 6),
    [players],
  );

  const leagueLeaders = useMemo(() => {
    const leagueMap = new Map<string, PlayerSearchResult>();
    const sorted = [...players]
      .filter(p => p.position !== 'G' && p.gamesPlayed >= 20)
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame);
    for (const p of sorted) {
      if (!leagueMap.has(p.leagueCode)) leagueMap.set(p.leagueCode, p);
    }
    return Array.from(leagueMap.values()).slice(0, 10);
  }, [players]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Hero header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Prospect Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cross-league prospect analytics — 2025-26 season
        </p>
      </div>

      {/* Stats summary */}
      <StatsSummary players={players} />

      {/* Top performers — hero section */}
      <Section
        title="Top Performers"
        subtitle="Highest PPG among prospects with 20+ games"
        href="/rankings"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topPerformers.map((p, i) => (
            <PlayerCard key={p.id} player={p} rank={i + 1} />
          ))}
        </div>
      </Section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Draft eligible */}
        <Section title="Draft Eligible" subtitle="Top upcoming draft prospects">
          <div className="card divide-y divide-slate-800/50">
            {topDraftEligible.map((p, i) => (
              <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />
            ))}
          </div>
        </Section>

        {/* Young standouts */}
        <Section title="Young Standouts" subtitle="Top performers age 18 and under">
          <div className="card divide-y divide-slate-800/50">
            {youngStandouts.map((p, i) => (
              <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />
            ))}
          </div>
        </Section>
      </div>

      {/* Two-column: defensemen + league leaders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Top Defensemen" subtitle="Highest-scoring D prospects">
          <div className="card divide-y divide-slate-800/50">
            {topDefensemen.map((p, i) => (
              <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />
            ))}
          </div>
        </Section>

        <Section title="League Leaders" subtitle="Top prospect from each league">
          <div className="card divide-y divide-slate-800/50">
            {leagueLeaders.map((p, i) => (
              <PlayerCard key={p.id} player={p} rank={i + 1} variant="compact" />
            ))}
          </div>
        </Section>
      </div>

      {/* CTA to full list */}
      <div className="text-center py-4">
        <Link
          href="/rankings"
          className="btn-primary inline-flex items-center gap-2"
        >
          View all {players.length} prospects
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {href && (
          <Link href={href} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}
