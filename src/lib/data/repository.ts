// Data repository abstraction layer.
// The frontend and API routes call these — they never know
// whether data comes from mock files, a database, or live scraping.
//
// Controlled by DATA_SOURCE env var:
//   "mock" (default) → curated static data
//   "live"           → scraper + DB (future)

import { PlayerSearchResult, Team } from '@/types';

export interface PlayerRepository {
  getAllPlayers(): Promise<PlayerSearchResult[]>;
  getPlayerById(id: number): Promise<PlayerSearchResult | null>;
  getPlayersByLeague(leagueCode: string): Promise<PlayerSearchResult[]>;
  searchPlayers(query: string): Promise<PlayerSearchResult[]>;
}

export interface TeamRepository {
  getAllTeams(): Promise<Team[]>;
  getTeamById(id: number): Promise<Team | null>;
  getTeamsByLeague(leagueId: number): Promise<Team[]>;
}
