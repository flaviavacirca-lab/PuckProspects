// Live implementations — scrape + cache real data.
// Falls back to mock data when scraping fails.

import { PlayerSearchResult, Team } from '@/types';
import { PlayerRepository, TeamRepository } from './repository';
import { getAllPlayers as scrapeAll } from '@/lib/scraper';
import { MOCK_TEAMS } from '@/data/mock-teams';

export class LivePlayerRepository implements PlayerRepository {
  async getAllPlayers(): Promise<PlayerSearchResult[]> {
    return scrapeAll();
  }

  async getPlayerById(id: number): Promise<PlayerSearchResult | null> {
    const all = await this.getAllPlayers();
    return all.find((p) => p.id === id) || null;
  }

  async getPlayersByLeague(leagueCode: string): Promise<PlayerSearchResult[]> {
    const all = await this.getAllPlayers();
    return all.filter((p) => p.leagueCode === leagueCode);
  }

  async searchPlayers(query: string): Promise<PlayerSearchResult[]> {
    const all = await this.getAllPlayers();
    const q = query.toLowerCase();
    return all.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q),
    );
  }
}

// Teams aren't scraped yet — use mock data as placeholder.
export class LiveTeamRepository implements TeamRepository {
  async getAllTeams(): Promise<Team[]> {
    return MOCK_TEAMS;
  }

  async getTeamById(id: number): Promise<Team | null> {
    return MOCK_TEAMS.find((t) => t.id === id) || null;
  }

  async getTeamsByLeague(leagueId: number): Promise<Team[]> {
    return MOCK_TEAMS.filter((t) => t.leagueId === leagueId);
  }
}
