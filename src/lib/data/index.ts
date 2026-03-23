// Data source switch — controlled by DATA_SOURCE env var.
// Default: "mock" (curated static data, works everywhere).
// Set DATA_SOURCE=live to use the scraper/DB pipeline.

import { PlayerRepository, TeamRepository } from './repository';
import { MockPlayerRepository, MockTeamRepository } from './mock-repository';
import { LivePlayerRepository, LiveTeamRepository } from './live-repository';
import { PlayerService } from './player-service';

const DATA_SOURCE = process.env.DATA_SOURCE || 'mock';

let _playerRepo: PlayerRepository | null = null;
let _teamRepo: TeamRepository | null = null;
let _playerService: PlayerService | null = null;

export function getPlayerRepository(): PlayerRepository {
  if (!_playerRepo) {
    _playerRepo =
      DATA_SOURCE === 'live'
        ? new LivePlayerRepository()
        : new MockPlayerRepository();
  }
  return _playerRepo;
}

export function getTeamRepository(): TeamRepository {
  if (!_teamRepo) {
    _teamRepo =
      DATA_SOURCE === 'live'
        ? new LiveTeamRepository()
        : new MockTeamRepository();
  }
  return _teamRepo;
}

export function getPlayerService(): PlayerService {
  if (!_playerService) {
    _playerService = new PlayerService(getPlayerRepository());
  }
  return _playerService;
}

export type { PlayerRepository, TeamRepository };
export type { PlayerService };
