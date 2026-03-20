'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { usePlayersData } from '@/context/PlayersContext';
import { flagEmoji, positionColor, formatPlusMinus, getPercentileColor } from '@/lib/utils';
import PercentileBar from '@/components/ui/PercentileBar';
import { PlayerSearchResult } from '@/types';
import { LoadingSpinner, ErrorState } from '@/components/ui/LoadingState';

const MAX_PLAYERS = 4;

type StatKey = 'gamesPlayed' | 'goals' | 'assists' | 'points' | 'pointsPerGame' | 'plusMinus' | 'leaguePercentile' | 'agePercentile';

interface StatDef {
  key: StatKey;
  label: string;
  shortLabel: string;
  format: (v: number | null) => string;
  higherIsBetter: boolean;
}

const STAT_DEFS: StatDef[] = [
  { key: 'gamesPlayed', label: 'Games Played', shortLabel: 'GP', format: (v) => v?.toString() ?? '-', higherIsBetter: true },
  { key: 'goals', label: 'Goals', shortLabel: 'G', format: (v) => v?.toString() ?? '-', higherIsBetter: true },
  { key: 'assists', label: 'Assists', shortLabel: 'A', format: (v) => v?.toString() ?? '-', higherIsBetter: true },
  { key: 'points', label: 'Points', shortLabel: 'P', format: (v) => v?.toString() ?? '-', higherIsBetter: true },
  { key: 'pointsPerGame', label: 'Points Per Game', shortLabel: 'PPG', format: (v) => v?.toFixed(2) ?? '-', higherIsBetter: true },
  { key: 'plusMinus', label: 'Plus/Minus', shortLabel: '+/-', format: (v) => formatPlusMinus(v), higherIsBetter: true },
  { key: 'leaguePercentile', label: 'League Percentile', shortLabel: 'Lg%', format: (v) => v !== null ? `${v}` : '-', higherIsBetter: true },
  { key: 'agePercentile', label: 'Age Percentile', shortLabel: 'Age%', format: (v) => v !== null ? `${v}` : '-', higherIsBetter: true },
];

const BAR_CHART_STATS: { key: StatKey; label: string }[] = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'points', label: 'Points' },
  { key: 'pointsPerGame', label: 'PPG' },
];

const PLAYER_COLORS = [
  { bg: 'bg-blue-500', text: 'text-blue-400', bar: 'bg-blue-500', border: 'border-blue-500/40' },
  { bg: 'bg-emerald-500', text: 'text-emerald-400', bar: 'bg-emerald-500', border: 'border-emerald-500/40' },
  { bg: 'bg-amber-500', text: 'text-amber-400', bar: 'bg-amber-500', border: 'border-amber-500/40' },
  { bg: 'bg-purple-500', text: 'text-purple-400', bar: 'bg-purple-500', border: 'border-purple-500/40' },
];

function getBestIndex(players: PlayerSearchResult[], key: StatKey): number {
  let bestIdx = -1;
  let bestVal = -Infinity;
  players.forEach((p, i) => {
    const val = p[key];
    if (val !== null && val !== undefined && (val as number) > bestVal) {
      bestVal = val as number;
      bestIdx = i;
    }
  });
  return bestIdx;
}

export default function ComparePage() {
  const { players: allPlayers, loading, error } = usePlayersData();
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const selectedIds = new Set(selectedPlayers.map((p: PlayerSearchResult) => p.id));
    return allPlayers
      .filter((p) =>
        !selectedIds.has(p.id) &&
        (p.fullName.toLowerCase().includes(q) ||
         p.teamName.toLowerCase().includes(q) ||
         p.leagueName.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [searchQuery, selectedPlayers]);

  function addPlayer(player: PlayerSearchResult) {
    if (selectedPlayers.length >= MAX_PLAYERS) return;
    setSelectedPlayers((prev: PlayerSearchResult[]) => [...prev, player]);
    setSearchQuery('');
    setShowDropdown(false);
  }

  function removePlayer(id: number) {
    setSelectedPlayers((prev: PlayerSearchResult[]) => prev.filter((p: PlayerSearchResult) => p.id !== id));
  }

  function clearAll() {
    setSelectedPlayers([]);
  }

  const hasPlayers = selectedPlayers.length > 0;
  const canCompare = selectedPlayers.length >= 2;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Player Comparison</h1>
        <p className="text-slate-400">
          Compare up to {MAX_PLAYERS} prospects side by side. Search and add players below.
        </p>
      </div>

      {/* Search Box */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Add Players ({selectedPlayers.length}/{MAX_PLAYERS})
          </h2>
          {hasPlayers && (
            <button onClick={clearAll} className="btn-ghost text-xs px-3 py-1">
              Clear All
            </button>
          )}
        </div>

        <div ref={searchRef} className="relative">
          <input
            type="text"
            placeholder={
              selectedPlayers.length >= MAX_PLAYERS
                ? 'Maximum players reached'
                : 'Search by name, team, or league...'
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            disabled={selectedPlayers.length >= MAX_PLAYERS}
            className="filter-input w-full"
          />

          {/* Search Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
              {searchResults.map((player) => (
                <button
                  key={player.id}
                  onClick={() => addPlayer(player)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-700/60 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{flagEmoji(player.nationality)}</span>
                    <div>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                        {player.fullName}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-medium ${positionColor(player.position)}`}>
                          {player.position}
                        </span>
                        <span className="text-xs text-slate-500">|</span>
                        <span className="text-xs text-slate-400">{player.teamName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-league text-[10px]">{player.leagueName}</span>
                    <span className="text-xs text-slate-500">Age {player.age}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showDropdown && searchQuery.trim() && searchResults.length === 0 && (
            <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl p-4 text-center text-sm text-slate-500">
              No players found matching &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Selected Player Cards */}
        {hasPlayers && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {selectedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`relative bg-slate-800/60 border ${PLAYER_COLORS[idx].border} rounded-lg p-3 group`}
              >
                <button
                  onClick={() => removePlayer(player.id)}
                  className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-700/80 text-slate-400 hover:bg-red-500/80 hover:text-white transition-colors text-xs opacity-0 group-hover:opacity-100"
                  title="Remove player"
                >
                  x
                </button>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${PLAYER_COLORS[idx].bg}`} />
                  <span className="text-sm font-semibold text-slate-200 truncate">
                    {player.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={positionColor(player.position)}>{player.position}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400 truncate">{player.teamName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="badge badge-league text-[10px]">{player.leagueName}</span>
                  <span className="text-slate-500">Age {player.age}</span>
                  <span>{flagEmoji(player.nationality)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Content */}
      {!canCompare && (
        <div className="card p-12 text-center">
          <div className="text-slate-600 text-5xl mb-4">&#9878;</div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            {hasPlayers ? 'Add one more player to compare' : 'Select players to compare'}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Use the search box above to find and add 2-4 players. Once added, their stats will be
            compared side by side.
          </p>
        </div>
      )}

      {canCompare && (
        <div className="space-y-6">
          {/* Stat Comparison Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/40">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Statistical Comparison
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/90 border-b border-slate-700/50 w-36">
                      Stat
                    </th>
                    {selectedPlayers.map((player, idx) => (
                      <th
                        key={player.id}
                        className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider bg-slate-900/90 border-b border-slate-700/50"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${PLAYER_COLORS[idx].bg}`} />
                          <span className={PLAYER_COLORS[idx].text}>{player.fullName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Position & Context Row */}
                  <tr className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Position
                    </td>
                    {selectedPlayers.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center">
                        <span className={`badge badge-position text-xs ${positionColor(player.position)}`}>
                          {player.position}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Age
                    </td>
                    {selectedPlayers.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center text-slate-300">
                        {player.age}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      League
                    </td>
                    {selectedPlayers.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center">
                        <span className="badge badge-league">{player.leagueName}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Team
                    </td>
                    {selectedPlayers.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center text-slate-300 text-xs">
                        {player.teamName}
                      </td>
                    ))}
                  </tr>

                  {/* Divider */}
                  <tr>
                    <td
                      colSpan={selectedPlayers.length + 1}
                      className="bg-slate-800/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
                    >
                      Statistics
                    </td>
                  </tr>

                  {/* Stat Rows */}
                  {STAT_DEFS.map((stat) => {
                    const bestIdx = getBestIndex(selectedPlayers, stat.key);
                    const isPercentile = stat.key === 'leaguePercentile' || stat.key === 'agePercentile';
                    return (
                      <tr key={stat.key} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-slate-400">
                          <span className="hidden sm:inline">{stat.label}</span>
                          <span className="sm:hidden">{stat.shortLabel}</span>
                        </td>
                        {selectedPlayers.map((player, idx) => {
                          const val = player[stat.key];
                          const isBest = idx === bestIdx && selectedPlayers.length > 1;
                          return (
                            <td key={player.id} className="px-4 py-3 text-center">
                              {isPercentile ? (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="w-full max-w-[120px]">
                                    <PercentileBar value={val as number | null} />
                                  </div>
                                </div>
                              ) : (
                                <span
                                  className={`font-mono text-sm ${
                                    isBest
                                      ? 'text-emerald-400 font-bold'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {stat.format(val as number | null)}
                                  {isBest && (
                                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" />
                                  )}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Draft Status Row */}
                  <tr>
                    <td
                      colSpan={selectedPlayers.length + 1}
                      className="bg-slate-800/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
                    >
                      Draft Info
                    </td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-400">
                      Draft Status
                    </td>
                    {selectedPlayers.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center">
                        <span className="badge badge-draft text-xs capitalize">
                          {player.draftStatus.replace('_', ' ')}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-slate-400">
                      NHL Rights
                    </td>
                    {selectedPlayers.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center text-xs text-slate-300">
                        {player.nhlRightsHolder ? (
                          <span className="badge badge-nhl text-[10px]">{player.nhlRightsHolder}</span>
                        ) : (
                          <span className="text-slate-600">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Bar Chart Comparison */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-5">
              Visual Comparison
            </h2>
            <div className="space-y-6">
              {BAR_CHART_STATS.map((stat) => {
                const values = selectedPlayers.map((p) => p[stat.key] as number);
                const maxVal = Math.max(...values, 1);
                const bestIdx = values.indexOf(Math.max(...values));
                return (
                  <div key={stat.key}>
                    <div className="text-xs font-medium text-slate-400 mb-2">{stat.label}</div>
                    <div className="space-y-2">
                      {selectedPlayers.map((player, idx) => {
                        const val = player[stat.key] as number;
                        const pct = (val / maxVal) * 100;
                        const isBest = idx === bestIdx && selectedPlayers.length > 1;
                        return (
                          <div key={player.id} className="flex items-center gap-3">
                            <div className="w-24 truncate text-xs text-slate-400 text-right flex-shrink-0">
                              {player.fullName.split(' ').pop()}
                            </div>
                            <div className="flex-1 h-7 bg-slate-800/60 rounded overflow-hidden relative">
                              <div
                                className={`h-full rounded transition-all duration-700 ${PLAYER_COLORS[idx].bar} ${
                                  isBest ? 'opacity-100' : 'opacity-60'
                                }`}
                                style={{ width: `${Math.max(pct, 2)}%` }}
                              />
                              <span
                                className={`absolute inset-y-0 flex items-center text-xs font-mono font-semibold ${
                                  pct > 15 ? 'right-2 text-white' : 'left-2 text-slate-300'
                                }`}
                                style={pct > 15 ? {} : { left: `${Math.max(pct, 2)}%`, marginLeft: '8px' }}
                              >
                                {stat.key === 'pointsPerGame' ? val.toFixed(2) : val}
                              </span>
                            </div>
                            {isBest && (
                              <div className="flex-shrink-0 w-5 text-center text-emerald-400 text-xs font-bold">
                                #1
                              </div>
                            )}
                            {!isBest && (
                              <div className="flex-shrink-0 w-5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Percentile Overview */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-5">
              Percentile Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* League Percentile */}
              <div>
                <div className="text-xs font-medium text-slate-400 mb-3">League Percentile</div>
                <div className="space-y-3">
                  {selectedPlayers.map((player, idx) => (
                    <div key={player.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PLAYER_COLORS[idx].bg}`} />
                      <div className="w-20 truncate text-xs text-slate-400 flex-shrink-0">
                        {player.fullName.split(' ').pop()}
                      </div>
                      <div className="flex-1">
                        <PercentileBar value={player.leaguePercentile} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age Percentile */}
              <div>
                <div className="text-xs font-medium text-slate-400 mb-3">Age Percentile</div>
                <div className="space-y-3">
                  {selectedPlayers.map((player, idx) => (
                    <div key={player.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PLAYER_COLORS[idx].bg}`} />
                      <div className="w-20 truncate text-xs text-slate-400 flex-shrink-0">
                        {player.fullName.split(' ').pop()}
                      </div>
                      <div className="flex-1">
                        <PercentileBar value={player.agePercentile} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
