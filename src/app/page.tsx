'use client';

import { useState, useMemo, useCallback } from 'react';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';
import { filterPlayers, sortPlayers, type SortField } from '@/lib/utils';
import FilterBar from '@/components/dashboard/FilterBar';
import PlayerTable from '@/components/dashboard/PlayerTable';
import Pagination from '@/components/dashboard/Pagination';
import QuickStats from '@/components/dashboard/QuickStats';

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

const PAGE_SIZE = 50;

export default function DashboardPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

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
    return filterPlayers(ALL_MOCK_PLAYERS, {
      search: filters.search,
      league: filters.league,
      position: filters.position,
      nationality: filters.nationality,
      draftStatus: filters.draftStatus,
      nhlTeam: filters.nhlTeam,
      ageMin: filters.ageMin ? parseInt(filters.ageMin) : undefined,
      ageMax: filters.ageMax ? parseInt(filters.ageMax) : undefined,
    });
  }, [filters]);

  const sortedPlayers = useMemo(() => {
    return sortPlayers(filteredPlayers, sortField, sortDir);
  }, [filteredPlayers, sortField, sortDir]);

  const totalPages = Math.ceil(sortedPlayers.length / PAGE_SIZE);
  const pageData = sortedPlayers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Prospect Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cross-league prospect analytics — 2025-26 season
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-xs">
            Export CSV
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <QuickStats players={ALL_MOCK_PLAYERS} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        playerCount={filteredPlayers.length}
        totalCount={ALL_MOCK_PLAYERS.length}
      />

      {/* Player table */}
      <PlayerTable
        players={pageData}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        page={page}
        pageSize={PAGE_SIZE}
      />

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
