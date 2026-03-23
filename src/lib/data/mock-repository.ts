// Mock implementation — serves curated static data.

import { PlayerSearchResult } from '@/types';
import { PlayerRepository } from './repository';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';

export class MockPlayerRepository implements PlayerRepository {
  async getAllPlayers(): Promise<PlayerSearchResult[]> {
    return ALL_MOCK_PLAYERS;
  }

  async getPlayerById(id: number): Promise<PlayerSearchResult | null> {
    return ALL_MOCK_PLAYERS.find((p) => p.id === id) || null;
  }
}
