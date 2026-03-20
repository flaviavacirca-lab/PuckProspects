// ===========================
// Core Domain Types
// ===========================

export interface League {
  id: number;
  code: string;
  name: string;
  shortName: string;
  country: string;
  level: LeagueLevel;
  tier: number;
  sourceUrl: string;
  connectorStatus: ConnectorStatus;
  lastIngestedAt: string | null;
  ingestionHealthy: boolean;
}

export type LeagueLevel = 'pro' | 'junior' | 'college' | 'u20' | 'u18' | 'development';
export type ConnectorStatus = 'active' | 'partial' | 'manual' | 'placeholder';

export interface Team {
  id: number;
  name: string;
  shortName: string;
  leagueId: number;
  city: string;
  country: string;
  nhlAffiliateId: number | null;
}

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  alternateNames: string[];
  dateOfBirth: string;
  age: number;
  birthCity: string;
  birthCountry: string;
  nationality: string;
  position: Position;
  positionGroup: PositionGroup;
  shootsCatches: 'L' | 'R';
  heightCm: number;
  weightKg: number;
  heightDisplay: string;
  weightDisplay: string;
  draftStatus: DraftStatus;
  draftYear: number | null;
  draftRound: number | null;
  draftPick: number | null;
  draftOverall: number | null;
  draftedBy: string | null;
  nhlRightsHolder: string | null;
  currentTeamId: number | null;
  currentLeagueId: number | null;
  currentTeam?: Team;
  currentLeague?: League;
}

export type Position = 'C' | 'LW' | 'RW' | 'D' | 'G';
export type PositionGroup = 'F' | 'D' | 'G';
export type DraftStatus = 'drafted' | 'undrafted' | 'draft_eligible' | 're_entry';

export interface PlayerStats {
  id: number;
  playerId: number;
  season: string;
  leagueId: number;
  teamId: number;
  teamName: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  plusMinus: number | null;
  pointsPerGame: number;
  goalsPerGame: number;
  assistsPerGame: number;
  ppGoals: number | null;
  ppAssists: number | null;
  ppPoints: number | null;
  shGoals: number | null;
  shAssists: number | null;
  shPoints: number | null;
  shots: number | null;
  shootingPct: number | null;
  faceoffPct: number | null;
  avgToi: number | null;
  gwGoals: number | null;
  hits: number | null;
  blockedShots: number | null;
  leagueScoringIndex: number | null;
  ageAdjustedPpg: number | null;
  teamPtsShare: number | null;
  leaguePercentile: number | null;
  agePercentile: number | null;
  positionPercentile: number | null;
  sourceLeague: string;
  lastUpdated: string;
}

export interface GoalieStats {
  id: number;
  playerId: number;
  season: string;
  leagueId: number;
  teamName: string;
  gamesPlayed: number;
  gamesStarted: number | null;
  wins: number;
  losses: number;
  otl: number;
  shutouts: number;
  goalsAgainst: number | null;
  goalsAgainstAvg: number | null;
  saves: number | null;
  shotsAgainst: number | null;
  savePct: number | null;
  minutesPlayed: number | null;
}

// ===========================
// API / UI Types
// ===========================

export interface PlayerWithStats extends Player {
  stats: PlayerStats[];
  goalieStats?: GoalieStats[];
  league?: League;
  team?: Team;
}

export interface PlayerSearchResult {
  id: number;
  fullName: string;
  position: Position;
  age: number;
  nationality: string;
  teamName: string;
  leagueCode: string;
  leagueName: string;
  season: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  pointsPerGame: number;
  plusMinus: number | null;
  draftStatus: DraftStatus;
  nhlRightsHolder: string | null;
  leaguePercentile: number | null;
  agePercentile: number | null;
}

export interface RankingEntry {
  rank: number;
  player: PlayerSearchResult;
  metric: number;
  metricLabel: string;
}

export interface ComparisonPlayer {
  player: Player;
  stats: PlayerStats;
  percentiles: {
    goals: number;
    assists: number;
    points: number;
    ppg: number;
    plusMinus: number;
  };
}

export interface LeagueHealth {
  leagueCode: string;
  leagueName: string;
  connectorStatus: ConnectorStatus;
  lastIngested: string | null;
  healthy: boolean;
  lastRunRecords: number;
  lastRunDurationMs: number;
  errorCount: number;
}

export interface DashboardFilters {
  search: string;
  league: string;
  season: string;
  position: string;
  nationality: string;
  ageMin: number | null;
  ageMax: number | null;
  draftStatus: string;
  nhlTeam: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  [key: string]: string | number | undefined;
}
