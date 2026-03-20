// Realistic mock prospect data for development and demo purposes.
// These represent fictional players with realistic stat lines.

import { PlayerSearchResult, DraftStatus, Position } from '@/types';

const NHL_TEAMS = [
  'Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres',
  'Calgary Flames', 'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche',
  'Columbus Blue Jackets', 'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers',
  'Florida Panthers', 'Los Angeles Kings', 'Minnesota Wild', 'Montreal Canadiens',
  'Nashville Predators', 'New Jersey Devils', 'New York Islanders', 'New York Rangers',
  'Ottawa Senators', 'Philadelphia Flyers', 'Pittsburgh Penguins', 'San Jose Sharks',
  'Seattle Kraken', 'St. Louis Blues', 'Tampa Bay Lightning', 'Toronto Maple Leafs',
  'Vancouver Canucks', 'Vegas Golden Knights', 'Washington Capitals', 'Winnipeg Jets',
];

const NATIONALITIES = [
  'Canada', 'USA', 'Sweden', 'Finland', 'Russia', 'Czech Republic',
  'Switzerland', 'Germany', 'Slovakia', 'Latvia', 'Denmark', 'Austria',
];

function r(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Hand-crafted top prospects for realism
export const MOCK_PLAYERS: PlayerSearchResult[] = [
  // ── AHL ──
  { id: 1,  fullName: 'Logan Stankoven',   position: 'C',  age: 21, nationality: 'Canada',    teamName: 'Texas Stars',          leagueCode: 'ahl',   leagueName: 'AHL',   season: '2025-26', gamesPlayed: 52, goals: 24, assists: 38, points: 62, pointsPerGame: 1.19, plusMinus: 18,  draftStatus: 'drafted', nhlRightsHolder: 'Dallas Stars',        leaguePercentile: 97, agePercentile: 98 },
  { id: 2,  fullName: 'Matthew Knies',     position: 'LW', age: 22, nationality: 'USA',       teamName: 'Toronto Marlies',      leagueCode: 'ahl',   leagueName: 'AHL',   season: '2025-26', gamesPlayed: 48, goals: 22, assists: 30, points: 52, pointsPerGame: 1.08, plusMinus: 12,  draftStatus: 'drafted', nhlRightsHolder: 'Toronto Maple Leafs', leaguePercentile: 94, agePercentile: 95 },
  { id: 3,  fullName: 'Brandt Clarke',     position: 'D',  age: 21, nationality: 'Canada',    teamName: 'Ontario Reign',        leagueCode: 'ahl',   leagueName: 'AHL',   season: '2025-26', gamesPlayed: 55, goals: 10, assists: 40, points: 50, pointsPerGame: 0.91, plusMinus: 15,  draftStatus: 'drafted', nhlRightsHolder: 'Los Angeles Kings',   leaguePercentile: 92, agePercentile: 96 },
  { id: 4,  fullName: 'Tyson Foerster',    position: 'RW', age: 22, nationality: 'Canada',    teamName: 'Lehigh Valley Phantoms', leagueCode: 'ahl', leagueName: 'AHL',   season: '2025-26', gamesPlayed: 50, goals: 28, assists: 24, points: 52, pointsPerGame: 1.04, plusMinus: 8,   draftStatus: 'drafted', nhlRightsHolder: 'Philadelphia Flyers', leaguePercentile: 93, agePercentile: 94 },
  { id: 5,  fullName: 'Shane Wright',      position: 'C',  age: 21, nationality: 'Canada',    teamName: 'Coachella Valley Firebirds', leagueCode: 'ahl', leagueName: 'AHL', season: '2025-26', gamesPlayed: 54, goals: 20, assists: 35, points: 55, pointsPerGame: 1.02, plusMinus: 10, draftStatus: 'drafted', nhlRightsHolder: 'Seattle Kraken',     leaguePercentile: 95, agePercentile: 96 },

  // ── OHL ──
  { id: 6,  fullName: 'Michael Misa',      position: 'C',  age: 17, nationality: 'Canada',    teamName: 'Saginaw Spirit',       leagueCode: 'ohl',   leagueName: 'OHL',   season: '2025-26', gamesPlayed: 50, goals: 38, assists: 52, points: 90, pointsPerGame: 1.80, plusMinus: 32,  draftStatus: 'draft_eligible', nhlRightsHolder: null,          leaguePercentile: 99, agePercentile: 99 },
  { id: 7,  fullName: 'Beckett Sennecke',  position: 'RW', age: 18, nationality: 'Canada',    teamName: 'Oshawa Generals',      leagueCode: 'ohl',   leagueName: 'OHL',   season: '2025-26', gamesPlayed: 48, goals: 32, assists: 40, points: 72, pointsPerGame: 1.50, plusMinus: 20,  draftStatus: 'drafted', nhlRightsHolder: 'Anaheim Ducks',       leaguePercentile: 96, agePercentile: 97 },
  { id: 8,  fullName: 'Luca Pinelli',      position: 'C',  age: 19, nationality: 'Canada',    teamName: 'Ottawa 67\'s',         leagueCode: 'ohl',   leagueName: 'OHL',   season: '2025-26', gamesPlayed: 52, goals: 30, assists: 45, points: 75, pointsPerGame: 1.44, plusMinus: 22,  draftStatus: 'drafted', nhlRightsHolder: 'Columbus Blue Jackets', leaguePercentile: 95, agePercentile: 94 },
  { id: 9,  fullName: 'Easton Cowan',      position: 'C',  age: 19, nationality: 'Canada',    teamName: 'London Knights',       leagueCode: 'ohl',   leagueName: 'OHL',   season: '2025-26', gamesPlayed: 50, goals: 28, assists: 50, points: 78, pointsPerGame: 1.56, plusMinus: 28,  draftStatus: 'drafted', nhlRightsHolder: 'Toronto Maple Leafs', leaguePercentile: 97, agePercentile: 96 },
  { id: 10, fullName: 'Zayne Parekh',      position: 'D',  age: 18, nationality: 'Canada',    teamName: 'Saginaw Spirit',       leagueCode: 'ohl',   leagueName: 'OHL',   season: '2025-26', gamesPlayed: 52, goals: 22, assists: 55, points: 77, pointsPerGame: 1.48, plusMinus: 25,  draftStatus: 'drafted', nhlRightsHolder: 'Calgary Flames',     leaguePercentile: 98, agePercentile: 99 },

  // ── WHL ──
  { id: 11, fullName: 'Tij Iginla',        position: 'LW', age: 18, nationality: 'Canada',    teamName: 'Kelowna Rockets',      leagueCode: 'whl',   leagueName: 'WHL',   season: '2025-26', gamesPlayed: 48, goals: 35, assists: 40, points: 75, pointsPerGame: 1.56, plusMinus: 24,  draftStatus: 'drafted', nhlRightsHolder: 'Utah Hockey Club',   leaguePercentile: 97, agePercentile: 98 },
  { id: 12, fullName: 'Berkly Catton',      position: 'C',  age: 18, nationality: 'Canada',    teamName: 'Spokane Chiefs',       leagueCode: 'whl',   leagueName: 'WHL',   season: '2025-26', gamesPlayed: 50, goals: 30, assists: 55, points: 85, pointsPerGame: 1.70, plusMinus: 22,  draftStatus: 'drafted', nhlRightsHolder: 'Seattle Kraken',     leaguePercentile: 98, agePercentile: 99 },
  { id: 13, fullName: 'Andrew Cristall',    position: 'LW', age: 19, nationality: 'Canada',    teamName: 'Kelowna Rockets',      leagueCode: 'whl',   leagueName: 'WHL',   season: '2025-26', gamesPlayed: 46, goals: 32, assists: 48, points: 80, pointsPerGame: 1.74, plusMinus: 18,  draftStatus: 'drafted', nhlRightsHolder: 'Washington Capitals', leaguePercentile: 98, agePercentile: 97 },
  { id: 14, fullName: 'Brayden Yager',     position: 'C',  age: 19, nationality: 'Canada',    teamName: 'Moose Jaw Warriors',   leagueCode: 'whl',   leagueName: 'WHL',   season: '2025-26', gamesPlayed: 52, goals: 28, assists: 42, points: 70, pointsPerGame: 1.35, plusMinus: 15,  draftStatus: 'drafted', nhlRightsHolder: 'Winnipeg Jets',      leaguePercentile: 94, agePercentile: 93 },

  // ── QMJHL ──
  { id: 15, fullName: 'Ivan Demidov',       position: 'RW', age: 19, nationality: 'Russia',    teamName: 'Blainville-Boisbriand Armada', leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 45, goals: 30, assists: 50, points: 80, pointsPerGame: 1.78, plusMinus: 20, draftStatus: 'drafted', nhlRightsHolder: 'Montreal Canadiens', leaguePercentile: 98, agePercentile: 98 },
  { id: 16, fullName: 'Caleb Desnoyers',    position: 'C',  age: 18, nationality: 'Canada',    teamName: 'Moncton Wildcats',     leagueCode: 'qmjhl', leagueName: 'QMJHL', season: '2025-26', gamesPlayed: 50, goals: 25, assists: 45, points: 70, pointsPerGame: 1.40, plusMinus: 16,  draftStatus: 'draft_eligible', nhlRightsHolder: null,         leaguePercentile: 95, agePercentile: 96 },

  // ── NCAA ──
  { id: 17, fullName: 'Macklin Celebrini',  position: 'C',  age: 19, nationality: 'Canada',    teamName: 'Boston University',    leagueCode: 'ncaa',  leagueName: 'NCAA',  season: '2025-26', gamesPlayed: 34, goals: 22, assists: 28, points: 50, pointsPerGame: 1.47, plusMinus: 18,  draftStatus: 'drafted', nhlRightsHolder: 'San Jose Sharks',    leaguePercentile: 99, agePercentile: 99 },
  { id: 18, fullName: 'Will Smith',         position: 'C',  age: 19, nationality: 'USA',       teamName: 'Boston College',       leagueCode: 'ncaa',  leagueName: 'NCAA',  season: '2025-26', gamesPlayed: 36, goals: 18, assists: 32, points: 50, pointsPerGame: 1.39, plusMinus: 15,  draftStatus: 'drafted', nhlRightsHolder: 'San Jose Sharks',    leaguePercentile: 98, agePercentile: 98 },
  { id: 19, fullName: 'Trevor Connelly',    position: 'LW', age: 19, nationality: 'USA',       teamName: 'Providence College',   leagueCode: 'ncaa',  leagueName: 'NCAA',  season: '2025-26', gamesPlayed: 34, goals: 16, assists: 25, points: 41, pointsPerGame: 1.21, plusMinus: 12,  draftStatus: 'drafted', nhlRightsHolder: 'Vegas Golden Knights', leaguePercentile: 94, agePercentile: 95 },

  // ── USHL ──
  { id: 20, fullName: 'James Hagens',       position: 'C',  age: 17, nationality: 'USA',       teamName: 'US NTDP U18',          leagueCode: 'ushl',  leagueName: 'USHL',  season: '2025-26', gamesPlayed: 40, goals: 25, assists: 42, points: 67, pointsPerGame: 1.68, plusMinus: 22,  draftStatus: 'draft_eligible', nhlRightsHolder: null,         leaguePercentile: 99, agePercentile: 99 },
  { id: 21, fullName: 'Cole Eiserman',      position: 'LW', age: 17, nationality: 'USA',       teamName: 'US NTDP U18',          leagueCode: 'ushl',  leagueName: 'USHL',  season: '2025-26', gamesPlayed: 42, goals: 40, assists: 28, points: 68, pointsPerGame: 1.62, plusMinus: 18,  draftStatus: 'draft_eligible', nhlRightsHolder: null,         leaguePercentile: 99, agePercentile: 99 },

  // ── SHL ──
  { id: 22, fullName: 'Leo Carlsson',       position: 'C',  age: 20, nationality: 'Sweden',    teamName: 'Örebro HK',            leagueCode: 'shl',   leagueName: 'SHL',   season: '2025-26', gamesPlayed: 45, goals: 18, assists: 25, points: 43, pointsPerGame: 0.96, plusMinus: 10,  draftStatus: 'drafted', nhlRightsHolder: 'Anaheim Ducks',      leaguePercentile: 90, agePercentile: 95 },
  { id: 23, fullName: 'Axel Sandin Pellikka', position: 'D', age: 19, nationality: 'Sweden',   teamName: 'Skellefteå AIK',       leagueCode: 'shl',   leagueName: 'SHL',   season: '2025-26', gamesPlayed: 48, goals: 8,  assists: 28, points: 36, pointsPerGame: 0.75, plusMinus: 14,  draftStatus: 'drafted', nhlRightsHolder: 'Detroit Red Wings',  leaguePercentile: 85, agePercentile: 94 },
  { id: 24, fullName: 'Tom Willander',      position: 'D',  age: 19, nationality: 'Sweden',    teamName: 'Rögle BK',             leagueCode: 'shl',   leagueName: 'SHL',   season: '2025-26', gamesPlayed: 46, goals: 6,  assists: 22, points: 28, pointsPerGame: 0.61, plusMinus: 12,  draftStatus: 'drafted', nhlRightsHolder: 'Vancouver Canucks',  leaguePercentile: 78, agePercentile: 90 },

  // ── Liiga ──
  { id: 25, fullName: 'Joakim Kemell',      position: 'RW', age: 20, nationality: 'Finland',   teamName: 'JYP',                  leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 50, goals: 20, assists: 22, points: 42, pointsPerGame: 0.84, plusMinus: 8,   draftStatus: 'drafted', nhlRightsHolder: 'Nashville Predators', leaguePercentile: 88, agePercentile: 93 },
  { id: 26, fullName: 'Kasper Halttunen',   position: 'RW', age: 19, nationality: 'Finland',   teamName: 'Ilves',                leagueCode: 'liiga', leagueName: 'Liiga', season: '2025-26', gamesPlayed: 48, goals: 16, assists: 18, points: 34, pointsPerGame: 0.71, plusMinus: 5,   draftStatus: 'drafted', nhlRightsHolder: 'San Jose Sharks',    leaguePercentile: 80, agePercentile: 88 },

  // ── KHL ──
  { id: 27, fullName: 'Matvei Michkov',     position: 'RW', age: 20, nationality: 'Russia',    teamName: 'SKA St. Petersburg',   leagueCode: 'khl',   leagueName: 'KHL',   season: '2025-26', gamesPlayed: 50, goals: 22, assists: 30, points: 52, pointsPerGame: 1.04, plusMinus: 12,  draftStatus: 'drafted', nhlRightsHolder: 'Philadelphia Flyers', leaguePercentile: 92, agePercentile: 98 },
  { id: 28, fullName: 'Danila Yurov',       position: 'LW', age: 20, nationality: 'Russia',    teamName: 'Metallurg Magnitogorsk', leagueCode: 'khl', leagueName: 'KHL',   season: '2025-26', gamesPlayed: 48, goals: 14, assists: 20, points: 34, pointsPerGame: 0.71, plusMinus: 6,  draftStatus: 'drafted', nhlRightsHolder: 'Minnesota Wild',     leaguePercentile: 75, agePercentile: 85 },

  // ── DEL ──
  { id: 29, fullName: 'Lian Bichsel',       position: 'D',  age: 20, nationality: 'Switzerland', teamName: 'Düsseldorfer EG',    leagueCode: 'del',   leagueName: 'DEL',   season: '2025-26', gamesPlayed: 46, goals: 5,  assists: 18, points: 23, pointsPerGame: 0.50, plusMinus: 8,   draftStatus: 'drafted', nhlRightsHolder: 'Dallas Stars',       leaguePercentile: 72, agePercentile: 82 },

  // ── NL (Swiss) ──
  { id: 30, fullName: 'David Reinbacher',   position: 'D',  age: 19, nationality: 'Austria',   teamName: 'EHC Kloten',           leagueCode: 'nl',    leagueName: 'NL',    season: '2025-26', gamesPlayed: 44, goals: 4,  assists: 20, points: 24, pointsPerGame: 0.55, plusMinus: 10,  draftStatus: 'drafted', nhlRightsHolder: 'Montreal Canadiens', leaguePercentile: 74, agePercentile: 88 },

  // ── ELH (Czech) ──
  { id: 31, fullName: 'Eduard Sale',        position: 'LW', age: 18, nationality: 'Czech Republic', teamName: 'HC Kometa Brno',  leagueCode: 'elh',   leagueName: 'ELH',   season: '2025-26', gamesPlayed: 42, goals: 12, assists: 18, points: 30, pointsPerGame: 0.71, plusMinus: 4,   draftStatus: 'drafted', nhlRightsHolder: 'Seattle Kraken',     leaguePercentile: 78, agePercentile: 92 },

  // ── ECHL ──
  { id: 32, fullName: 'Nikita Artamonov',   position: 'LW', age: 20, nationality: 'Russia',    teamName: 'Allen Americans',      leagueCode: 'echl',  leagueName: 'ECHL',  season: '2025-26', gamesPlayed: 50, goals: 18, assists: 22, points: 40, pointsPerGame: 0.80, plusMinus: 6,   draftStatus: 'drafted', nhlRightsHolder: 'Toronto Maple Leafs', leaguePercentile: 82, agePercentile: 85 },

  // ── BCHL ──
  { id: 33, fullName: 'Carson Wetsch',      position: 'C',  age: 18, nationality: 'Canada',    teamName: 'Trail Smoke Eaters',   leagueCode: 'bchl',  leagueName: 'BCHL',  season: '2025-26', gamesPlayed: 48, goals: 25, assists: 35, points: 60, pointsPerGame: 1.25, plusMinus: 18,  draftStatus: 'draft_eligible', nhlRightsHolder: null,         leaguePercentile: 94, agePercentile: 95 },

  // ── NAHL ──
  { id: 34, fullName: 'Jack Munroe',        position: 'D',  age: 18, nationality: 'USA',       teamName: 'Lone Star Brahmas',    leagueCode: 'nahl',  leagueName: 'NAHL',  season: '2025-26', gamesPlayed: 46, goals: 8,  assists: 28, points: 36, pointsPerGame: 0.78, plusMinus: 14,  draftStatus: 'draft_eligible', nhlRightsHolder: null,         leaguePercentile: 88, agePercentile: 90 },

  // ── NTDP ──
  { id: 35, fullName: 'Porter Martone',     position: 'RW', age: 17, nationality: 'Canada',    teamName: 'US NTDP U18',          leagueCode: 'usntdp', leagueName: 'NTDP', season: '2025-26', gamesPlayed: 38, goals: 28, assists: 30, points: 58, pointsPerGame: 1.53, plusMinus: 20,  draftStatus: 'draft_eligible', nhlRightsHolder: null,         leaguePercentile: 98, agePercentile: 99 },
];

// Generate additional filler players for each league to make the dashboard feel full
function generateFillerPlayers(): PlayerSearchResult[] {
  const firstNames = ['Alex', 'Ryan', 'Jake', 'Connor', 'Tyler', 'Dylan', 'Ethan', 'Nathan', 'Lucas', 'Noah', 'Liam', 'Oliver', 'Elias', 'Marcus', 'Viktor', 'Niklas', 'Oskar', 'Emil', 'Anton', 'Filip', 'Mikael', 'Jesper', 'Rasmus', 'Henrik', 'Artemi', 'Kirill', 'Ivan', 'Pavel', 'Andrei', 'Dmitri', 'Matej', 'Jakub', 'Dominik', 'Adam', 'Samuel', 'Niko', 'Juuso', 'Kaapo', 'Eeli', 'Patrik'];
  const lastNames = ['Anderson', 'Johnson', 'Williams', 'Brown', 'Wilson', 'Smith', 'Thompson', 'Miller', 'Davis', 'Garcia', 'Lindgren', 'Eriksson', 'Pettersson', 'Svensson', 'Johansson', 'Koivisto', 'Mäkinen', 'Virtanen', 'Heiskanen', 'Rantanen', 'Voronov', 'Kuznetsov', 'Sokolov', 'Novak', 'Krejci', 'Dvorak', 'Schneider', 'Weber', 'Bauer', 'Fischer'];
  const positions: Position[] = ['C', 'LW', 'RW', 'D', 'G'];
  const leagueMapping: { code: string; name: string; teams: string[] }[] = [
    { code: 'ahl', name: 'AHL', teams: ['Providence Bruins', 'Hartford Wolf Pack', 'Bridgeport Islanders', 'Rochester Americans', 'Syracuse Crunch', 'Laval Rocket', 'Belleville Senators', 'Manitoba Moose', 'Abbotsford Canucks', 'Henderson Silver Knights'] },
    { code: 'ohl', name: 'OHL', teams: ['Peterborough Petes', 'Sudbury Wolves', 'Barrie Colts', 'Kingston Frontenacs', 'Hamilton Bulldogs', 'Niagara IceDogs', 'Guelph Storm', 'Kitchener Rangers'] },
    { code: 'whl', name: 'WHL', teams: ['Portland Winterhawks', 'Everett Silvertips', 'Kamloops Blazers', 'Prince George Cougars', 'Red Deer Rebels', 'Medicine Hat Tigers', 'Regina Pats', 'Saskatoon Blades'] },
    { code: 'qmjhl', name: 'QMJHL', teams: ['Halifax Mooseheads', 'Rimouski Océanic', 'Chicoutimi Saguenéens', 'Sherbrooke Phoenix', 'Québec Remparts', 'Gatineau Olympiques', 'Cape Breton Eagles'] },
    { code: 'ncaa', name: 'NCAA', teams: ['University of Michigan', 'University of Minnesota', 'Denver University', 'Notre Dame', 'Michigan State', 'Wisconsin', 'North Dakota', 'Quinnipiac'] },
    { code: 'ushl', name: 'USHL', teams: ['Chicago Steel', 'Dubuque Fighting Saints', 'Green Bay Gamblers', 'Muskegon Lumberjacks', 'Sioux Falls Stampede', 'Tri-City Storm', 'Youngstown Phantoms'] },
    { code: 'shl', name: 'SHL', teams: ['Frölunda HC', 'Luleå HF', 'Färjestad BK', 'Djurgårdens IF', 'HV71', 'Växjö Lakers', 'Linköping HC'] },
    { code: 'liiga', name: 'Liiga', teams: ['TPS', 'HIFK', 'Tappara', 'Kärpät', 'Lukko', 'Pelicans', 'SaiPa'] },
    { code: 'khl', name: 'KHL', teams: ['CSKA Moscow', 'Dynamo Moscow', 'Ak Bars Kazan', 'Salavat Yulaev', 'Traktor Chelyabinsk'] },
  ];

  const players: PlayerSearchResult[] = [];
  let id = 100;

  for (const league of leagueMapping) {
    const count = league.code === 'ahl' ? 30 : league.code === 'khl' ? 10 : 15;
    for (let i = 0; i < count; i++) {
      const pos = pick(positions);
      const posGroup = pos === 'G' ? 'G' : pos === 'D' ? 'D' : 'F';
      const age = league.code === 'ahl' || league.code === 'khl' || league.code === 'shl' || league.code === 'liiga'
        ? r(20, 26) : r(16, 20);
      const gp = r(30, 55);
      const isGoalie = pos === 'G';
      const goals = isGoalie ? 0 : posGroup === 'D' ? r(2, 15) : r(5, 35);
      const assists = isGoalie ? 0 : posGroup === 'D' ? r(8, 30) : r(10, 45);
      const pts = goals + assists;
      const ppg = gp > 0 ? Math.round((pts / gp) * 100) / 100 : 0;
      const drafted = Math.random() > 0.4;

      players.push({
        id: id++,
        fullName: `${pick(firstNames)} ${pick(lastNames)}`,
        position: pos,
        age,
        nationality: pick(NATIONALITIES),
        teamName: pick(league.teams),
        leagueCode: league.code,
        leagueName: league.name,
        season: '2025-26',
        gamesPlayed: gp,
        goals,
        assists,
        points: pts,
        pointsPerGame: ppg,
        plusMinus: r(-15, 25),
        draftStatus: drafted ? 'drafted' : (age <= 18 ? 'draft_eligible' : 'undrafted'),
        nhlRightsHolder: drafted ? pick(NHL_TEAMS) : null,
        leaguePercentile: r(20, 95),
        agePercentile: r(25, 98),
      });
    }
  }

  return players;
}

export const ALL_MOCK_PLAYERS: PlayerSearchResult[] = [
  ...MOCK_PLAYERS,
  ...generateFillerPlayers(),
];
