'use client';

import Link from 'next/link';
import { PlayerSearchResult } from '@/types';
import { flagEmoji, positionColor, formatPlusMinus, draftStatusLabel, getPercentileColor, getPercentileTextColor } from '@/lib/utils';
import type { SortField } from '@/lib/utils';

interface PlayerTableProps {
  players: PlayerSearchResult[];
  sortField: SortField;
  sortDir: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  onAddToWatchlist?: (playerId: number) => void;
  page: number;
  pageSize: number;
}

const COLUMNS: { key: SortField | 'rank' | 'league' | 'team' | 'nationality' | 'draftStatus' | 'nhlRights'; label: string; sortable: boolean; align?: string }[] = [
  { key: 'rank', label: '#', sortable: false },
  { key: 'fullName', label: 'Player', sortable: true },
  { key: 'age', label: 'Age', sortable: true, align: 'center' },
  { key: 'nationality', label: 'Nat', sortable: false, align: 'center' },
  { key: 'league', label: 'League', sortable: false },
  { key: 'team', label: 'Team', sortable: false },
  { key: 'gamesPlayed', label: 'GP', sortable: true, align: 'right' },
  { key: 'goals', label: 'G', sortable: true, align: 'right' },
  { key: 'assists', label: 'A', sortable: true, align: 'right' },
  { key: 'points', label: 'P', sortable: true, align: 'right' },
  { key: 'pointsPerGame', label: 'PPG', sortable: true, align: 'right' },
  { key: 'plusMinus', label: '+/-', sortable: true, align: 'right' },
  { key: 'leaguePercentile', label: 'Lg%', sortable: true, align: 'center' },
  { key: 'agePercentile', label: 'Age%', sortable: true, align: 'center' },
  { key: 'draftStatus', label: 'Draft', sortable: false },
  { key: 'nhlRights', label: 'NHL Rights', sortable: false },
];

export default function PlayerTable({ players, sortField, sortDir, onSort, page, pageSize }: PlayerTableProps) {
  const start = (page - 1) * pageSize;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="stat-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key as SortField)}
                  className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.sortable ? 'cursor-pointer hover:text-slate-200' : ''}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortField === col.key && (
                      <span className="text-blue-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((player, idx) => (
              <tr key={player.id}>
                <td className="text-slate-500 font-mono text-xs">{start + idx + 1}</td>
                <td>
                  <Link href={`/players/${player.id}`} className="group flex items-center gap-2">
                    <span className={`text-xs font-bold w-7 text-center ${positionColor(player.position)}`}>
                      {player.position}
                    </span>
                    <span className="font-medium text-slate-100 group-hover:text-blue-400 transition-colors">
                      {player.fullName}
                    </span>
                  </Link>
                </td>
                <td className="text-center font-mono">{player.age}</td>
                <td className="text-center" title={player.nationality}>
                  {flagEmoji(player.nationality) || player.nationality.substring(0, 3)}
                </td>
                <td>
                  <span className="badge badge-league">{player.leagueName}</span>
                </td>
                <td className="text-slate-300 text-xs">{player.teamName}</td>
                <td className="text-right font-mono">{player.gamesPlayed}</td>
                <td className="text-right font-mono font-medium">{player.goals}</td>
                <td className="text-right font-mono">{player.assists}</td>
                <td className="text-right font-mono font-bold text-slate-100">{player.points}</td>
                <td className="text-right font-mono text-blue-400 font-medium">{player.pointsPerGame.toFixed(2)}</td>
                <td className="text-right font-mono">
                  <span className={player.plusMinus !== null && player.plusMinus > 0 ? 'text-emerald-400' : player.plusMinus !== null && player.plusMinus < 0 ? 'text-red-400' : 'text-slate-400'}>
                    {formatPlusMinus(player.plusMinus)}
                  </span>
                </td>
                <td className="text-center">
                  <PercentileDot value={player.leaguePercentile} />
                </td>
                <td className="text-center">
                  <PercentileDot value={player.agePercentile} />
                </td>
                <td>
                  <span className="badge badge-draft text-[10px]">
                    {draftStatusLabel(player.draftStatus)}
                  </span>
                </td>
                <td className="text-xs text-slate-400 max-w-[120px] truncate" title={player.nhlRightsHolder || ''}>
                  {player.nhlRightsHolder || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PercentileDot({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-600">-</span>;
  return (
    <span className={`inline-flex items-center justify-center w-8 h-5 rounded text-[10px] font-bold ${
      value >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
      value >= 75 ? 'bg-blue-500/20 text-blue-400' :
      value >= 50 ? 'bg-amber-500/20 text-amber-400' :
      value >= 25 ? 'bg-orange-500/20 text-orange-400' :
      'bg-red-500/20 text-red-400'
    }`}>
      {value}
    </span>
  );
}
