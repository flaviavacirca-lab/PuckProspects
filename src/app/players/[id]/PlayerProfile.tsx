'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { usePlayersData } from '@/context/PlayersContext';
import { flagEmoji, positionColor, formatPlusMinus, draftStatusLabel } from '@/lib/utils';
import PercentileBar from '@/components/ui/PercentileBar';
import PlayerCard from '@/components/ui/PlayerCard';
import { LoadingSpinner, ErrorState } from '@/components/ui/LoadingState';
import { PlayerSearchResult } from '@/types';

// Deterministic pseudo-random from player ID for consistent season history
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSeasonHistory(player: PlayerSearchResult) {
  const rand = seededRandom(player.id * 31);
  const seasons = [];

  for (let i = 2; i >= 0; i--) {
    const yearStart = 2025 - i;
    const factor = 0.5 + (2 - i) * 0.25;
    const gp = Math.floor(player.gamesPlayed * (0.75 + rand() * 0.35));
    const pts = Math.max(1, Math.floor(player.points * factor * (0.7 + rand() * 0.5)));
    const g = Math.max(0, Math.floor(pts * (player.goals / Math.max(player.points, 1))));
    const a = pts - g;
    seasons.push({
      season: `${yearStart}-${(yearStart + 1).toString().slice(2)}`,
      league: player.leagueName,
      team: player.teamName,
      gp, g, a, pts,
      ppg: gp > 0 ? (pts / gp).toFixed(2) : '0.00',
      plusMinus: Math.floor(rand() * 30) - 10,
    });
  }
  return seasons;
}

function findSimilarPlayers(player: PlayerSearchResult, allPlayers: PlayerSearchResult[]) {
  return allPlayers
    .filter(p => p.id !== player.id && p.position === player.position && Math.abs(p.age - player.age) <= 2)
    .sort((a, b) => Math.abs(a.pointsPerGame - player.pointsPerGame) - Math.abs(b.pointsPerGame - player.pointsPerGame))
    .slice(0, 4);
}

export default function PlayerProfile() {
  const { players: allPlayers, loading, error } = usePlayersData();
  const params = useParams();
  const playerId = parseInt(params.id as string);

  const player = useMemo(() => allPlayers.find(p => p.id === playerId), [playerId, allPlayers]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  if (!player) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-slate-400">Player not found</h2>
        <Link href="/" className="text-blue-400 text-sm mt-2 inline-block hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  const seasons = generateSeasonHistory(player);
  const similar = findSimilarPlayers(player, allPlayers);

  return (
    <div className="max-w-[1100px] space-y-6">
      {/* Back */}
      <Link href="/" className="text-sm text-slate-500 hover:text-blue-400 transition-colors inline-flex items-center gap-1">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </Link>

      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className={`h-1.5 w-full ${
          player.position === 'D' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
          player.position === 'G' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
          'bg-gradient-to-r from-blue-500 to-blue-600'
        }`} />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-5">
              <div className={`w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center font-bold text-xl ${positionColor(player.position)}`}>
                {player.position}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100">{player.fullName}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="badge badge-position">{player.position}</span>
                  <span className="badge badge-league">{player.leagueName}</span>
                  {player.nhlRightsHolder && <span className="badge badge-nhl">{player.nhlRightsHolder}</span>}
                  <span className="badge badge-draft">{draftStatusLabel(player.draftStatus)}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                  <span>{flagEmoji(player.nationality)} {player.nationality}</span>
                  <span className="text-slate-700">|</span>
                  <span>Age {player.age}</span>
                  <span className="text-slate-700">|</span>
                  <span>{player.teamName}</span>
                </div>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-4xl font-bold text-blue-400">{player.pointsPerGame.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Points Per Game</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats + Percentiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Current Season — {player.season}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { label: 'GP', value: player.gamesPlayed, color: '' },
              { label: 'G', value: player.goals, color: '' },
              { label: 'A', value: player.assists, color: '' },
              { label: 'P', value: player.points, color: 'text-slate-100' },
              { label: 'PPG', value: player.pointsPerGame.toFixed(2), color: 'text-blue-400' },
              { label: '+/-', value: formatPlusMinus(player.plusMinus), color: player.plusMinus !== null && player.plusMinus > 0 ? 'text-emerald-400' : player.plusMinus !== null && player.plusMinus < 0 ? 'text-red-400' : '' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`text-2xl font-bold font-mono ${stat.color || 'text-slate-200'}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Percentile Ranks
          </h3>
          <div className="space-y-4">
            <PercentileBar value={player.leaguePercentile} label="League" />
            <PercentileBar value={player.agePercentile} label="Age Grp" />
          </div>
        </div>
      </div>

      {/* Season history */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Season History
        </h3>
        <div className="overflow-x-auto">
          <table className="stat-table">
            <thead>
              <tr>
                <th>Season</th>
                <th>League</th>
                <th>Team</th>
                <th className="text-right">GP</th>
                <th className="text-right">G</th>
                <th className="text-right">A</th>
                <th className="text-right">P</th>
                <th className="text-right">PPG</th>
                <th className="text-right">+/-</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.season}>
                  <td className="font-mono text-slate-300">{s.season}</td>
                  <td><span className="badge badge-league text-[10px]">{s.league}</span></td>
                  <td className="text-sm text-slate-400">{s.team}</td>
                  <td className="text-right font-mono">{s.gp}</td>
                  <td className="text-right font-mono">{s.g}</td>
                  <td className="text-right font-mono">{s.a}</td>
                  <td className="text-right font-mono font-bold">{s.pts}</td>
                  <td className="text-right font-mono text-blue-400">{s.ppg}</td>
                  <td className="text-right font-mono">
                    <span className={s.plusMinus > 0 ? 'text-emerald-400' : s.plusMinus < 0 ? 'text-red-400' : ''}>
                      {formatPlusMinus(s.plusMinus)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Similar players */}
      {similar.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Similar Players
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similar.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
