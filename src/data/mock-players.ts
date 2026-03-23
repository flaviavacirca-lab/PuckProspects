// Curated NHL prospect data for 2025-26 season.
// All players are prospect-level (not NHL regulars).
// Stats are realistic for each league's scoring environment.

import { PlayerSearchResult } from '@/types';
import { CURATED_PLAYERS_US } from './mock-players-us';
import { CURATED_PLAYERS_EU } from './mock-players-eu';

// ── AHL Prospects ──────────────────────────────────────────────
const AHL_PLAYERS: PlayerSearchResult[] = [
  { id: 1, fullName: 'Dalibor Dvorsky', position: 'C', age: 20, nationality: 'Slovakia', teamName: 'Springfield Thunderbirds', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 58, goals: 22, assists: 34, points: 56, pointsPerGame: 0.97, plusMinus: 14, draftStatus: 'drafted', nhlRightsHolder: 'St. Louis Blues', leaguePercentile: 92, agePercentile: 96 },
  { id: 2, fullName: 'Nate Danielson', position: 'C', age: 21, nationality: 'Canada', teamName: 'Grand Rapids Griffins', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 62, goals: 18, assists: 30, points: 48, pointsPerGame: 0.77, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Detroit Red Wings', leaguePercentile: 84, agePercentile: 88 },
  { id: 3, fullName: 'Oliver Moore', position: 'C', age: 20, nationality: 'USA', teamName: 'Cleveland Monsters', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 55, goals: 16, assists: 28, points: 44, pointsPerGame: 0.80, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'Columbus Blue Jackets', leaguePercentile: 86, agePercentile: 94 },
  { id: 4, fullName: 'Rutger McGroarty', position: 'LW', age: 21, nationality: 'USA', teamName: 'Wilkes-Barre/Scranton Penguins', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 60, goals: 24, assists: 26, points: 50, pointsPerGame: 0.83, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Pittsburgh Penguins', leaguePercentile: 88, agePercentile: 90 },
  { id: 5, fullName: 'David Reinbacher', position: 'D', age: 20, nationality: 'Austria', teamName: 'Laval Rocket', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 64, goals: 6, assists: 28, points: 34, pointsPerGame: 0.53, plusMinus: 12, draftStatus: 'drafted', nhlRightsHolder: 'Montreal Canadiens', leaguePercentile: 72, agePercentile: 88 },
  { id: 6, fullName: 'Carter Yakemchuk', position: 'D', age: 20, nationality: 'Canada', teamName: 'Belleville Senators', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 58, goals: 10, assists: 30, points: 40, pointsPerGame: 0.69, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Ottawa Senators', leaguePercentile: 78, agePercentile: 92 },
  { id: 7, fullName: 'Sam Dickinson', position: 'D', age: 20, nationality: 'Canada', teamName: 'San Jose Barracuda', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 60, goals: 8, assists: 32, points: 40, pointsPerGame: 0.67, plusMinus: 5, draftStatus: 'drafted', nhlRightsHolder: 'San Jose Sharks', leaguePercentile: 76, agePercentile: 90 },
  { id: 8, fullName: 'Anton Silayev', position: 'D', age: 20, nationality: 'Russia', teamName: 'Utica Comets', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 56, goals: 4, assists: 22, points: 26, pointsPerGame: 0.46, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'New Jersey Devils', leaguePercentile: 64, agePercentile: 82 },
  { id: 9, fullName: 'Cayden Lindstrom', position: 'C', age: 20, nationality: 'Canada', teamName: 'Cleveland Monsters', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 48, goals: 14, assists: 20, points: 34, pointsPerGame: 0.71, plusMinus: 4, draftStatus: 'drafted', nhlRightsHolder: 'Columbus Blue Jackets', leaguePercentile: 80, agePercentile: 90 },
  { id: 10, fullName: 'Jiri Kulich', position: 'C', age: 21, nationality: 'Czech Republic', teamName: 'Rochester Americans', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 62, goals: 26, assists: 28, points: 54, pointsPerGame: 0.87, plusMinus: 12, draftStatus: 'drafted', nhlRightsHolder: 'Buffalo Sabres', leaguePercentile: 90, agePercentile: 92 },
  { id: 11, fullName: 'Matthew Savoie', position: 'C', age: 21, nationality: 'Canada', teamName: 'Rochester Americans', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 58, goals: 20, assists: 32, points: 52, pointsPerGame: 0.90, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Buffalo Sabres', leaguePercentile: 91, agePercentile: 93 },
  { id: 12, fullName: 'Denton Mateychuk', position: 'D', age: 21, nationality: 'Canada', teamName: 'Cleveland Monsters', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 64, goals: 8, assists: 36, points: 44, pointsPerGame: 0.69, plusMinus: 16, draftStatus: 'drafted', nhlRightsHolder: 'Columbus Blue Jackets', leaguePercentile: 78, agePercentile: 86 },
  { id: 13, fullName: 'Trey Augustine', position: 'G', age: 20, nationality: 'USA', teamName: 'Grand Rapids Griffins', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 38, goals: 0, assists: 1, points: 1, pointsPerGame: 0.03, plusMinus: null, draftStatus: 'drafted', nhlRightsHolder: 'Detroit Red Wings', leaguePercentile: 85, agePercentile: 90 },
  { id: 14, fullName: 'Colby Barlow', position: 'LW', age: 20, nationality: 'Canada', teamName: 'Manitoba Moose', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 60, goals: 18, assists: 20, points: 38, pointsPerGame: 0.63, plusMinus: 2, draftStatus: 'drafted', nhlRightsHolder: 'Winnipeg Jets', leaguePercentile: 74, agePercentile: 86 },
  { id: 15, fullName: 'Ryan Leonard', position: 'RW', age: 21, nationality: 'USA', teamName: 'Hershey Bears', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 54, goals: 20, assists: 24, points: 44, pointsPerGame: 0.81, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Washington Capitals', leaguePercentile: 87, agePercentile: 91 },
  { id: 16, fullName: 'Cutter Gauthier', position: 'LW', age: 22, nationality: 'USA', teamName: 'San Diego Gulls', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 56, goals: 26, assists: 22, points: 48, pointsPerGame: 0.86, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'Anaheim Ducks', leaguePercentile: 89, agePercentile: 88 },
  { id: 17, fullName: 'Michael Hage', position: 'C', age: 19, nationality: 'Canada', teamName: 'Milwaukee Admirals', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 52, goals: 12, assists: 22, points: 34, pointsPerGame: 0.65, plusMinus: 4, draftStatus: 'drafted', nhlRightsHolder: 'Nashville Predators', leaguePercentile: 72, agePercentile: 94 },
  { id: 18, fullName: 'Theo Lindstein', position: 'D', age: 20, nationality: 'Sweden', teamName: 'Rockford IceHogs', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 58, goals: 5, assists: 20, points: 25, pointsPerGame: 0.43, plusMinus: 6, draftStatus: 'drafted', nhlRightsHolder: 'Chicago Blackhawks', leaguePercentile: 60, agePercentile: 78 },
];

// ── OHL Prospects ──────────────────────────────────────────────
const OHL_PLAYERS: PlayerSearchResult[] = [
  { id: 101, fullName: 'Porter Martone', position: 'RW', age: 18, nationality: 'Canada', teamName: 'Brampton Steelheads', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 54, goals: 42, assists: 50, points: 92, pointsPerGame: 1.70, plusMinus: 34, draftStatus: 'drafted', nhlRightsHolder: null, leaguePercentile: 99, agePercentile: 99 },
  { id: 102, fullName: 'Malcolm Spence', position: 'LW', age: 19, nationality: 'Canada', teamName: 'Erie Otters', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 56, goals: 36, assists: 40, points: 76, pointsPerGame: 1.36, plusMinus: 22, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 96, agePercentile: 95 },
  { id: 103, fullName: 'Beckett Sennecke', position: 'RW', age: 19, nationality: 'Canada', teamName: 'Oshawa Generals', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 52, goals: 34, assists: 44, points: 78, pointsPerGame: 1.50, plusMinus: 26, draftStatus: 'drafted', nhlRightsHolder: 'Anaheim Ducks', leaguePercentile: 97, agePercentile: 96 },
  { id: 104, fullName: 'Luca Pinelli', position: 'C', age: 20, nationality: 'Canada', teamName: 'Ottawa 67\'s', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 50, goals: 28, assists: 48, points: 76, pointsPerGame: 1.52, plusMinus: 20, draftStatus: 'drafted', nhlRightsHolder: 'Columbus Blue Jackets', leaguePercentile: 97, agePercentile: 93 },
  { id: 105, fullName: 'Easton Cowan', position: 'C', age: 20, nationality: 'Canada', teamName: 'London Knights', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 48, goals: 30, assists: 52, points: 82, pointsPerGame: 1.71, plusMinus: 30, draftStatus: 'drafted', nhlRightsHolder: 'Toronto Maple Leafs', leaguePercentile: 99, agePercentile: 96 },
  { id: 106, fullName: 'Zayne Parekh', position: 'D', age: 19, nationality: 'Canada', teamName: 'Saginaw Spirit', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 54, goals: 20, assists: 52, points: 72, pointsPerGame: 1.33, plusMinus: 28, draftStatus: 'drafted', nhlRightsHolder: 'Calgary Flames', leaguePercentile: 96, agePercentile: 98 },
  { id: 107, fullName: 'Liam Greentree', position: 'RW', age: 19, nationality: 'Canada', teamName: 'Windsor Spitfires', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 50, goals: 32, assists: 38, points: 70, pointsPerGame: 1.40, plusMinus: 18, draftStatus: 'drafted', nhlRightsHolder: 'Los Angeles Kings', leaguePercentile: 95, agePercentile: 96 },
  { id: 108, fullName: 'Henry Mews', position: 'D', age: 18, nationality: 'Canada', teamName: 'Ottawa 67\'s', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 56, goals: 12, assists: 40, points: 52, pointsPerGame: 0.93, plusMinus: 16, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 88, agePercentile: 94 },
  { id: 109, fullName: 'Carter George', position: 'G', age: 19, nationality: 'Canada', teamName: 'Owen Sound Attack', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 48, goals: 0, assists: 2, points: 2, pointsPerGame: 0.04, plusMinus: null, draftStatus: 'drafted', nhlRightsHolder: 'Los Angeles Kings', leaguePercentile: 90, agePercentile: 92 },
  { id: 110, fullName: 'Matthew Schaefer', position: 'D', age: 18, nationality: 'Canada', teamName: 'Erie Otters', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 52, goals: 14, assists: 38, points: 52, pointsPerGame: 1.00, plusMinus: 20, draftStatus: 'drafted', nhlRightsHolder: null, leaguePercentile: 90, agePercentile: 97 },
  { id: 111, fullName: 'Nick Lardis', position: 'LW', age: 19, nationality: 'Canada', teamName: 'Hamilton Bulldogs', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 56, goals: 40, assists: 30, points: 70, pointsPerGame: 1.25, plusMinus: 14, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 94, agePercentile: 94 },
  { id: 112, fullName: 'Ethan Procyszyn', position: 'C', age: 18, nationality: 'Canada', teamName: 'North Bay Battalion', leagueCode: 'ohl', leagueName: 'OHL', season: '2025-26', gamesPlayed: 54, goals: 24, assists: 32, points: 56, pointsPerGame: 1.04, plusMinus: 8, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 90, agePercentile: 92 },
];

// ── WHL Prospects ──────────────────────────────────────────────
const WHL_PLAYERS: PlayerSearchResult[] = [
  { id: 201, fullName: 'Berkly Catton', position: 'C', age: 19, nationality: 'Canada', teamName: 'Spokane Chiefs', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 52, goals: 32, assists: 56, points: 88, pointsPerGame: 1.69, plusMinus: 28, draftStatus: 'drafted', nhlRightsHolder: 'Seattle Kraken', leaguePercentile: 98, agePercentile: 97 },
  { id: 202, fullName: 'Andrew Cristall', position: 'LW', age: 20, nationality: 'Canada', teamName: 'Kelowna Rockets', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 48, goals: 34, assists: 50, points: 84, pointsPerGame: 1.75, plusMinus: 20, draftStatus: 'drafted', nhlRightsHolder: 'Washington Capitals', leaguePercentile: 99, agePercentile: 95 },
  { id: 203, fullName: 'Brayden Yager', position: 'C', age: 20, nationality: 'Canada', teamName: 'Moose Jaw Warriors', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 54, goals: 28, assists: 44, points: 72, pointsPerGame: 1.33, plusMinus: 18, draftStatus: 'drafted', nhlRightsHolder: 'Winnipeg Jets', leaguePercentile: 95, agePercentile: 92 },
  { id: 204, fullName: 'Tij Iginla', position: 'LW', age: 19, nationality: 'Canada', teamName: 'Kelowna Rockets', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 50, goals: 36, assists: 38, points: 74, pointsPerGame: 1.48, plusMinus: 24, draftStatus: 'drafted', nhlRightsHolder: 'Utah Hockey Club', leaguePercentile: 96, agePercentile: 97 },
  { id: 205, fullName: 'Sawyer Mynio', position: 'D', age: 19, nationality: 'USA', teamName: 'Seattle Thunderbirds', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 56, goals: 12, assists: 38, points: 50, pointsPerGame: 0.89, plusMinus: 20, draftStatus: 'drafted', nhlRightsHolder: 'Nashville Predators', leaguePercentile: 86, agePercentile: 90 },
  { id: 206, fullName: 'Tanner Howe', position: 'C', age: 20, nationality: 'Canada', teamName: 'Regina Pats', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 56, goals: 30, assists: 40, points: 70, pointsPerGame: 1.25, plusMinus: 16, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 94, agePercentile: 90 },
  { id: 207, fullName: 'Mazden Leslie', position: 'D', age: 19, nationality: 'Canada', teamName: 'Vancouver Giants', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 54, goals: 16, assists: 40, points: 56, pointsPerGame: 1.04, plusMinus: 22, draftStatus: 'drafted', nhlRightsHolder: 'Vegas Golden Knights', leaguePercentile: 90, agePercentile: 94 },
  { id: 208, fullName: 'Harrison Brunicke', position: 'D', age: 20, nationality: 'Canada', teamName: 'Kamloops Blazers', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 52, goals: 8, assists: 30, points: 38, pointsPerGame: 0.73, plusMinus: 14, draftStatus: 'drafted', nhlRightsHolder: 'Pittsburgh Penguins', leaguePercentile: 80, agePercentile: 82 },
  { id: 209, fullName: 'Lukas Dragicevic', position: 'D', age: 20, nationality: 'Canada', teamName: 'Tri-City Americans', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 52, goals: 14, assists: 42, points: 56, pointsPerGame: 1.08, plusMinus: 18, draftStatus: 'drafted', nhlRightsHolder: 'Seattle Kraken', leaguePercentile: 91, agePercentile: 92 },
  { id: 210, fullName: 'Carson Rehkopf', position: 'C', age: 19, nationality: 'Canada', teamName: 'Spokane Chiefs', leagueCode: 'whl', leagueName: 'WHL', season: '2025-26', gamesPlayed: 52, goals: 28, assists: 32, points: 60, pointsPerGame: 1.15, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Seattle Kraken', leaguePercentile: 92, agePercentile: 93 },
];

// ── QMJHL Prospects ────────────────────────────────────────────
const QMJHL_PLAYERS: PlayerSearchResult[] = [
  { id: 301, fullName: 'Ivan Demidov', position: 'RW', age: 20, nationality: 'Russia', teamName: 'Laval Rocket', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 48, goals: 32, assists: 52, points: 84, pointsPerGame: 1.75, plusMinus: 26, draftStatus: 'drafted', nhlRightsHolder: 'Montreal Canadiens', leaguePercentile: 99, agePercentile: 98 },
  { id: 302, fullName: 'Caleb Desnoyers', position: 'C', age: 19, nationality: 'Canada', teamName: 'Moncton Wildcats', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 54, goals: 28, assists: 46, points: 74, pointsPerGame: 1.37, plusMinus: 18, draftStatus: 'drafted', nhlRightsHolder: 'Philadelphia Flyers', leaguePercentile: 96, agePercentile: 96 },
  { id: 303, fullName: 'Alexis Bernier', position: 'G', age: 18, nationality: 'Canada', teamName: 'Moncton Wildcats', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 46, goals: 0, assists: 3, points: 3, pointsPerGame: 0.07, plusMinus: null, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 92, agePercentile: 96 },
  { id: 304, fullName: 'Gabriel Filion', position: 'C', age: 18, nationality: 'Canada', teamName: 'Sherbrooke Phoenix', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 56, goals: 30, assists: 36, points: 66, pointsPerGame: 1.18, plusMinus: 14, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 92, agePercentile: 95 },
  { id: 305, fullName: 'Justin Poirier', position: 'RW', age: 19, nationality: 'Canada', teamName: 'Baie-Comeau Drakkar', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 50, goals: 38, assists: 30, points: 68, pointsPerGame: 1.36, plusMinus: 12, draftStatus: 'drafted', nhlRightsHolder: 'Calgary Flames', leaguePercentile: 95, agePercentile: 95 },
  { id: 306, fullName: 'Dorian Muiser', position: 'D', age: 18, nationality: 'Canada', teamName: 'Halifax Mooseheads', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 54, goals: 10, assists: 34, points: 44, pointsPerGame: 0.81, plusMinus: 16, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 84, agePercentile: 92 },
  { id: 307, fullName: 'Louis-Charles Plourde', position: 'LW', age: 19, nationality: 'Canada', teamName: 'Chicoutimi Sagueneens', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 52, goals: 24, assists: 28, points: 52, pointsPerGame: 1.00, plusMinus: 8, draftStatus: 'drafted', nhlRightsHolder: 'Tampa Bay Lightning', leaguePercentile: 88, agePercentile: 88 },
  { id: 308, fullName: 'Emile Guité', position: 'RW', age: 18, nationality: 'Canada', teamName: 'Rimouski Oceanic', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 56, goals: 22, assists: 30, points: 52, pointsPerGame: 0.93, plusMinus: 6, draftStatus: 'draft_eligible', nhlRightsHolder: null, leaguePercentile: 86, agePercentile: 90 },
];

const CURATED_PLAYERS_NA: PlayerSearchResult[] = [
  ...AHL_PLAYERS,
  ...OHL_PLAYERS,
  ...WHL_PLAYERS,
  ...QMJHL_PLAYERS,
];

// ── Combine all regions ────────────────────────────────────────
const RAW_ALL_PLAYERS: PlayerSearchResult[] = [
  ...CURATED_PLAYERS_NA,
  ...CURATED_PLAYERS_US,
  ...CURATED_PLAYERS_EU,
];

// ── Recalculate percentiles across the full dataset ────────────
function calculatePercentiles(players: PlayerSearchResult[]): void {
  // League percentile: PPG rank among all skaters (goalies keep their manual value)
  const skaters = players.filter(p => p.position !== 'G');
  const sortedByPpg = [...skaters].sort((a, b) => a.pointsPerGame - b.pointsPerGame);
  const n = sortedByPpg.length;
  sortedByPpg.forEach((player, i) => {
    player.leaguePercentile = Math.round((i / (n - 1 || 1)) * 100);
  });

  // Age percentile: PPG rank within same age group
  const byAge = new Map<number, PlayerSearchResult[]>();
  for (const p of skaters) {
    const group = byAge.get(p.age) || [];
    group.push(p);
    byAge.set(p.age, group);
  }
  byAge.forEach((group) => {
    const sorted = [...group].sort((a, b) => a.pointsPerGame - b.pointsPerGame);
    const len = sorted.length;
    sorted.forEach((player, i) => {
      player.agePercentile = Math.round((i / (len - 1 || 1)) * 100);
    });
  });
}

calculatePercentiles(RAW_ALL_PLAYERS);

/** All curated prospect data — the primary export for mock mode. */
export const ALL_MOCK_PLAYERS: PlayerSearchResult[] = RAW_ALL_PLAYERS;

/** Top-tier hand-picked prospects only (AHL + CHL). */
export const MOCK_PLAYERS: PlayerSearchResult[] = CURATED_PLAYERS_NA;
