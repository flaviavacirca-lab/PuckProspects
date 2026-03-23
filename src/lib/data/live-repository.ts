// Live implementation — scrapes + caches real data.
// Falls back to mock data when scraping fails.

import { PlayerSearchResult } from '@/types';
import { PlayerRepository } from './repository';
import { getAllPlayers as scrapeAll } from '@/lib/scraper';

export class LivePlayerRepository implements PlayerRepository {
  async getAllPlayers(): Promise<PlayerSearchResult[]> {
    return scrapeAll();
  }

  async getPlayerById(id: number): Promise<PlayerSearchResult | null> {
    const all = await this.getAllPlayers();
    return all.find((p) => p.id === id) || null;
  }
}
