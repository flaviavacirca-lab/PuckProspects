'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import { usePlayersData } from '@/context/PlayersContext';
import { flagEmoji, positionColor, formatPlusMinus, draftStatusLabel, getPercentileColor } from '@/lib/utils';
import PercentileBar from '@/components/ui/PercentileBar';
import PlayerCard from '@/components/ui/PlayerCard';
import { LoadingSpinner, ErrorState } from '@/components/ui/LoadingState';
import { PlayerSearchResult } from '@/types';

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
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
    seasons.push({
      season: `${yearStart}-${(yearStart + 1).toString().slice(2)}`,
      league: player.leagueName, team: player.teamName,
      gp, g, a: pts - g, pts,
      ppg: gp > 0 ? (pts / gp).toFixed(2) : '0.00',
      plusMinus: Math.floor(rand() * 30) - 10,
    });
  }
  return seasons;
}

export default function PlayerProfile() {
  const { players, loading, error } = usePlayersData();
  const params = useParams();
  const playerId = parseInt(params.id as string);
  const player = useMemo(() => players.find(p => p.id === playerId), [playerId, players]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!player) return (
    <div className="text-center py-20">
      <h2 className="text-xl text-gray-400">Player not found</h2>
      <Link href="/" className="text-blue-500 text-sm mt-2 inline-block hover:underline">Back to dashboard</Link>
    </div>
  );

  const seasons = generateSeasonHistory(player);
  const similar = players
    .filter(p => p.id !== player.id && p.position === player.position && Math.abs(p.age - player.age) <= 2)
    .sort((a, b) => Math.abs(a.pointsPerGame - player.pointsPerGame) - Math.abs(b.pointsPerGame - player.pointsPerGame))
    .slice(0, 4);

  return (
    <div className="max-w-[1000px] space-y-6">
      <Link href="/" className="text-sm text-gray-400 hover:text-blue-500 transition-colors inline-flex items-center gap-1">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </Link>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className={`h-1.5 w-full ${player.position === 'D' ? 'bg-amber-400' : player.position === 'G' ? 'bg-violet-400' : 'bg-blue-500'}`} />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-lg ${positionColor(player.position)}`}>
                {player.position}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{player.fullName}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="badge badge-position">{player.position}</span>
                  <span className="badge badge-league">{player.leagueName}</span>
                  {player.nhlRightsHolder && <span className="badge badge-nhl">{player.nhlRightsHolder}</span>}
                  <span className="badge badge-draft">{draftStatusLabel(player.draftStatus)}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span>{flagEmoji(player.nationality)} {player.nationality}</span>
                  <span className="text-gray-300">·</span>
                  <span>Age {player.age}</span>
                  <span className="text-gray-300">·</span>
                  <span>{player.teamName}</span>
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-3xl font-bold text-blue-600">{player.pointsPerGame.toFixed(2)}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">PPG</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats + percentiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Current Season</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { label: 'GP', value: player.gamesPlayed },
              { label: 'G', value: player.goals },
              { label: 'A', value: player.assists },
              { label: 'P', value: player.points, bold: true },
              { label: 'PPG', value: player.pointsPerGame.toFixed(2), accent: true },
              { label: '+/-', value: formatPlusMinus(player.plusMinus), green: (player.plusMinus ?? 0) > 0, red: (player.plusMinus ?? 0) < 0 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className={`text-xl font-bold font-mono ${s.accent ? 'text-blue-600' : s.bold ? 'text-gray-900' : s.green ? 'text-emerald-600' : s.red ? 'text-red-500' : 'text-gray-600'}`}>
                  {s.value}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Percentiles</h3>
          <div className="space-y-4">
            <PercentileBar value={player.leaguePercentile} label="League" />
            <PercentileBar value={player.agePercentile} label="Age Grp" />
          </div>
        </div>
      </div>

      {/* Season history */}
      <div className="card p-5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Season History</h3>
        <div className="overflow-x-auto">
          <table className="stat-table">
            <thead>
              <tr>
                <th>Season</th><th>League</th><th>Team</th>
                <th className="text-right">GP</th><th className="text-right">G</th><th className="text-right">A</th>
                <th className="text-right">P</th><th className="text-right">PPG</th><th className="text-right">+/-</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.season}>
                  <td className="font-mono text-gray-700">{s.season}</td>
                  <td><span className="badge badge-league text-[10px]">{s.league}</span></td>
                  <td className="text-sm text-gray-500">{s.team}</td>
                  <td className="text-right font-mono">{s.gp}</td>
                  <td className="text-right font-mono">{s.g}</td>
                  <td className="text-right font-mono">{s.a}</td>
                  <td className="text-right font-mono font-bold">{s.pts}</td>
                  <td className="text-right font-mono text-blue-600">{s.ppg}</td>
                  <td className="text-right font-mono">
                    <span className={s.plusMinus > 0 ? 'text-emerald-600' : s.plusMinus < 0 ? 'text-red-500' : ''}>{formatPlusMinus(s.plusMinus)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Similar Players</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {similar.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
