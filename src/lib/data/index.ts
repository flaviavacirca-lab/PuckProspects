// Data source switch — controlled by DATA_SOURCE env var.
// Default: "mock" (curated static data, works everywhere).
// Set DATA_SOURCE=live to use the scraper/DB pipeline.

import { PlayerRepository } from './repository';
import { MockPlayerRepository } from './mock-repository';
import { LivePlayerRepository } from './live-repository';

const DATA_SOURCE = process.env.DATA_SOURCE || 'mock';

let _repo: PlayerRepository | null = null;

export function getPlayerRepository(): PlayerRepository {
  if (!_repo) {
    _repo =
      DATA_SOURCE === 'live'
        ? new LivePlayerRepository()
        : new MockPlayerRepository();
  }
  return _repo;
}

export type { PlayerRepository };
