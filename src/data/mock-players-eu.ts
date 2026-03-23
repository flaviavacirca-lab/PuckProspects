// European league prospects for 2025-26 season.

import { PlayerSearchResult } from '@/types';

// ── SHL Prospects ──────────────────────────────────────────────
const SHL_PLAYERS: PlayerSearchResult[] = [
  { id: 1001, fullName: 'Axel Sandin Pellikka', position: 'D', age: 20, nationality: 'Sweden', teamName: 'Skellefteå AIK', leagueCode: 'shl', leagueName: 'SHL', season: '2025-26', gamesPlayed: 48, goals: 8, assists: 28, points: 36, pointsPerGame: 0.75, plusMinus: 14, draftStatus: 'drafted', nhlRightsHolder: 'Detroit Red Wings', leaguePercentile: 88, agePercentile: 94 },
  { id: 1002, fullName: 'Tom Willander', position: 'D', age: 20, nationality: 'Sweden', teamName: 'Rögle BK', leagueCode: 'shl', leagueName: 'SHL', season: '2025-26', gamesPlayed: 46, goals: 6, assists: 22, points: 28, pointsPerGame: 0.61, plusMinus: 12, draftStatus: 'drafted', nhlRightsHolder: 'Vancouver Canucks', leaguePercentile: 80, agePercentile: 90 },
  { id: 1003, fullName: 'Elias Pettersson', position: 'C', age: 19, nationality: 'Sweden', teamName: 'Örebro HK', leagueCode: 'shl', leagueName: 'SHL', season: '2025-26', gamesPlayed: 44, goals: 14, assists: 20, points: 34, pointsPerGame: 0.77, plusMinus: 10, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 96 },
  { id: 1004, fullName: 'Noel Nordh', position: 'LW', age: 19, nationality: 'Sweden', teamName: 'Brynäs IF', leagueCode: 'shl', leagueName: 'SHL', season: '2025-26', gamesPlayed: 42, goals: 10, assists: 14, points: 24, pointsPerGame: 0.57, plusMinus: 4, draftStatus: 'drafted', nhlRightsHolder: 'Buffalo Sabres', leaguePercentile: 76, agePercentile: 90 },
  { id: 1005, fullName: 'Hugo Pettersson', position: 'D', age: 18, nationality: 'Sweden', teamName: 'Luleå HF', leagueCode: 'shl', leagueName: 'SHL', season: '2025-26', gamesPlayed: 40, goals: 4, assists: 16, points: 20, pointsPerGame: 0.50, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 72, agePercentile: 94 },
  { id: 1006, fullName: 'Rasmus Bergqvist', position: 'D', age: 19, nationality: 'Sweden', teamName: 'Frölunda HC', leagueCode: 'shl', leagueName: 'SHL', season: '2025-26', gamesPlayed: 46, goals: 4, assists: 18, points: 22, pointsPerGame: 0.48, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'Minnesota Wild', leaguePercentile: 70, agePercentile: 86 },
  { id: 1007, fullName: 'Emil Heineman', position: 'LW', age: 22, nationality: 'Sweden', teamName: 'Luleå HF', leagueCode: 'shl', leagueName: 'SHL', season: '2025-26', gamesPlayed: 50, goals: 16, assists: 18, points: 34, pointsPerGame: 0.68, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Florida Panthers', leaguePercentile: 84, agePercentile: 82 },
];

// ── Liiga Prospects ────────────────────────────────────────────
const LIIGA_PLAYERS: PlayerSearchResult[] = [
  { id: 1101, fullName: 'Joakim Kemell', position: 'RW', age: 21, nationality: 'Finland', teamName: 'JYP', leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 52, goals: 22, assists: 20, points: 42, pointsPerGame: 0.81, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Nashville Predators', leaguePercentile: 90, agePercentile: 92 },
  { id: 1102, fullName: 'Kasper Halttunen', position: 'RW', age: 20, nationality: 'Finland', teamName: 'Ilves', leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 50, goals: 16, assists: 18, points: 34, pointsPerGame: 0.68, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'San Jose Sharks', leaguePercentile: 82, agePercentile: 88 },
  { id: 1103, fullName: 'Jesse Kiiskinen', position: 'LW', age: 18, nationality: 'Finland', teamName: 'KalPa', leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 46, goals: 12, assists: 16, points: 28, pointsPerGame: 0.61, plusMinus: 4, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 78, agePercentile: 96 },
  { id: 1104, fullName: 'Eemil Vinni', position: 'C', age: 19, nationality: 'Finland', teamName: 'Tappara', leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 48, goals: 10, assists: 14, points: 24, pointsPerGame: 0.50, plusMinus: 2, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 68, agePercentile: 86 },
  { id: 1105, fullName: 'Arttu Pelli', position: 'D', age: 20, nationality: 'Finland', teamName: 'Lukko', leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 50, goals: 4, assists: 16, points: 20, pointsPerGame: 0.40, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Columbus Blue Jackets', leaguePercentile: 64, agePercentile: 80 },
  { id: 1106, fullName: 'Konsta Helenius', position: 'C', age: 19, nationality: 'Finland', teamName: 'Jukurit', leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 50, goals: 18, assists: 22, points: 40, pointsPerGame: 0.80, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Carolina Hurricanes', leaguePercentile: 88, agePercentile: 96 },
  { id: 1107, fullName: 'Kalle Kangas', position: 'G', age: 20, nationality: 'Finland', teamName: 'HIFK', leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 34, goals: 0, assists: 0, points: 0, pointsPerGame: 0.00, plusMinus: null, draftStatus: 'drafted', nhlRightsHolder: 'Toronto Maple Leafs', leaguePercentile: 82, agePercentile: 84 },
];

// ── KHL Prospects ──────────────────────────────────────────────
const KHL_PLAYERS: PlayerSearchResult[] = [
  { id: 1201, fullName: 'Danila Yurov', position: 'LW', age: 21, nationality: 'Russia', teamName: 'Metallurg Magnitogorsk', leagueCode: 'khl', leagueName: 'KHL', season: '2025-26', gamesPlayed: 56, goals: 16, assists: 22, points: 38, pointsPerGame: 0.68, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Minnesota Wild', leaguePercentile: 80, agePercentile: 88 },
  { id: 1202, fullName: 'Mikhail Gulyayev', position: 'D', age: 20, nationality: 'Russia', teamName: 'Lokomotiv Yaroslavl', leagueCode: 'khl', leagueName: 'KHL', season: '2025-26', gamesPlayed: 52, goals: 6, assists: 22, points: 28, pointsPerGame: 0.54, plusMinus: 14, draftStatus: 'drafted', nhlRightsHolder: 'Calgary Flames', leaguePercentile: 72, agePercentile: 90 },
  { id: 1203, fullName: 'Ivan Zhigalov', position: 'G', age: 22, nationality: 'Russia', teamName: 'SKA St. Petersburg', leagueCode: 'khl', leagueName: 'KHL', season: '2025-26', gamesPlayed: 36, goals: 0, assists: 1, points: 1, pointsPerGame: 0.03, plusMinus: null, draftStatus: 'drafted', nhlRightsHolder: 'New Jersey Devils', leaguePercentile: 78, agePercentile: 80 },
  { id: 1204, fullName: 'Arseni Koromyslov', position: 'D', age: 19, nationality: 'Russia', teamName: 'CSKA Moscow', leagueCode: 'khl', leagueName: 'KHL', season: '2025-26', gamesPlayed: 48, goals: 4, assists: 14, points: 18, pointsPerGame: 0.38, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Edmonton Oilers', leaguePercentile: 60, agePercentile: 86 },
  { id: 1205, fullName: 'Kirill Dolzhenkov', position: 'LW', age: 18, nationality: 'Russia', teamName: 'Dynamo Moscow', leagueCode: 'khl', leagueName: 'KHL', season: '2025-26', gamesPlayed: 40, goals: 8, assists: 12, points: 20, pointsPerGame: 0.50, plusMinus: 2, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 66, agePercentile: 96 },
  { id: 1206, fullName: 'Nikita Chernousov', position: 'C', age: 20, nationality: 'Russia', teamName: 'Ak Bars Kazan', leagueCode: 'khl', leagueName: 'KHL', season: '2025-26', gamesPlayed: 50, goals: 12, assists: 18, points: 30, pointsPerGame: 0.60, plusMinus: 6, draftStatus: 'undrafted', nhlRightsHolder: null, leaguePercentile: 76, agePercentile: 82 },
];

// ── DEL Prospects ──────────────────────────────────────────────
const DEL_PLAYERS: PlayerSearchResult[] = [
  { id: 1301, fullName: 'Lian Bichsel', position: 'D', age: 21, nationality: 'Switzerland', teamName: 'Düsseldorfer EG', leagueCode: 'del', leagueName: 'DEL', season: '2025-26', gamesPlayed: 48, goals: 6, assists: 18, points: 24, pointsPerGame: 0.50, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Dallas Stars', leaguePercentile: 74, agePercentile: 82 },
  { id: 1302, fullName: 'Florian Elias', position: 'C', age: 22, nationality: 'Germany', teamName: 'Adler Mannheim', leagueCode: 'del', leagueName: 'DEL', season: '2025-26', gamesPlayed: 50, goals: 16, assists: 22, points: 38, pointsPerGame: 0.76, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Montreal Canadiens', leaguePercentile: 86, agePercentile: 84 },
  { id: 1303, fullName: 'Roman Kechter', position: 'LW', age: 18, nationality: 'Germany', teamName: 'EHC Red Bull München', leagueCode: 'del', leagueName: 'DEL', season: '2025-26', gamesPlayed: 44, goals: 8, assists: 12, points: 20, pointsPerGame: 0.45, plusMinus: 2, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 68, agePercentile: 94 },
  { id: 1304, fullName: 'Linus Vieillard', position: 'D', age: 19, nationality: 'Germany', teamName: 'Kölner Haie', leagueCode: 'del', leagueName: 'DEL', season: '2025-26', gamesPlayed: 46, goals: 4, assists: 14, points: 18, pointsPerGame: 0.39, plusMinus: 4, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 62, agePercentile: 86 },
];

// ── NL (Swiss) Prospects ───────────────────────────────────────
const NL_PLAYERS: PlayerSearchResult[] = [
  { id: 1401, fullName: 'Rico Gredig', position: 'C', age: 20, nationality: 'Switzerland', teamName: 'EHC Kloten', leagueCode: 'nl', leagueName: 'NL', season: '2025-26', gamesPlayed: 46, goals: 10, assists: 18, points: 28, pointsPerGame: 0.61, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'Dallas Stars', leaguePercentile: 78, agePercentile: 88 },
  { id: 1402, fullName: 'Nino Lehkonen', position: 'RW', age: 19, nationality: 'Switzerland', teamName: 'SC Bern', leagueCode: 'nl', leagueName: 'NL', season: '2025-26', gamesPlayed: 44, goals: 8, assists: 14, points: 22, pointsPerGame: 0.50, plusMinus: 4, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 70, agePercentile: 90 },
  { id: 1403, fullName: 'Simon Knak', position: 'RW', age: 22, nationality: 'Switzerland', teamName: 'HC Davos', leagueCode: 'nl', leagueName: 'NL', season: '2025-26', gamesPlayed: 48, goals: 14, assists: 20, points: 34, pointsPerGame: 0.71, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Pittsburgh Penguins', leaguePercentile: 82, agePercentile: 80 },
  { id: 1404, fullName: 'Lukas Fischer', position: 'D', age: 18, nationality: 'Switzerland', teamName: 'ZSC Lions', leagueCode: 'nl', leagueName: 'NL', season: '2025-26', gamesPlayed: 40, goals: 2, assists: 10, points: 12, pointsPerGame: 0.30, plusMinus: 2, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 52, agePercentile: 88 },
];

// ── ELH (Czech) Prospects ──────────────────────────────────────
const ELH_PLAYERS: PlayerSearchResult[] = [
  { id: 1501, fullName: 'Eduard Sale', position: 'LW', age: 19, nationality: 'Czech Republic', teamName: 'HC Kometa Brno', leagueCode: 'elh', leagueName: 'ELH', season: '2025-26', gamesPlayed: 46, goals: 14, assists: 20, points: 34, pointsPerGame: 0.74, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Seattle Kraken', leaguePercentile: 84, agePercentile: 94 },
  { id: 1502, fullName: 'Adam Jiricek', position: 'D', age: 19, nationality: 'Czech Republic', teamName: 'HC Plzen', leagueCode: 'elh', leagueName: 'ELH', season: '2025-26', gamesPlayed: 44, goals: 6, assists: 18, points: 24, pointsPerGame: 0.55, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'St. Louis Blues', leaguePercentile: 74, agePercentile: 92 },
  { id: 1503, fullName: 'Dominik Petr', position: 'C', age: 18, nationality: 'Czech Republic', teamName: 'HC Sparta Praha', leagueCode: 'elh', leagueName: 'ELH', season: '2025-26', gamesPlayed: 42, goals: 8, assists: 14, points: 22, pointsPerGame: 0.52, plusMinus: 4, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 70, agePercentile: 92 },
  { id: 1504, fullName: 'Jakub Dvorak', position: 'D', age: 18, nationality: 'Czech Republic', teamName: 'HC Liberec', leagueCode: 'elh', leagueName: 'ELH', season: '2025-26', gamesPlayed: 40, goals: 4, assists: 12, points: 16, pointsPerGame: 0.40, plusMinus: 6, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 62, agePercentile: 88 },
];

// ── J20 Nationell (Sweden U20) ─────────────────────────────────
const J20_PLAYERS: PlayerSearchResult[] = [
  { id: 1601, fullName: 'Felix Nilsson', position: 'C', age: 18, nationality: 'Sweden', teamName: 'Frölunda HC J20', leagueCode: 'j20', leagueName: 'J20', season: '2025-26', gamesPlayed: 38, goals: 18, assists: 26, points: 44, pointsPerGame: 1.16, plusMinus: 16, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 94, agePercentile: 95 },
  { id: 1602, fullName: 'Viggo Nordlund', position: 'D', age: 17, nationality: 'Sweden', teamName: 'Djurgårdens IF J20', leagueCode: 'j20', leagueName: 'J20', season: '2025-26', gamesPlayed: 36, goals: 8, assists: 22, points: 30, pointsPerGame: 0.83, plusMinus: 12, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 96 },
  { id: 1603, fullName: 'Lucas Söderström', position: 'LW', age: 18, nationality: 'Sweden', teamName: 'HV71 J20', leagueCode: 'j20', leagueName: 'J20', season: '2025-26', gamesPlayed: 38, goals: 20, assists: 16, points: 36, pointsPerGame: 0.95, plusMinus: 10, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 90, agePercentile: 93 },
  { id: 1604, fullName: 'Oskar Asplund', position: 'RW', age: 17, nationality: 'Sweden', teamName: 'Skellefteå AIK J20', leagueCode: 'j20', leagueName: 'J20', season: '2025-26', gamesPlayed: 34, goals: 14, assists: 18, points: 32, pointsPerGame: 0.94, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 88, agePercentile: 96 },
];

// ── MHL (Russia U20) ───────────────────────────────────────────
const MHL_PLAYERS: PlayerSearchResult[] = [
  { id: 1701, fullName: 'Artyom Kovalenko', position: 'C', age: 18, nationality: 'Russia', teamName: 'SKA-1946', leagueCode: 'mhl', leagueName: 'MHL', season: '2025-26', gamesPlayed: 44, goals: 20, assists: 24, points: 44, pointsPerGame: 1.00, plusMinus: 12, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 92, agePercentile: 94 },
  { id: 1702, fullName: 'Vladimir Grudinin', position: 'D', age: 19, nationality: 'Russia', teamName: 'CSKA-2', leagueCode: 'mhl', leagueName: 'MHL', season: '2025-26', gamesPlayed: 42, goals: 6, assists: 22, points: 28, pointsPerGame: 0.67, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Winnipeg Jets', leaguePercentile: 82, agePercentile: 88 },
  { id: 1703, fullName: 'Semyon Demin', position: 'RW', age: 17, nationality: 'Russia', teamName: 'Dynamo-2', leagueCode: 'mhl', leagueName: 'MHL', season: '2025-26', gamesPlayed: 40, goals: 16, assists: 18, points: 34, pointsPerGame: 0.85, plusMinus: 6, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 88, agePercentile: 96 },
  { id: 1704, fullName: 'Pavel Tyutnev', position: 'LW', age: 18, nationality: 'Russia', teamName: 'Loko-2', leagueCode: 'mhl', leagueName: 'MHL', season: '2025-26', gamesPlayed: 42, goals: 14, assists: 20, points: 34, pointsPerGame: 0.81, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 92 },
];

export const CURATED_PLAYERS_EU: PlayerSearchResult[] = [
  ...SHL_PLAYERS,
  ...LIIGA_PLAYERS,
  ...KHL_PLAYERS,
  ...DEL_PLAYERS,
  ...NL_PLAYERS,
  ...ELH_PLAYERS,
  ...J20_PLAYERS,
  ...MHL_PLAYERS,
];
