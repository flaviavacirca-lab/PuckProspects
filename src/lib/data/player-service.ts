// Service layer — business logic that sits between API routes and repositories.
// Handles filtering, sorting, pagination, and analytics aggregation.
// Source-agnostic: works identically with mock or live data.

import { PlayerSearchResult } from '@/types';
import { PlayerRepository } from './repository';

export interface PlayerFilters {
  league?: string;
  position?: string;
  nationality?: string;
  draftStatus?: string;
  nhlTeam?: string;
  ageMin?: number;
  ageMax?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LeagueBreakdown {
  code: string;
  name: string;
  playerCount: number;
  avgPpg: number;
}

export interface AnalyticsSummary {
  total: number;
  leagueBreakdown: LeagueBreakdown[];
  ageDistribution: { age: number; count: number }[];
  nationalityBreakdown: { nationality: string; count: number; pct: number }[];
  positionDistribution: { position: string; count: number; pct: number }[];
  topRisers: PlayerSearchResult[];
}

export class PlayerService {
  constructor(private repo: PlayerRepository) {}

  async getFilteredPlayers(
    filters: PlayerFilters,
    sort: string = 'points',
    order: 'asc' | 'desc' = 'desc',
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedResult<PlayerSearchResult>> {
    let players = await this.repo.getAllPlayers();

    // Apply filters
    if (filters.league) players = players.filter((p) => p.leagueCode === filters.league);
    if (filters.position) players = players.filter((p) => p.position === filters.position);
    if (filters.nationality) {
      const nat = filters.nationality.toLowerCase();
      players = players.filter((p) => p.nationality.toLowerCase().includes(nat));
    }
    if (filters.draftStatus) players = players.filter((p) => p.draftStatus === filters.draftStatus);
    if (filters.nhlTeam) players = players.filter((p) => p.nhlRightsHolder === filters.nhlTeam);
    if (filters.ageMin) players = players.filter((p) => p.age >= filters.ageMin!);
    if (filters.ageMax) players = players.filter((p) => p.age <= filters.ageMax!);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      players = players.filter(
        (p) => p.fullName.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q),
      );
    }

    // Sort
    const sortKey = sort as keyof PlayerSearchResult;
    players.sort((a, b) => {
      const aVal = (a[sortKey] as number) ?? 0;
      const bVal = (b[sortKey] as number) ?? 0;
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });

    const total = players.length;
    const start = (page - 1) * limit;
    const data = players.slice(start, start + limit);

    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    const players = await this.repo.getAllPlayers();

    // League breakdown
    const byLeague = new Map<string, { name: string; count: number; totalPpg: number }>();
    for (const p of players) {
      const entry = byLeague.get(p.leagueCode) || { name: p.leagueName, count: 0, totalPpg: 0 };
      entry.count++;
      entry.totalPpg += p.pointsPerGame;
      byLeague.set(p.leagueCode, entry);
    }
    const leagueBreakdown = Array.from(byLeague.entries()).map(([code, d]) => ({
      code,
      name: d.name,
      playerCount: d.count,
      avgPpg: parseFloat((d.totalPpg / d.count).toFixed(2)),
    }));

    // Age distribution
    const byAge = new Map<number, number>();
    for (const p of players) byAge.set(p.age, (byAge.get(p.age) || 0) + 1);
    const ageDistribution = Array.from(byAge.entries())
      .map(([age, count]) => ({ age, count }))
      .sort((a, b) => a.age - b.age);

    // Nationality breakdown
    const byNat = new Map<string, number>();
    for (const p of players) byNat.set(p.nationality, (byNat.get(p.nationality) || 0) + 1);
    const nationalityBreakdown = Array.from(byNat.entries())
      .map(([nationality, count]) => ({
        nationality,
        count,
        pct: parseFloat(((count / players.length) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);

    // Position distribution
    const byPos = new Map<string, number>();
    for (const p of players) byPos.set(p.position, (byPos.get(p.position) || 0) + 1);
    const positionDistribution = Array.from(byPos.entries())
      .map(([position, count]) => ({
        position,
        count,
        pct: parseFloat(((count / players.length) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);

    // Top risers
    const topRisers = [...players]
      .filter((p) => p.pointsPerGame >= 1.0 && p.position !== 'G')
      .sort((a, b) => b.pointsPerGame - a.pointsPerGame)
      .slice(0, 10);

    return { total: players.length, leagueBreakdown, ageDistribution, nationalityBreakdown, positionDistribution, topRisers };
  }
}
