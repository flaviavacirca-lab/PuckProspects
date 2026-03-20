'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';
import {
  flagEmoji,
  positionColor,
  getPercentileColor,
  getPercentileTextColor,
} from '@/lib/utils';
import { PlayerSearchResult, Position } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RankingTab = 'overall' | 'position' | 'age_adjusted' | 'draft_eligible' | 'nhl_affiliated';
type PositionTab = 'C' | 'LW' | 'RW' | 'D';

const RANKING_TABS: { key: RankingTab; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'position', label: 'By Position' },
  { key: 'age_adjusted', label: 'Age-Adjusted' },
  { key: 'draft_eligible', label: 'Draft Eligible' },
  { key: 'nhl_affiliated', label: 'NHL Affiliated' },
];

const POSITION_TABS: PositionTab[] = ['C', 'LW', 'RW', 'D'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Age-adjustment factor: younger players get a boost. */
function ageFactor(age: number): number {
  if (age <= 16) return 1.35;
  if (age <= 17) return 1.25;
  if (age <= 18) return 1.15;
  if (age <= 19) return 1.05;
  if (age <= 20) return 1.0;
  if (age <= 21) return 0.95;
  if (age <= 22) return 0.90;
  return 0.85;
}

function ageAdjustedScore(p: PlayerSearchResult): number {
  return Math.round(p.pointsPerGame * ageFactor(p.age) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Shared row component
// ---------------------------------------------------------------------------

function RankingRow({
  rank,
  player,
  extraMetric,
}: {
  rank: number;
  player: PlayerSearchResult;
  extraMetric?: { label: string; value: string };
}) {
  return (
    <tr>
      {/* Rank */}
      <td className="text-right font-mono text-slate-500 pr-4 w-10">{rank}</td>

      {/* Player name */}
      <td>
        <Link
          href={`/players/${player.id}`}
          className="font-medium text-slate-200 hover:text-blue-400 transition-colors"
        >
          {player.fullName}
        </Link>
      </td>

      {/* Position */}
      <td>
        <span
          className={`badge badge-position text-[10px] ${positionColor(player.position)}`}
        >
          {player.position}
        </span>
      </td>

      {/* Age */}
      <td className="text-slate-400 text-sm">{player.age}</td>

      {/* Nationality */}
      <td className="text-sm" title={player.nationality}>
        {flagEmoji(player.nationality)}
      </td>

      {/* League */}
      <td>
        <span className="badge badge-league text-[10px]">{player.leagueName}</span>
      </td>

      {/* Team */}
      <td className="text-sm text-slate-400 max-w-[160px] truncate">{player.teamName}</td>

      {/* Core stats */}
      <td className="text-right font-mono text-slate-400">{player.gamesPlayed}</td>
      <td className="text-right font-mono text-slate-300">{player.goals}</td>
      <td className="text-right font-mono text-slate-300">{player.assists}</td>
      <td className="text-right font-mono font-bold text-slate-100">{player.points}</td>
      <td className="text-right font-mono text-blue-400">{player.pointsPerGame.toFixed(2)}</td>

      {/* Percentile dots */}
      <td>
        <div className="flex items-center gap-1.5 justify-end">
          <span
            className={`w-2 h-2 rounded-full ${getPercentileColor(player.leaguePercentile)}`}
            title={`League: ${player.leaguePercentile ?? '-'}th`}
          />
          <span
            className={`w-2 h-2 rounded-full ${getPercentileColor(player.agePercentile)}`}
            title={`Age: ${player.agePercentile ?? '-'}th`}
          />
        </div>
      </td>

      {/* Optional extra metric */}
      {extraMetric && (
        <td className="text-right font-mono text-emerald-400 font-semibold">
          {extraMetric.value}
        </td>
      )}
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Shared table wrapper
// ---------------------------------------------------------------------------

function RankingTable({
  players,
  extraHeader,
  extraMetricFn,
}: {
  players: PlayerSearchResult[];
  extraHeader?: string;
  extraMetricFn?: (p: PlayerSearchResult) => { label: string; value: string };
}) {
  return (
    <div className="overflow-x-auto">
      <table className="stat-table">
        <thead>
          <tr>
            <th className="text-right w-10">#</th>
            <th>Player</th>
            <th>Pos</th>
            <th>Age</th>
            <th></th>
            <th>League</th>
            <th>Team</th>
            <th className="text-right">GP</th>
            <th className="text-right">G</th>
            <th className="text-right">A</th>
            <th className="text-right">P</th>
            <th className="text-right">PPG</th>
            <th className="text-right">Pctl</th>
            {extraHeader && <th className="text-right">{extraHeader}</th>}
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <RankingRow
              key={p.id}
              rank={i + 1}
              player={p}
              extraMetric={extraMetricFn ? extraMetricFn(p) : undefined}
            />
          ))}
          {players.length === 0 && (
            <tr>
              <td colSpan={extraHeader ? 14 : 13} className="text-center py-8 text-slate-500">
                No players found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab content components
// ---------------------------------------------------------------------------

function OverallTab() {
  const top50 = useMemo(() => {
    const skaters = ALL_MOCK_PLAYERS.filter((p) => p.position !== 'G');
    return [...skaters].sort((a, b) => b.pointsPerGame - a.pointsPerGame).slice(0, 50);
  }, []);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/40">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Top 50 Prospects by Points Per Game
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          All leagues, skaters only — 2025-26 season
        </p>
      </div>
      <RankingTable players={top50} />
    </div>
  );
}

function ByPositionTab() {
  const [posTab, setPosTab] = useState<PositionTab>('C');

  const lists = useMemo(() => {
    const result: Record<PositionTab, PlayerSearchResult[]> = { C: [], LW: [], RW: [], D: [] };
    for (const pos of POSITION_TABS) {
      result[pos] = [...ALL_MOCK_PLAYERS]
        .filter((p) => p.position === pos)
        .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
        .slice(0, 20);
    }
    return result;
  }, []);

  return (
    <div className="space-y-4">
      {/* Position sub-tabs */}
      <div className="flex gap-1 bg-slate-800/40 rounded-lg p-1 w-fit">
        {POSITION_TABS.map((pos) => (
          <button
            key={pos}
            onClick={() => setPosTab(pos)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              posTab === pos
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <span className={positionColor(pos)}>{pos}</span>
            <span className="text-slate-500 text-xs ml-1.5">({lists[pos].length})</span>
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Top 20 — {posTab === 'C' ? 'Centers' : posTab === 'LW' ? 'Left Wings' : posTab === 'RW' ? 'Right Wings' : 'Defensemen'}
          </h2>
        </div>
        <RankingTable players={lists[posTab]} />
      </div>
    </div>
  );
}

function AgeAdjustedTab() {
  const ranked = useMemo(() => {
    const skaters = ALL_MOCK_PLAYERS.filter((p) => p.position !== 'G');
    return [...skaters]
      .sort((a, b) => ageAdjustedScore(b) - ageAdjustedScore(a))
      .slice(0, 50);
  }, []);

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
            Adj
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300">Age-Adjusted Scoring</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              PPG multiplied by an age factor that rewards younger players.
              A 17-year-old gets a 1.25x multiplier while a 22-year-old gets 0.90x.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/40">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Top 50 by Age-Adjusted Score
          </h2>
        </div>
        <RankingTable
          players={ranked}
          extraHeader="Adj"
          extraMetricFn={(p) => ({
            label: 'Adj',
            value: ageAdjustedScore(p).toFixed(2),
          })}
        />
      </div>
    </div>
  );
}

function DraftEligibleTab() {
  const eligible = useMemo(() => {
    return [...ALL_MOCK_PLAYERS]
      .filter((p) => p.draftStatus === 'draft_eligible')
      .sort((a, b) => b.points - a.points);
  }, []);

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700/40">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Draft Eligible Prospects
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {eligible.length} players eligible for the upcoming draft, sorted by total points
        </p>
      </div>
      <RankingTable players={eligible} />
    </div>
  );
}

function NhlAffiliatedTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped = useMemo(() => {
    const drafted = ALL_MOCK_PLAYERS.filter(
      (p) => p.draftStatus === 'drafted' && p.nhlRightsHolder
    );
    const groups: Record<string, PlayerSearchResult[]> = {};
    for (const p of drafted) {
      const team = p.nhlRightsHolder!;
      if (!groups[team]) groups[team] = [];
      groups[team].push(p);
    }
    // Sort each group by PPG descending
    for (const team of Object.keys(groups)) {
      groups[team].sort((a, b) => b.pointsPerGame - a.pointsPerGame);
    }
    return groups;
  }, []);

  const sortedTeams = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  }, [grouped]);

  const toggle = (team: string) => {
    setExpanded((prev) => ({ ...prev, [team]: !prev[team] }));
  };

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 mb-2">
        {sortedTeams.length} NHL organizations with prospects in the system.
        Click a team to expand.
      </div>
      {sortedTeams.map((team) => {
        const players = grouped[team];
        const isOpen = expanded[team] ?? false;
        return (
          <div key={team} className="card overflow-hidden">
            <button
              onClick={() => toggle(team)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="badge badge-nhl text-xs">{team}</span>
                <span className="text-xs text-slate-500">
                  {players.length} prospect{players.length !== 1 ? 's' : ''}
                </span>
              </div>
              <span className="text-slate-500 text-sm">
                {isOpen ? '−' : '+'}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-slate-700/40">
                <RankingTable players={players} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState<RankingTab>('overall');

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Prospect Rankings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Multi-view prospect rankings across all tracked leagues — 2025-26 season
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-slate-800/40 rounded-lg p-1 overflow-x-auto">
        {RANKING_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overall' && <OverallTab />}
      {activeTab === 'position' && <ByPositionTab />}
      {activeTab === 'age_adjusted' && <AgeAdjustedTab />}
      {activeTab === 'draft_eligible' && <DraftEligibleTab />}
      {activeTab === 'nhl_affiliated' && <NhlAffiliatedTab />}
    </div>
  );
}
