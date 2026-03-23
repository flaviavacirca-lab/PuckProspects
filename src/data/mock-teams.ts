// Curated mock team data for 2025-26 season.
// Covers teams referenced in the prospect dataset.

import { Team } from '@/types';

export const MOCK_TEAMS: Team[] = [
  // ── AHL ──
  { id: 1, name: 'Springfield Thunderbirds', shortName: 'SPR', leagueId: 1, city: 'Springfield', country: 'USA', nhlAffiliateId: 101 },
  { id: 2, name: 'Grand Rapids Griffins', shortName: 'GR', leagueId: 1, city: 'Grand Rapids', country: 'USA', nhlAffiliateId: 102 },
  { id: 3, name: 'Cleveland Monsters', shortName: 'CLE', leagueId: 1, city: 'Cleveland', country: 'USA', nhlAffiliateId: 103 },
  { id: 4, name: 'Wilkes-Barre/Scranton Penguins', shortName: 'WBS', leagueId: 1, city: 'Wilkes-Barre', country: 'USA', nhlAffiliateId: 104 },
  { id: 5, name: 'Laval Rocket', shortName: 'LAV', leagueId: 1, city: 'Laval', country: 'Canada', nhlAffiliateId: 105 },
  { id: 6, name: 'Belleville Senators', shortName: 'BEL', leagueId: 1, city: 'Belleville', country: 'Canada', nhlAffiliateId: 106 },
  { id: 7, name: 'San Jose Barracuda', shortName: 'SJ', leagueId: 1, city: 'San Jose', country: 'USA', nhlAffiliateId: 107 },
  { id: 8, name: 'Utica Comets', shortName: 'UTI', leagueId: 1, city: 'Utica', country: 'USA', nhlAffiliateId: 108 },
  { id: 9, name: 'Rochester Americans', shortName: 'ROC', leagueId: 1, city: 'Rochester', country: 'USA', nhlAffiliateId: 109 },
  { id: 10, name: 'Manitoba Moose', shortName: 'MB', leagueId: 1, city: 'Winnipeg', country: 'Canada', nhlAffiliateId: 110 },
  { id: 11, name: 'Hershey Bears', shortName: 'HER', leagueId: 1, city: 'Hershey', country: 'USA', nhlAffiliateId: 111 },
  { id: 12, name: 'San Diego Gulls', shortName: 'SD', leagueId: 1, city: 'San Diego', country: 'USA', nhlAffiliateId: 112 },
  { id: 13, name: 'Milwaukee Admirals', shortName: 'MIL', leagueId: 1, city: 'Milwaukee', country: 'USA', nhlAffiliateId: 113 },
  { id: 14, name: 'Rockford IceHogs', shortName: 'RFD', leagueId: 1, city: 'Rockford', country: 'USA', nhlAffiliateId: 114 },
  { id: 15, name: 'Ontario Reign', shortName: 'ONT', leagueId: 1, city: 'Ontario', country: 'USA', nhlAffiliateId: 115 },

  // ── OHL ──
  { id: 101, name: 'Brampton Steelheads', shortName: 'BRP', leagueId: 2, city: 'Brampton', country: 'Canada', nhlAffiliateId: null },
  { id: 102, name: 'Erie Otters', shortName: 'ER', leagueId: 2, city: 'Erie', country: 'USA', nhlAffiliateId: null },
  { id: 103, name: 'Oshawa Generals', shortName: 'OSH', leagueId: 2, city: 'Oshawa', country: 'Canada', nhlAffiliateId: null },
  { id: 104, name: "Ottawa 67's", shortName: 'OTT', leagueId: 2, city: 'Ottawa', country: 'Canada', nhlAffiliateId: null },
  { id: 105, name: 'London Knights', shortName: 'LDN', leagueId: 2, city: 'London', country: 'Canada', nhlAffiliateId: null },
  { id: 106, name: 'Saginaw Spirit', shortName: 'SAG', leagueId: 2, city: 'Saginaw', country: 'USA', nhlAffiliateId: null },
  { id: 107, name: 'Windsor Spitfires', shortName: 'WND', leagueId: 2, city: 'Windsor', country: 'Canada', nhlAffiliateId: null },
  { id: 108, name: 'Owen Sound Attack', shortName: 'OS', leagueId: 2, city: 'Owen Sound', country: 'Canada', nhlAffiliateId: null },
  { id: 109, name: 'Hamilton Bulldogs', shortName: 'HAM', leagueId: 2, city: 'Hamilton', country: 'Canada', nhlAffiliateId: null },
  { id: 110, name: 'North Bay Battalion', shortName: 'NB', leagueId: 2, city: 'North Bay', country: 'Canada', nhlAffiliateId: null },

  // ── WHL ──
  { id: 201, name: 'Spokane Chiefs', shortName: 'SPO', leagueId: 3, city: 'Spokane', country: 'USA', nhlAffiliateId: null },
  { id: 202, name: 'Kelowna Rockets', shortName: 'KEL', leagueId: 3, city: 'Kelowna', country: 'Canada', nhlAffiliateId: null },
  { id: 203, name: 'Moose Jaw Warriors', shortName: 'MJ', leagueId: 3, city: 'Moose Jaw', country: 'Canada', nhlAffiliateId: null },
  { id: 204, name: 'Seattle Thunderbirds', shortName: 'SEA', leagueId: 3, city: 'Kent', country: 'USA', nhlAffiliateId: null },
  { id: 205, name: 'Regina Pats', shortName: 'REG', leagueId: 3, city: 'Regina', country: 'Canada', nhlAffiliateId: null },
  { id: 206, name: 'Vancouver Giants', shortName: 'VAN', leagueId: 3, city: 'Langley', country: 'Canada', nhlAffiliateId: null },
  { id: 207, name: 'Kamloops Blazers', shortName: 'KAM', leagueId: 3, city: 'Kamloops', country: 'Canada', nhlAffiliateId: null },
  { id: 208, name: 'Tri-City Americans', shortName: 'TC', leagueId: 3, city: 'Kennewick', country: 'USA', nhlAffiliateId: null },

  // ── QMJHL ──
  { id: 301, name: 'Moncton Wildcats', shortName: 'MON', leagueId: 4, city: 'Moncton', country: 'Canada', nhlAffiliateId: null },
  { id: 302, name: 'Sherbrooke Phoenix', shortName: 'SHR', leagueId: 4, city: 'Sherbrooke', country: 'Canada', nhlAffiliateId: null },
  { id: 303, name: 'Baie-Comeau Drakkar', shortName: 'BC', leagueId: 4, city: 'Baie-Comeau', country: 'Canada', nhlAffiliateId: null },
  { id: 304, name: 'Halifax Mooseheads', shortName: 'HFX', leagueId: 4, city: 'Halifax', country: 'Canada', nhlAffiliateId: null },
  { id: 305, name: 'Chicoutimi Sagueneens', shortName: 'CHI', leagueId: 4, city: 'Chicoutimi', country: 'Canada', nhlAffiliateId: null },
  { id: 306, name: 'Rimouski Oceanic', shortName: 'RIM', leagueId: 4, city: 'Rimouski', country: 'Canada', nhlAffiliateId: null },

  // ── NCAA ──
  { id: 401, name: 'Boston College', shortName: 'BC', leagueId: 5, city: 'Chestnut Hill', country: 'USA', nhlAffiliateId: null },
  { id: 402, name: 'University of Denver', shortName: 'DEN', leagueId: 5, city: 'Denver', country: 'USA', nhlAffiliateId: null },
  { id: 403, name: 'Boston University', shortName: 'BU', leagueId: 5, city: 'Boston', country: 'USA', nhlAffiliateId: null },
  { id: 404, name: 'Providence College', shortName: 'PC', leagueId: 5, city: 'Providence', country: 'USA', nhlAffiliateId: null },
  { id: 405, name: 'University of Michigan', shortName: 'MICH', leagueId: 5, city: 'Ann Arbor', country: 'USA', nhlAffiliateId: null },
  { id: 406, name: 'University of Minnesota', shortName: 'MINN', leagueId: 5, city: 'Minneapolis', country: 'USA', nhlAffiliateId: null },
  { id: 407, name: 'University of Notre Dame', shortName: 'ND', leagueId: 5, city: 'Notre Dame', country: 'USA', nhlAffiliateId: null },

  // ── European ──
  { id: 501, name: 'Skellefteå AIK', shortName: 'SKE', leagueId: 6, city: 'Skellefteå', country: 'Sweden', nhlAffiliateId: null },
  { id: 502, name: 'Rögle BK', shortName: 'RÖG', leagueId: 6, city: 'Ängelholm', country: 'Sweden', nhlAffiliateId: null },
  { id: 503, name: 'Örebro HK', shortName: 'ÖRE', leagueId: 6, city: 'Örebro', country: 'Sweden', nhlAffiliateId: null },
  { id: 504, name: 'Frölunda HC', shortName: 'FRÖ', leagueId: 6, city: 'Gothenburg', country: 'Sweden', nhlAffiliateId: null },
  { id: 505, name: 'Luleå HF', shortName: 'LUL', leagueId: 6, city: 'Luleå', country: 'Sweden', nhlAffiliateId: null },
  { id: 506, name: 'JYP', shortName: 'JYP', leagueId: 7, city: 'Jyväskylä', country: 'Finland', nhlAffiliateId: null },
  { id: 507, name: 'Ilves', shortName: 'ILV', leagueId: 7, city: 'Tampere', country: 'Finland', nhlAffiliateId: null },
  { id: 508, name: 'Tappara', shortName: 'TAP', leagueId: 7, city: 'Tampere', country: 'Finland', nhlAffiliateId: null },
  { id: 509, name: 'Metallurg Magnitogorsk', shortName: 'MMG', leagueId: 8, city: 'Magnitogorsk', country: 'Russia', nhlAffiliateId: null },
  { id: 510, name: 'SKA St. Petersburg', shortName: 'SKA', leagueId: 8, city: 'Saint Petersburg', country: 'Russia', nhlAffiliateId: null },
  { id: 511, name: 'CSKA Moscow', shortName: 'CSKA', leagueId: 8, city: 'Moscow', country: 'Russia', nhlAffiliateId: null },
  { id: 512, name: 'HC Kometa Brno', shortName: 'BRN', leagueId: 9, city: 'Brno', country: 'Czech Republic', nhlAffiliateId: null },
  { id: 513, name: 'Adler Mannheim', shortName: 'MAN', leagueId: 10, city: 'Mannheim', country: 'Germany', nhlAffiliateId: null },
  { id: 514, name: 'EHC Kloten', shortName: 'KLO', leagueId: 11, city: 'Kloten', country: 'Switzerland', nhlAffiliateId: null },
];
