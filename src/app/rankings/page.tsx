'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePlayersData } from '@/context/PlayersContext';
import { filterPlayers, sortPlayers, type SortField } from '@/lib/utils';
import FilterBar from '@/components/dashboard/FilterBar';
import PlayerTable from '@/components/dashboard/PlayerTable';
import PlayerCard from '@/components/ui/PlayerCard';
import Pagination from '@/components/dashboard/Pagination';
import { LoadingSpinner, ErrorState } from '@/components/ui/LoadingState';

const DEFAULT_FILTERS = {
  search: '',
  league: 'all',
  position: 'all',
  nationality: 'all',
  draftStatus: 'all',
  nhlTeam: 'all',
  ageMin: '',
  ageMax: '',
};

const PAGE_SIZE = 48;

export default function RankingsPage() {
  const { players: allPlayers, loading, error } = usePlayersData();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'cards' | 'table'>('cards');

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  }, [sortField]);

  const filteredPlayers = useMemo(() => {
    return filterPlayers(allPlayers, {
      search: filters.search,
      league: filters.league,
      position: filters.position,
      nationality: filters.nationality,
      draftStatus: filters.draftStatus,
      nhlTeam: filters.nhlTeam,
      ageMin: filters.ageMin ? parseInt(filters.ageMin) : undefined,
      ageMax: filters.ageMax ? parseInt(filters.ageMax) : undefined,
    });
  }, [filters, allPlayers]);

  const sortedPlayers = useMemo(() => {
    return sortPlayers(filteredPlayers, sortField, sortDir);
  }, [filteredPlayers, sortField, sortDir]);

  const totalPages = Math.ceil(sortedPlayers.length / PAGE_SIZE);
  const pageData = sortedPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Rankings</h1>
          <p className="text-sm text-slate-500 mt-1">
            All prospects — sortable, filterable, searchable
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        playerCount={filteredPlayers.length}
        totalCount={allPlayers.length}
      />

      {/* Content */}
      {view === 'cards' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {pageData.map((p, idx) => (
            <PlayerCard key={p.id} player={p} rank={(page - 1) * PAGE_SIZE + idx + 1} />
          ))}
        </div>
      ) : (
        <PlayerTable
          players={pageData}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          pageSize={PAGE_SIZE}
        />
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: 'cards' | 'table'; onChange: (v: 'cards' | 'table') => void }) {
  return (
    <div className="flex items-center bg-slate-800/60 border border-slate-700/40 rounded-lg p-0.5">
      <button
        onClick={() => onChange('cards')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <GridIcon />
      </button>
      <button
        onClick={() => onChange('table')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <ListIcon />
      </button>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
