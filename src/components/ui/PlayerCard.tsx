'use client';

import Link from 'next/link';
import { PlayerSearchResult } from '@/types';
import { positionColor, flagEmoji, formatPlusMinus, draftStatusLabel } from '@/lib/utils';

interface PlayerCardProps {
  player: PlayerSearchResult;
  rank?: number;
  /** compact = small inline row, full = visual card */
  variant?: 'full' | 'compact';
}

export default function PlayerCard({ player, rank, variant = 'full' }: PlayerCardProps) {
  if (variant === 'compact') return <CompactCard player={player} rank={rank} />;
  return <FullCard player={player} rank={rank} />;
}

function FullCard({ player, rank }: { player: PlayerSearchResult; rank?: number }) {
  const pctColor =
    (player.leaguePercentile ?? 0) >= 90 ? 'text-emerald-400' :
    (player.leaguePercentile ?? 0) >= 75 ? 'text-blue-400' :
    (player.leaguePercentile ?? 0) >= 50 ? 'text-amber-400' : 'text-slate-400';

  return (
    <Link
      href={`/players/${player.id}`}
      className="group relative card p-0 overflow-hidden hover:border-blue-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
    >
      {/* Accent bar */}
      <div className={`h-1 w-full ${
        player.position === 'D' ? 'bg-amber-500/60' :
        player.position === 'G' ? 'bg-purple-500/60' :
        'bg-blue-500/60'
      }`} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Position badge */}
            <div className={`w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center font-bold text-sm ${positionColor(player.position)}`}>
              {player.position}
            </div>
            <div>
              <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors leading-tight">
                {player.fullName}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-500">{flagEmoji(player.nationality)}</span>
                <span className="text-xs text-slate-500">Age {player.age}</span>
                <span className="text-slate-700 text-xs">|</span>
                <span className="text-xs text-slate-400">{player.leagueName}</span>
              </div>
            </div>
          </div>

          {rank !== undefined && (
            <span className="text-xs font-bold text-slate-600 font-mono">#{rank}</span>
          )}
        </div>

        {/* Team */}
        <div className="text-xs text-slate-500 mb-3 truncate">{player.teamName}</div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <StatCell label="G" value={player.goals} />
          <StatCell label="A" value={player.assists} />
          <StatCell label="P" value={player.points} highlight />
          <StatCell label="PPG" value={player.pointsPerGame.toFixed(2)} accent />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="badge badge-draft text-[10px]">
              {draftStatusLabel(player.draftStatus)}
            </span>
            {player.nhlRightsHolder && (
              <span className="text-[10px] text-purple-400 truncate max-w-[100px]">
                {player.nhlRightsHolder}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-600">Lg%</span>
            <span className={`text-xs font-bold font-mono ${pctColor}`}>
              {player.leaguePercentile ?? '-'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CompactCard({ player, rank }: { player: PlayerSearchResult; rank?: number }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors"
    >
      {rank !== undefined && (
        <span className="text-xs font-bold text-slate-600 font-mono w-6 text-right">{rank}</span>
      )}
      <span className={`text-xs font-bold w-6 text-center ${positionColor(player.position)}`}>
        {player.position}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate">
          {player.fullName}
        </div>
        <div className="text-[11px] text-slate-500">
          {player.teamName} <span className="text-slate-700">|</span> {player.leagueName}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-blue-400 font-mono">{player.pointsPerGame.toFixed(2)}</div>
        <div className="text-[10px] text-slate-500">{player.points}P in {player.gamesPlayed}GP</div>
      </div>
    </Link>
  );
}

function StatCell({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-lg font-bold font-mono leading-tight ${
          accent ? 'text-blue-400' : highlight ? 'text-slate-100' : 'text-slate-300'
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
