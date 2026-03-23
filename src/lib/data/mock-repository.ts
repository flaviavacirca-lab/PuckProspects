// Mock implementations — serve curated static data.

import { PlayerSearchResult, Team } from '@/types';
import { PlayerRepository, TeamRepository } from './repository';
import { ALL_MOCK_PLAYERS } from '@/data/mock-players';
import { MOCK_TEAMS } from '@/data/mock-teams';

export class MockPlayerRepository implements PlayerRepository {
  async getAllPlayers(): Promise<PlayerSearchResult[]> {
    return ALL_MOCK_PLAYERS;
  }

  async getPlayerById(id: number): Promise<PlayerSearchResult | null> {
    return ALL_MOCK_PLAYERS.find((p) => p.id === id) || null;
  }

  async getPlayersByLeague(leagueCode: string): Promise<PlayerSearchResult[]> {
    return ALL_MOCK_PLAYERS.filter((p) => p.leagueCode === leagueCode);
  }

  async searchPlayers(query: string): Promise<PlayerSearchResult[]> {
    const q = query.toLowerCase();
    return ALL_MOCK_PLAYERS.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        p.leagueName.toLowerCase().includes(q),
    );
  }
}

export class MockTeamRepository implements TeamRepository {
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
