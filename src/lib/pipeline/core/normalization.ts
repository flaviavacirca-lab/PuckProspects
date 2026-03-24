// ============================================================================
// Normalization Helpers
// ============================================================================
// Shared utilities for normalizing raw data into the pipeline's standard
// formats. Connectors use these in their normalize() methods.
// ============================================================================

import {
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
  DataQualityFlags,
} from '../domain/models';

/**
 * Normalize a name: strip accents, lowercase, collapse whitespace.
 */
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split a full name into first/last. Handles "Last, First" and "First Last" formats.
 */
export function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();

  // Handle "Last, First" format
  if (trimmed.includes(',')) {
    const [last, first] = trimmed.split(',').map(s => s.trim());
    return { firstName: first || '', lastName: last || '' };
  }

  // Handle "First Last" format (take last token as last name)
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

/**
 * Normalize a season string to "YYYY-YY" format.
 */
export function normalizeSeason(input: string): string {
  const full = input.match(/^(\d{4})-(\d{4})$/);
  if (full) return `${full[1]}-${full[2].slice(2)}`;
  if (input.match(/^\d{4}-\d{2}$/)) return input;
  const slash = input.match(/^(\d{4})\/(\d{2,4})$/);
  if (slash) return `${slash[1]}-${slash[2].slice(-2)}`;
  return input;
}

/**
 * Map position strings to standard values.
 */
export function normalizePosition(pos: string | null | undefined): string | null {
  if (!pos) return null;
  const map: Record<string, string> = {
    'c': 'C', 'center': 'C', 'centre': 'C',
    'lw': 'LW', 'left wing': 'LW', 'l': 'LW',
    'rw': 'RW', 'right wing': 'RW', 'r': 'RW',
    'w': 'LW', 'wing': 'LW', 'f': 'C', 'forward': 'C',
    'd': 'D', 'defense': 'D', 'defence': 'D', 'defenseman': 'D',
    'ld': 'D', 'rd': 'D',
    'g': 'G', 'goalie': 'G', 'goaltender': 'G', 'goalkeeper': 'G',
  };
  return map[pos.toLowerCase().trim()] || pos.toUpperCase();
}

/**
 * Map nationality strings to consistent values.
 */
export function normalizeNationality(nat: string | null | undefined): string | null {
  if (!nat) return null;
  const map: Record<string, string> = {
    'usa': 'USA', 'us': 'USA', 'united states': 'USA', 'united states of america': 'USA',
    'can': 'CAN', 'ca': 'CAN', 'canada': 'CAN',
    'swe': 'SWE', 'se': 'SWE', 'sweden': 'SWE',
    'fin': 'FIN', 'fi': 'FIN', 'finland': 'FIN',
    'rus': 'RUS', 'ru': 'RUS', 'russia': 'RUS',
    'cze': 'CZE', 'cz': 'CZE', 'czech republic': 'CZE', 'czechia': 'CZE',
    'svk': 'SVK', 'sk': 'SVK', 'slovakia': 'SVK',
    'che': 'CHE', 'ch': 'CHE', 'switzerland': 'CHE', 'sui': 'CHE',
    'deu': 'DEU', 'de': 'DEU', 'germany': 'DEU', 'ger': 'DEU',
    'aut': 'AUT', 'at': 'AUT', 'austria': 'AUT',
    'dnk': 'DNK', 'dk': 'DNK', 'denmark': 'DNK', 'den': 'DNK',
    'nor': 'NOR', 'no': 'NOR', 'norway': 'NOR',
    'lva': 'LVA', 'lv': 'LVA', 'latvia': 'LVA', 'lat': 'LVA',
    'blr': 'BLR', 'by': 'BLR', 'belarus': 'BLR',
    'kaz': 'KAZ', 'kz': 'KAZ', 'kazakhstan': 'KAZ',
    'gbr': 'GBR', 'gb': 'GBR', 'uk': 'GBR', 'united kingdom': 'GBR',
    'fra': 'FRA', 'fr': 'FRA', 'france': 'FRA',
  };
  const key = nat.toLowerCase().trim();
  return map[key] || nat.toUpperCase();
}

/**
 * Parse height string into centimeters.
 */
export function parseHeight(input: string | null | undefined): number | null {
  if (!input) return null;

  // "6'1\"" or "6-1" (feet-inches)
  const imperial = input.match(/(\d+)['\-](\d+)/);
  if (imperial) {
    const feet = parseInt(imperial[1], 10);
    const inches = parseInt(imperial[2], 10);
    return Math.round(feet * 30.48 + inches * 2.54);
  }

  // "185 cm" or just "185"
  const cm = input.match(/(\d{3})/);
  if (cm) {
    const val = parseInt(cm[1], 10);
    if (val >= 150 && val <= 220) return val;
  }

  return null;
}

/**
 * Parse weight string into kilograms.
 */
export function parseWeight(input: string | null | undefined): number | null {
  if (!input) return null;

  // "195 lbs" or "195"
  const lbs = input.match(/(\d+)\s*(lbs?|pounds?)?/i);
  if (lbs) {
    const val = parseInt(lbs[1], 10);
    if (val > 100 && val < 300) return Math.round(val * 0.453592);
    if (val >= 50 && val <= 130) return val; // already kg
  }

  return null;
}

/**
 * Calculate age from date of birth string.
 */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  try {
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 14 && age <= 50 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Safe numeric parser. Returns null for NaN, empty, or non-numeric values.
 */
export function safeInt(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'string' ? parseInt(value.replace(/,/g, ''), 10) : Number(value);
  return isNaN(n) ? null : n;
}

export function safeFloat(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
  return isNaN(n) ? null : n;
}

/**
 * Generate today's date as "YYYY-MM-DD" for snapshot tracking.
 */
export function todaySnapshot(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Create a default quality flags object.
 */
export function createDefaultQuality(missingFields: string[] = []): DataQualityFlags {
  return {
    confidence: missingFields.length === 0 ? 1.0 : Math.max(0.3, 1.0 - missingFields.length * 0.1),
    missingFields,
    conflictingFields: [],
    passedValidation: true,
    validationMessages: [],
    isPartial: missingFields.length > 5,
  };
}

/**
 * Find which expected fields are missing from a record.
 */
export function findMissingFields(
  record: Record<string, unknown>,
  requiredFields: string[],
  optionalFields: string[] = []
): { missing: string[]; optional: string[] } {
  const missing = requiredFields.filter(f => record[f] === null || record[f] === undefined || record[f] === '');
  const optional = optionalFields.filter(f => record[f] === null || record[f] === undefined || record[f] === '');
  return { missing, optional };
}

/**
 * Create a template NormalizedPlayer with all fields set to null/default.
 */
export function createEmptyPlayer(sourceName: string, league: string): NormalizedPlayer {
  return {
    internalId: null,
    sourceIds: {},
    sourceUrl: null,
    sourceName,
    firstName: '',
    lastName: '',
    fullName: '',
    normalizedName: '',
    alternateNames: [],
    dateOfBirth: null,
    age: null,
    nationality: null,
    birthCity: null,
    birthCountry: null,
    position: null,
    positionGroup: null,
    handedness: null,
    heightCm: null,
    weightKg: null,
    teamName: null,
    league,
    country: null,
    draftStatus: null,
    draftYear: null,
    draftRound: null,
    draftPick: null,
    draftOverall: null,
    draftedBy: null,
    nhlRightsHolder: null,
    lastUpdated: new Date(),
    snapshotDate: todaySnapshot(),
    dataQuality: createDefaultQuality(),
    customFields: {},
  };
}

/**
 * Create a template NormalizedSkaterStats with all fields set to 0/null.
 */
export function createEmptySkaterStats(sourceName: string, league: string, season: string): NormalizedSkaterStats {
  return {
    playerId: null,
    sourceName,
    sourceUrl: null,
    season,
    league,
    teamName: null,
    gamesPlayed: 0,
    goals: 0,
    assists: 0,
    points: 0,
    pointsPerGame: null,
    penaltyMinutes: null,
    plusMinus: null,
    ppGoals: null,
    ppAssists: null,
    ppPoints: null,
    shGoals: null,
    shAssists: null,
    shPoints: null,
    shots: null,
    shootingPct: null,
    faceoffWins: null,
    faceoffLosses: null,
    faceoffPct: null,
    avgToi: null,
    gwGoals: null,
    hits: null,
    blockedShots: null,
    snapshotDate: todaySnapshot(),
    lastUpdated: new Date(),
    dataQuality: createDefaultQuality(),
    rawPayload: null,
    customFields: {},
  };
}
