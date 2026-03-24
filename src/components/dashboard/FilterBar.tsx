'use client';

import { LEAGUES } from '@/lib/leagues';

interface FilterBarProps {
  filters: {
    search: string;
    league: string;
    position: string;
    nationality: string;
    draftStatus: string;
    nhlTeam: string;
    ageMin: string;
    ageMax: string;
  };
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  playerCount: number;
  totalCount: number;
}

const POSITIONS = [
  { value: 'all', label: 'All Positions' },
  { value: 'F', label: 'Forwards' },
  { value: 'C', label: 'Center' },
  { value: 'LW', label: 'Left Wing' },
  { value: 'RW', label: 'Right Wing' },
  { value: 'D', label: 'Defense' },
  { value: 'G', label: 'Goalie' },
];

const NATIONALITIES = [
  'all', 'Canada', 'USA', 'Sweden', 'Finland', 'Russia',
  'Czech Republic', 'Switzerland', 'Germany', 'Slovakia', 'Latvia', 'Denmark', 'Austria',
];

const DRAFT_STATUSES = [
  { value: 'all', label: 'All Draft Status' },
  { value: 'drafted', label: 'Drafted' },
  { value: 'undrafted', label: 'Undrafted' },
  { value: 'draft_eligible', label: 'Draft Eligible' },
];

const NHL_TEAMS = [
  'all', 'Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres',
  'Calgary Flames', 'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche',
  'Columbus Blue Jackets', 'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers',
  'Florida Panthers', 'Los Angeles Kings', 'Minnesota Wild', 'Montreal Canadiens',
  'Nashville Predators', 'New Jersey Devils', 'New York Islanders', 'New York Rangers',
  'Ottawa Senators', 'Philadelphia Flyers', 'Pittsburgh Penguins', 'San Jose Sharks',
  'Seattle Kraken', 'St. Louis Blues', 'Tampa Bay Lightning', 'Toronto Maple Leafs',
  'Vancouver Canucks', 'Vegas Golden Knights', 'Washington Capitals', 'Winnipeg Jets',
];

export default function FilterBar({ filters, onChange, onReset, playerCount, totalCount }: FilterBarProps) {
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'search') return v !== '';
    if (k === 'ageMin' || k === 'ageMax') return v !== '';
    return v !== 'all';
  }).length;

  const supportedLeagues = LEAGUES.filter(l => l.connectorStatus !== 'placeholder' || l.tier <= 2);

  return (
    <div className="card p-4 space-y-3">
      {/* Search row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="Search players, teams..."
            className="filter-input w-full"
          />
        </div>
        <div className="text-sm text-gray-500">
          {playerCount.toLocaleString()} of {totalCount.toLocaleString()} players
        </div>
        {activeFilterCount > 0 && (
          <button onClick={onReset} className="btn-ghost text-xs">
            Clear filters ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.league}
          onChange={(e) => onChange('league', e.target.value)}
          className="filter-input"
        >
          <option value="all">All Leagues</option>
          {supportedLeagues.map((l) => (
            <option key={l.code} value={l.code}>{l.shortName} — {l.name}</option>
          ))}
        </select>

        <select
          value={filters.position}
          onChange={(e) => onChange('position', e.target.value)}
          className="filter-input"
        >
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <select
          value={filters.nationality}
          onChange={(e) => onChange('nationality', e.target.value)}
          className="filter-input"
        >
          {NATIONALITIES.map((n) => (
            <option key={n} value={n}>{n === 'all' ? 'All Nationalities' : n}</option>
          ))}
        </select>

        <select
          value={filters.draftStatus}
          onChange={(e) => onChange('draftStatus', e.target.value)}
          className="filter-input"
        >
          {DRAFT_STATUSES.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <select
          value={filters.nhlTeam}
          onChange={(e) => onChange('nhlTeam', e.target.value)}
          className="filter-input"
        >
          {NHL_TEAMS.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'All NHL Teams' : t}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={filters.ageMin}
            onChange={(e) => onChange('ageMin', e.target.value)}
            placeholder="Min age"
            className="filter-input w-20"
            min={15}
            max={30}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            value={filters.ageMax}
            onChange={(e) => onChange('ageMax', e.target.value)}
            placeholder="Max age"
            className="filter-input w-20"
            min={15}
            max={30}
          />
        </div>
      </div>
    </div>
  );
}
