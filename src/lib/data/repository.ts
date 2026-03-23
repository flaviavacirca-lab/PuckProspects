// Data repository abstraction layer.
// The frontend and API routes call these functions — they never know
// whether data comes from mock files, a database, or live scraping.
//
// Controlled by DATA_SOURCE env var:
//   "mock" (default) → curated static data
//   "live"           → scraper + DB (future)

import { PlayerSearchResult } from '@/types';

export interface PlayerRepository {
  getAllPlayers(): Promise<PlayerSearchResult[]>;
  getPlayerById(id: number): Promise<PlayerSearchResult | null>;
}
