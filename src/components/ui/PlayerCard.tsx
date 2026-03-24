'use client';

import Link from 'next/link';
import { PlayerSearchResult } from '@/types';
import { positionColor, flagEmoji, draftStatusLabel } from '@/lib/utils';

interface PlayerCardProps {
  player: PlayerSearchResult;
  rank?: number;
  variant?: 'full' | 'compact';
}

export default function PlayerCard({ player, rank, variant = 'full' }: PlayerCardProps) {
  if (variant === 'compact') return <CompactCard player={player} rank={rank} />;
  return <FullCard player={player} rank={rank} />;
}

function FullCard({ player, rank }: { player: PlayerSearchResult; rank?: number }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="group card p-0 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all duration-200"
    >
      <div className={`h-1 w-full ${
        player.position === 'D' ? 'bg-amber-400' :
        player.position === 'G' ? 'bg-violet-400' : 'bg-blue-500'
      }`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-xs ${positionColor(player.position)}`}>
              {player.position}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors leading-tight">
                {player.fullName}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {flagEmoji(player.nationality)} {player.leagueName}
                <span className="mx-1 text-gray-300">·</span>Age {player.age}
              </div>
            </div>
          </div>
          {rank !== undefined && (
            <span className="text-[11px] font-bold text-gray-300 font-mono">#{rank}</span>
          )}
        </div>

        <div className="text-xs text-gray-400 mb-3 truncate">{player.teamName}</div>

        <div className="grid grid-cols-4 gap-1 mb-3">
          <Stat label="G" value={player.goals} />
          <Stat label="A" value={player.assists} />
          <Stat label="P" value={player.points} bold />
          <Stat label="PPG" value={player.pointsPerGame.toFixed(2)} accent />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="badge badge-draft text-[10px]">{draftStatusLabel(player.draftStatus)}</span>
          {player.nhlRightsHolder && (
            <span className="text-[10px] text-violet-500 truncate max-w-[90px]">{player.nhlRightsHolder}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function CompactCard({ player, rank }: { player: PlayerSearchResult; rank?: number }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="group flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 transition-colors"
    >
      {rank !== undefined && (
        <span className="text-xs font-bold text-gray-300 font-mono w-5 text-right">{rank}</span>
      )}
      <span className={`text-xs font-bold w-6 text-center ${positionColor(player.position)}`}>
        {player.position}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors truncate">
          {player.fullName}
        </div>
        <div className="text-[11px] text-gray-400">
          {player.teamName} <span className="text-gray-300">·</span> {player.leagueName}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-blue-600 font-mono">{player.pointsPerGame.toFixed(2)}</div>
        <div className="text-[10px] text-gray-400">{player.points}P / {player.gamesPlayed}GP</div>
      </div>
    </Link>
  );
}

function Stat({ label, value, bold, accent }: { label: string; value: string | number; bold?: boolean; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className={`text-base font-bold font-mono leading-tight ${accent ? 'text-blue-600' : bold ? 'text-gray-900' : 'text-gray-600'}`}>
        {value}
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
