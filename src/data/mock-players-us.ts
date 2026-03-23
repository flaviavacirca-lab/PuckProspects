// US and development league prospects for 2025-26 season.

import { PlayerSearchResult } from '@/types';

// ── NCAA Prospects ─────────────────────────────────────────────
const NCAA_PLAYERS: PlayerSearchResult[] = [
  { id: 401, fullName: 'James Hagens', position: 'C', age: 18, nationality: 'USA', teamName: 'Boston College', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 36, goals: 20, assists: 34, points: 54, pointsPerGame: 1.50, plusMinus: 22, draftStatus: 'drafted', nhlRightsHolder: null, leaguePercentile: 99, agePercentile: 99 },
  { id: 402, fullName: 'Zeev Buium', position: 'D', age: 20, nationality: 'USA', teamName: 'University of Denver', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 38, goals: 10, assists: 32, points: 42, pointsPerGame: 1.11, plusMinus: 18, draftStatus: 'drafted', nhlRightsHolder: 'Minnesota Wild', leaguePercentile: 96, agePercentile: 96 },
  { id: 403, fullName: 'Cole Eiserman', position: 'LW', age: 18, nationality: 'USA', teamName: 'Boston University', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 36, goals: 24, assists: 18, points: 42, pointsPerGame: 1.17, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'New York Islanders', leaguePercentile: 95, agePercentile: 98 },
  { id: 404, fullName: 'Trevor Connelly', position: 'LW', age: 20, nationality: 'USA', teamName: 'Providence College', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 34, goals: 16, assists: 24, points: 40, pointsPerGame: 1.18, plusMinus: 14, draftStatus: 'drafted', nhlRightsHolder: 'Vegas Golden Knights', leaguePercentile: 94, agePercentile: 94 },
  { id: 405, fullName: 'Teddy Stiga', position: 'C', age: 19, nationality: 'USA', teamName: 'University of Michigan', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 36, goals: 14, assists: 26, points: 40, pointsPerGame: 1.11, plusMinus: 12, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 93, agePercentile: 95 },
  { id: 406, fullName: 'Kamil Bednarik', position: 'C', age: 19, nationality: 'Czech Republic', teamName: 'University of Minnesota', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 38, goals: 12, assists: 22, points: 34, pointsPerGame: 0.89, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 90 },
  { id: 407, fullName: 'Max Plante', position: 'RW', age: 20, nationality: 'USA', teamName: 'Notre Dame', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 36, goals: 18, assists: 20, points: 38, pointsPerGame: 1.06, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Montreal Canadiens', leaguePercentile: 92, agePercentile: 93 },
  { id: 408, fullName: 'Danny Nelson', position: 'C', age: 20, nationality: 'USA', teamName: 'University of Notre Dame', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 38, goals: 10, assists: 24, points: 34, pointsPerGame: 0.89, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'New York Islanders', leaguePercentile: 86, agePercentile: 88 },
  { id: 409, fullName: 'Ryan Fine', position: 'C', age: 19, nationality: 'USA', teamName: 'Boston College', leagueCode: 'ncaa', leagueName: 'NCAA', season: '2025-26', gamesPlayed: 36, goals: 12, assists: 20, points: 32, pointsPerGame: 0.89, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 85, agePercentile: 90 },
];

// ── USHL Prospects ─────────────────────────────────────────────
const USHL_PLAYERS: PlayerSearchResult[] = [
  { id: 501, fullName: 'Michael Misa', position: 'C', age: 18, nationality: 'Canada', teamName: 'Chicago Steel', leagueCode: 'ushl', leagueName: 'USHL', season: '2025-26', gamesPlayed: 44, goals: 30, assists: 40, points: 70, pointsPerGame: 1.59, plusMinus: 26, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 99, agePercentile: 99 },
  { id: 502, fullName: 'Cullen Potter', position: 'D', age: 18, nationality: 'USA', teamName: 'Sioux Falls Stampede', leagueCode: 'ushl', leagueName: 'USHL', season: '2025-26', gamesPlayed: 46, goals: 10, assists: 32, points: 42, pointsPerGame: 0.91, plusMinus: 18, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 92, agePercentile: 95 },
  { id: 503, fullName: 'Brady Berard', position: 'RW', age: 17, nationality: 'USA', teamName: 'US NTDP U18', leagueCode: 'ushl', leagueName: 'USHL', season: '2025-26', gamesPlayed: 40, goals: 22, assists: 28, points: 50, pointsPerGame: 1.25, plusMinus: 14, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 95, agePercentile: 98 },
  { id: 504, fullName: 'Cameron Korpi', position: 'C', age: 18, nationality: 'USA', teamName: 'Green Bay Gamblers', leagueCode: 'ushl', leagueName: 'USHL', season: '2025-26', gamesPlayed: 48, goals: 18, assists: 26, points: 44, pointsPerGame: 0.92, plusMinus: 10, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 88, agePercentile: 92 },
  { id: 505, fullName: 'Nolan Roed', position: 'LW', age: 18, nationality: 'USA', teamName: 'Tri-City Storm', leagueCode: 'ushl', leagueName: 'USHL', season: '2025-26', gamesPlayed: 46, goals: 26, assists: 22, points: 48, pointsPerGame: 1.04, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 90, agePercentile: 93 },
  { id: 506, fullName: 'Jack Murtagh', position: 'D', age: 17, nationality: 'USA', teamName: 'US NTDP U18', leagueCode: 'ushl', leagueName: 'USHL', season: '2025-26', gamesPlayed: 42, goals: 8, assists: 24, points: 32, pointsPerGame: 0.76, plusMinus: 12, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 82, agePercentile: 94 },
];

// ── NTDP / Development ─────────────────────────────────────────
const NTDP_PLAYERS: PlayerSearchResult[] = [
  { id: 601, fullName: 'Bryce Ingram', position: 'C', age: 17, nationality: 'USA', teamName: 'US NTDP U18', leagueCode: 'usntdp', leagueName: 'NTDP', season: '2025-26', gamesPlayed: 50, goals: 24, assists: 30, points: 54, pointsPerGame: 1.08, plusMinus: 16, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 94, agePercentile: 96 },
  { id: 602, fullName: 'Tyler Howells', position: 'D', age: 17, nationality: 'USA', teamName: 'US NTDP U18', leagueCode: 'usntdp', leagueName: 'NTDP', season: '2025-26', gamesPlayed: 48, goals: 6, assists: 28, points: 34, pointsPerGame: 0.71, plusMinus: 14, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 82, agePercentile: 90 },
  { id: 603, fullName: 'Landon DuPont', position: 'C', age: 16, nationality: 'Canada', teamName: 'US NTDP U17', leagueCode: 'usntdp', leagueName: 'NTDP', season: '2025-26', gamesPlayed: 44, goals: 18, assists: 28, points: 46, pointsPerGame: 1.05, plusMinus: 12, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 92, agePercentile: 99 },
  { id: 604, fullName: 'Colin Ralph', position: 'LW', age: 17, nationality: 'USA', teamName: 'US NTDP U18', leagueCode: 'usntdp', leagueName: 'NTDP', season: '2025-26', gamesPlayed: 48, goals: 20, assists: 22, points: 42, pointsPerGame: 0.88, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 92 },
];

// ── BCHL Prospects ─────────────────────────────────────────────
const BCHL_PLAYERS: PlayerSearchResult[] = [
  { id: 701, fullName: 'Carson Wetsch', position: 'C', age: 19, nationality: 'Canada', teamName: 'Trail Smoke Eaters', leagueCode: 'bchl', leagueName: 'BCHL', season: '2025-26', gamesPlayed: 48, goals: 26, assists: 34, points: 60, pointsPerGame: 1.25, plusMinus: 18, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 95, agePercentile: 94 },
  { id: 702, fullName: 'Max Finley', position: 'D', age: 18, nationality: 'Canada', teamName: 'Penticton Vees', leagueCode: 'bchl', leagueName: 'BCHL', season: '2025-26', gamesPlayed: 46, goals: 8, assists: 30, points: 38, pointsPerGame: 0.83, plusMinus: 14, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 88, agePercentile: 92 },
  { id: 703, fullName: 'Noah Downey', position: 'RW', age: 19, nationality: 'Canada', teamName: 'Langley Rivermen', leagueCode: 'bchl', leagueName: 'BCHL', season: '2025-26', gamesPlayed: 48, goals: 22, assists: 24, points: 46, pointsPerGame: 0.96, plusMinus: 10, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 90, agePercentile: 88 },
  { id: 704, fullName: 'Tyler Ratzlaff', position: 'G', age: 19, nationality: 'Canada', teamName: 'Vernon Vipers', leagueCode: 'bchl', leagueName: 'BCHL', season: '2025-26', gamesPlayed: 36, goals: 0, assists: 1, points: 1, pointsPerGame: 0.03, plusMinus: null, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 88, agePercentile: 90 },
];

// ── NAHL Prospects ─────────────────────────────────────────────
const NAHL_PLAYERS: PlayerSearchResult[] = [
  { id: 801, fullName: 'Jack Munroe', position: 'D', age: 18, nationality: 'USA', teamName: 'Lone Star Brahmas', leagueCode: 'nahl', leagueName: 'NAHL', season: '2025-26', gamesPlayed: 50, goals: 10, assists: 28, points: 38, pointsPerGame: 0.76, plusMinus: 14, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 90, agePercentile: 92 },
  { id: 802, fullName: 'Chase MacQueen-Spence', position: 'C', age: 18, nationality: 'Canada', teamName: 'Aberdeen Wings', leagueCode: 'nahl', leagueName: 'NAHL', season: '2025-26', gamesPlayed: 52, goals: 20, assists: 26, points: 46, pointsPerGame: 0.88, plusMinus: 10, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 92, agePercentile: 93 },
  { id: 803, fullName: 'Dylan Clarke', position: 'RW', age: 19, nationality: 'USA', teamName: 'Janesville Jets', leagueCode: 'nahl', leagueName: 'NAHL', season: '2025-26', gamesPlayed: 48, goals: 18, assists: 20, points: 38, pointsPerGame: 0.79, plusMinus: 6, draftStatus: 'undrafted', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 84 },
  { id: 804, fullName: 'Aiden Park', position: 'LW', age: 18, nationality: 'USA', teamName: 'Fairbanks Ice Dogs', leagueCode: 'nahl', leagueName: 'NAHL', season: '2025-26', gamesPlayed: 46, goals: 16, assists: 18, points: 34, pointsPerGame: 0.74, plusMinus: 4, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 84, agePercentile: 88 },
];

// ── ECHL Prospects ─────────────────────────────────────────────
const ECHL_PLAYERS: PlayerSearchResult[] = [
  { id: 901, fullName: 'Nikita Artamonov', position: 'LW', age: 20, nationality: 'Russia', teamName: 'Allen Americans', leagueCode: 'echl', leagueName: 'ECHL', season: '2025-26', gamesPlayed: 54, goals: 20, assists: 24, points: 44, pointsPerGame: 0.81, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'Toronto Maple Leafs', leaguePercentile: 84, agePercentile: 88 },
  { id: 902, fullName: 'William Provost', position: 'RW', age: 22, nationality: 'Canada', teamName: 'Trois-Rivières Lions', leagueCode: 'echl', leagueName: 'ECHL', season: '2025-26', gamesPlayed: 58, goals: 22, assists: 28, points: 50, pointsPerGame: 0.86, plusMinus: 8, draftStatus: 'undrafted', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 80 },
  { id: 903, fullName: 'Simon Nemec Jr', position: 'D', age: 21, nationality: 'Slovakia', teamName: 'Adirondack Thunder', leagueCode: 'echl', leagueName: 'ECHL', season: '2025-26', gamesPlayed: 52, goals: 6, assists: 22, points: 28, pointsPerGame: 0.54, plusMinus: 10, draftStatus: 'undrafted', nhlRightsHolder: null, leaguePercentile: 70, agePercentile: 72 },
  { id: 904, fullName: 'Marcus Nguyen', position: 'C', age: 23, nationality: 'USA', teamName: 'Idaho Steelheads', leagueCode: 'echl', leagueName: 'ECHL', season: '2025-26', gamesPlayed: 60, goals: 18, assists: 26, points: 44, pointsPerGame: 0.73, plusMinus: 4, draftStatus: 'undrafted', nhlRightsHolder: null, leaguePercentile: 78, agePercentile: 68 },
  { id: 905, fullName: 'Tyler Brennan', position: 'G', age: 21, nationality: 'Canada', teamName: 'Wichita Thunder', leagueCode: 'echl', leagueName: 'ECHL', season: '2025-26', gamesPlayed: 40, goals: 0, assists: 1, points: 1, pointsPerGame: 0.03, plusMinus: null, draftStatus: 'drafted', nhlRightsHolder: 'New Jersey Devils', leaguePercentile: 80, agePercentile: 82 },
];

export const CURATED_PLAYERS_US: PlayerSearchResult[] = [
  ...NCAA_PLAYERS,
  ...USHL_PLAYERS,
  ...NTDP_PLAYERS,
  ...BCHL_PLAYERS,
  ...NAHL_PLAYERS,
  ...ECHL_PLAYERS,
];
