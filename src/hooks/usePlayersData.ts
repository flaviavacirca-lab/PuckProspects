'use client';

import { useState, useEffect, useCallback } from 'react';
import { PlayerSearchResult } from '@/types';

interface PlayersResponse {
  players: PlayerSearchResult[];
  total: number;
  page: number;
  totalPages: number;
}

interface UsePlayersOptions {
  league?: string;
  position?: string;
  nationality?: string;
  draftStatus?: string;
  nhlTeam?: string;
  ageMin?: number;
  ageMax?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface UsePlayersResult {
  players: PlayerSearchResult[];
  total: number;
  totalPages: number;
  page: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePlayers(options: UsePlayersOptions = {}): UsePlayersResult {
  const [data, setData] = useState<PlayersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serializedOptions = JSON.stringify(options);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const opts: UsePlayersOptions = JSON.parse(serializedOptions);

      if (opts.league) params.set('league', opts.league);
      if (opts.position) params.set('position', opts.position);
      if (opts.nationality) params.set('nationality', opts.nationality);
      if (opts.draftStatus) params.set('draftStatus', opts.draftStatus);
      if (opts.nhlTeam) params.set('nhlTeam', opts.nhlTeam);
      if (opts.ageMin) params.set('ageMin', String(opts.ageMin));
      if (opts.ageMax) params.set('ageMax', String(opts.ageMax));
      if (opts.search) params.set('search', opts.search);
      if (opts.sort) params.set('sort', opts.sort);
      if (opts.order) params.set('order', opts.order);
      if (opts.page) params.set('page', String(opts.page));
      if (opts.limit) params.set('limit', String(opts.limit));

      const res = await fetch(`/api/players?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`);
      const json: PlayersResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [serializedOptions]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return {
    players: data?.players || [],
    total: data?.total || 0,
    totalPages: data?.totalPages || 0,
    page: data?.page || 1,
    loading,
    error,
    refetch: fetchPlayers,
  };
}

// Hook for fetching ALL players at once (for analytics, rankings, compare pages)
export function useAllPlayers(): { players: PlayerSearchResult[]; loading: boolean; error: string | null } {
  const [players, setPlayers] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const res = await fetch('/api/players?limit=5000');
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json: PlayersResponse = await res.json();
        setPlayers(json.players);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return { players, loading, error };
}
