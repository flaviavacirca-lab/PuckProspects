'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';
import { flagEmoji, positionColor, formatPlusMinus, draftStatusLabel, getPercentileColor, getPercentileTextColor } from '@/lib/utils';
import PercentileBar from '@/components/ui/PercentileBar';

// Generate mock historical seasons for a player
function generateSeasonHistory(player: typeof ALL_MOCK_PLAYERS[0]) {
  const seasons = [];
  const currentPts = player.points;
  const currentGP = player.gamesPlayed;

  for (let i = 2; i >= 0; i--) {
    const yearStart = 2025 - i;
    const factor = 0.6 + (2 - i) * 0.2;
    const gp = Math.floor(currentGP * (0.8 + Math.random() * 0.3));
    const pts = Math.floor(currentPts * factor * (0.8 + Math.random() * 0.4));
    const g = Math.floor(pts * (player.goals / Math.max(player.points, 1)));
    const a = pts - g;
    seasons.push({
      season: `${yearStart}-${(yearStart + 1).toString().slice(2)}`,
      league: player.leagueName,
      team: player.teamName,
      gp,
      g,
      a,
      pts,
      ppg: gp > 0 ? (pts / gp).toFixed(2) : '0.00',
      plusMinus: Math.floor(Math.random() * 30) - 10,
    });
  }
  return seasons;
}

// Generate similar players
function findSimilarPlayers(player: typeof ALL_MOCK_PLAYERS[0]) {
  return ALL_MOCK_PLAYERS
    .filter(p => p.id !== player.id && p.position === player.position && Math.abs(p.age - player.age) <= 2)
    .sort((a, b) => Math.abs(a.pointsPerGame - player.pointsPerGame) - Math.abs(b.pointsPerGame - player.pointsPerGame))
    .slice(0, 5);
}

export default function PlayerProfilePage() {
  const params = useParams();
  const playerId = parseInt(params.id as string);

  const player = useMemo(() => ALL_MOCK_PLAYERS.find(p => p.id === playerId), [playerId]);

  if (!player) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl text-slate-400">Player not found</h2>
        <Link href="/" className="text-blue-400 text-sm mt-2 inline-block hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const seasons = generateSeasonHistory(player);
  const similar = findSimilarPlayers(player);

  return (
    <div className="max-w-[1200px] space-y-6">
      {/* Back link */}
      <Link href="/" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
        ← Back to dashboard
      </Link>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center">
              <span className={`text-2xl font-bold ${positionColor(player.position)}`}>
                {player.position}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">{player.fullName}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="badge badge-position">{player.position}</span>
                <span className="badge badge-league">{player.leagueName}</span>
                {player.nhlRightsHolder && (
                  <span className="badge badge-nhl">{player.nhlRightsHolder}</span>
                )}
                <span className="badge badge-draft">{draftStatusLabel(player.draftStatus)}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                <span>{flagEmoji(player.nationality)} {player.nationality}</span>
                <span>Age {player.age}</span>
                <span>{player.teamName}</span>
              </div>
            </div>
          </div>

          {/* Key metric */}
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-400">{player.pointsPerGame.toFixed(2)}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Points Per Game</div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Current season */}
        <div className="card p-5 col-span-2">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Current Season — {player.season}
          </h3>
          <div className="grid grid-cols-6 gap-4">
            {[
              { label: 'GP', value: player.gamesPlayed },
              { label: 'G', value: player.goals },
              { label: 'A', value: player.assists },
              { label: 'P', value: player.points },
              { label: 'PPG', value: player.pointsPerGame.toFixed(2) },
              { label: '+/-', value: formatPlusMinus(player.plusMinus) },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Percentiles */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Percentile Ranks
          </h3>
          <div className="space-y-3">
            <PercentileBar value={player.leaguePercentile} label="Lg" />
            <PercentileBar value={player.agePercentile} label="Age" />
            <PercentileBar value={Math.min(99, (player.leaguePercentile || 50) + Math.floor(Math.random() * 10) - 5)} label="Pos" />
          </div>
        </div>
      </div>

      {/* Season history */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Season History
        </h3>
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

      {/* Similar players */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Similar Players
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {similar.map((p) => (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="bg-slate-800/40 rounded-lg p-3 hover:bg-slate-800/70 transition-colors border border-slate-700/30"
            >
              <div className="font-medium text-sm text-slate-200">{p.fullName}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs ${positionColor(p.position)}`}>{p.position}</span>
                <span className="text-xs text-slate-500">Age {p.age}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">{p.leagueName}</span>
              </div>
              <div className="text-lg font-bold text-blue-400 mt-2">
                {p.pointsPerGame.toFixed(2)} <span className="text-xs text-slate-500">PPG</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
