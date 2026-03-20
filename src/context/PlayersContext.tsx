'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerSearchResult } from '@/types';

interface PlayersContextValue {
  players: PlayerSearchResult[];
  loading: boolean;
  error: string | null;
}

const PlayersContext = createContext<PlayersContextValue>({
  players: [],
  loading: true,
  error: null,
});

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch('/api/players?limit=5000');
        if (!res.ok) throw new Error(`Failed to fetch players: ${res.status}`);
        const json = await res.json();
        setPlayers(json.players);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  return (
    <PlayersContext.Provider value={{ players, loading, error }}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayersData(): PlayersContextValue {
  return useContext(PlayersContext);
}
