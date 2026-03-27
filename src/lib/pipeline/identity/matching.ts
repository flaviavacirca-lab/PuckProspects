// ============================================================================
// Player Identity Matching Utilities
// ============================================================================
// Core string matching functions for resolving player identities across
// sources. Designed to handle the realities of hockey prospect data:
//
// - Names spelled differently: "Alexandr" vs "Alexander", "Mikhail" vs "Mikael"
// - Accented characters: "Räsänen" vs "Rasanen"
// - Name ordering: "Van de Leest" vs "Vandeleest", "De Leo" vs "DeLeo"
// - Transliterations: "Артём" → "Artyom" vs "Artjom"
// - Junior names: "TJ" vs "T.J.", "JP" vs "J.P."
//
// The system uses Levenshtein distance for edit-distance, bigram overlap
// for structural similarity, and multiple phonetic heuristics.
// ============================================================================

/**
 * Calculate the Levenshtein edit distance between two strings.
 * Returns the minimum number of single-character edits needed.
 */
export function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  // Use two rows instead of full matrix for O(min(la,lb)) space
  let prev = Array.from({ length: lb + 1 }, (_, i) => i);
  let curr = new Array(lb + 1);

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[lb];
}

/**
 * Normalized edit distance: 0.0 = identical, 1.0 = completely different.
 */
export function normalizedDistance(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return levenshtein(a, b) / maxLen;
}

/**
 * Compute name similarity: 1.0 = identical, 0.0 = completely different.
 */
export function nameSimilarity(a: string, b: string): number {
  return 1.0 - normalizedDistance(a, b);
}

/**
 * Generate character bigrams from a string.
 * "smith" → ["sm", "mi", "it", "th"]
 */
export function bigrams(s: string): Set<string> {
  const result = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) {
    result.add(s.slice(i, i + 2));
  }
  return result;
}

/**
 * Dice coefficient (bigram overlap): 1.0 = identical, 0.0 = no overlap.
 * More forgiving of insertions/transpositions than Levenshtein.
 */
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length < 2 || b.length < 2) return 0.0;

  const aBigrams = bigrams(a);
  const bBigrams = bigrams(b);

  let intersection = 0;
  aBigrams.forEach(bg => {
    if (bBigrams.has(bg)) intersection++;
  });

  return (2 * intersection) / (aBigrams.size + bBigrams.size);
}

/**
 * Normalize a name for matching: strip accents, lowercase, remove punctuation.
 */
export function normalizeForMatching(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .toLowerCase()
    .replace(/[.'`]/g, '')           // remove dots, apostrophes
    .replace(/\bvan\s+de\s+/g, 'vande')  // merge "van de" → "vande"
    .replace(/\bde\s+/g, 'de')           // merge "de " → "de"
    .replace(/\bvan\s+/g, 'van')         // merge "van " → "van"
    .replace(/\bmc\s+/g, 'mc')           // merge "Mc " → "mc"
    .replace(/[^a-z\s-]/g, '')           // remove remaining non-alpha
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split a full name into first + last, handling various formats.
 * Returns { first, last } both normalized for matching.
 */
export function splitForMatching(fullName: string): { first: string; last: string } {
  const normalized = normalizeForMatching(fullName);

  // "Last, First" format
  if (normalized.includes(',')) {
    const [last, first] = normalized.split(',').map(s => s.trim());
    return { first: first || '', last: last || '' };
  }

  // "First Last" — last token is last name
  const parts = normalized.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };

  return {
    first: parts.slice(0, -1).join(' '),
    last: parts[parts.length - 1],
  };
}

/**
 * Compare two player names using multiple strategies.
 * Returns a similarity score 0.0-1.0 and the method used.
 */
export function compareNames(
  nameA: string,
  nameB: string
): { score: number; method: string } {
  const normA = normalizeForMatching(nameA);
  const normB = normalizeForMatching(nameB);

  // Exact match after normalization
  if (normA === normB) {
    return { score: 1.0, method: 'exact' };
  }

  // Split into first/last and compare components
  const splitA = splitForMatching(nameA);
  const splitB = splitForMatching(nameB);

  // Exact last name + first name starts with same characters
  if (splitA.last === splitB.last && splitA.last.length > 0) {
    const firstSim = nameSimilarity(splitA.first, splitB.first);
    if (firstSim >= 0.8) {
      return { score: 0.85 + firstSim * 0.15, method: 'exact_last_fuzzy_first' };
    }
    // Check if one first name is an abbreviation of the other
    if (splitA.first.length >= 1 && splitB.first.length >= 1) {
      if (splitA.first.charAt(0) === splitB.first.charAt(0)) {
        // "M. Misa" vs "Michael Misa" — first initial matches
        if (splitA.first.length <= 2 || splitB.first.length <= 2) {
          return { score: 0.82, method: 'initial_match' };
        }
      }
    }
  }

  // Full name edit distance
  const editSim = nameSimilarity(normA, normB);

  // Bigram overlap (more tolerant of transpositions)
  const diceSim = diceCoefficient(normA, normB);

  // Take the higher of the two measures
  const bestScore = Math.max(editSim, diceSim);

  // Cross-check: last names match but first names in reversed order
  // "Pettersson Elias" vs "Elias Pettersson"
  if (splitA.first === splitB.last && splitA.last === splitB.first) {
    return { score: 0.95, method: 'reversed_order' };
  }

  return {
    score: bestScore,
    method: editSim >= diceSim ? 'levenshtein' : 'dice',
  };
}

/**
 * Compare two dates of birth. Returns:
 *   1.0 if exact match
 *   0.5 if same year and month (day could be off by data entry error)
 *   0.3 if same year only
 *   0.0 if different or one is null
 */
export function compareDob(
  dobA: string | null,
  dobB: string | null
): number {
  if (!dobA || !dobB) return 0;

  // Parse to comparable format
  const a = parseDobComponents(dobA);
  const b = parseDobComponents(dobB);
  if (!a || !b) return 0;

  if (a.year === b.year && a.month === b.month && a.day === b.day) {
    return 1.0;
  }
  if (a.year === b.year && a.month === b.month) {
    return 0.5; // day might be wrong
  }
  if (a.year === b.year) {
    return 0.3; // same birth year
  }
  return 0.0;
}

function parseDobComponents(dob: string): { year: number; month: number; day: number } | null {
  const match = dob.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

// ============================================================================
// Composite Match Scoring
// ============================================================================

export interface MatchSignals {
  nameScore: number;
  nameMethod: string;
  dobScore: number;
  sameNationality: boolean;
  samePosition: boolean;
  sameLeague: boolean;
  sameTeam: boolean;
  hasSourceIdLink: boolean;
}

export interface MatchResult {
  /** Overall confidence: 0.0-1.0 */
  confidence: number;
  /** How the match was determined */
  method: MatchMethod;
  /** Individual signal scores */
  signals: MatchSignals;
  /** Whether this match should be auto-linked or flagged for review */
  action: 'link' | 'flag' | 'skip';
}

export type MatchMethod =
  | 'source_id'          // Direct source ID lookup (highest confidence)
  | 'exact_name_dob'     // Exact normalized name + exact DOB
  | 'fuzzy_name_dob'     // Fuzzy name match + DOB match
  | 'exact_name_signals' // Exact name + secondary signals (nat/pos/team)
  | 'fuzzy_name_signals' // Fuzzy name + secondary signals
  | 'name_only'          // Name match only (weakest)
  | 'manual';            // Manually linked by admin

// Thresholds for auto-linking vs flagging
const THRESHOLDS = {
  /** Auto-link: high enough confidence to merge without review */
  AUTO_LINK: 0.85,
  /** Flag: ambiguous — needs human review */
  FLAG: 0.60,
  /** Skip: too weak to even flag */
  SKIP: 0.60,
  /** Name similarity minimum to consider at all */
  NAME_MIN: 0.75,
  /** Name similarity for "strong" match */
  NAME_STRONG: 0.90,
};

/**
 * Score a potential match between two player records using all available signals.
 *
 * Weighting:
 *   - Name similarity:   40% of score
 *   - DOB match:         35% of score
 *   - Secondary signals: 25% (nationality 10%, position 5%, league 5%, team 5%)
 *
 * If DOB is unavailable, name carries 60% and signals 40%.
 */
export function scoreMatch(
  candidate: {
    normalizedName: string;
    dateOfBirth: string | null;
    nationality: string | null;
    position: string | null;
    league: string | null;
    teamName: string | null;
  },
  existing: {
    normalizedName: string;
    dateOfBirth: string | null;
    nationality: string | null;
    position: string | null;
    league: string | null;
    teamName: string | null;
  }
): MatchResult {
  // Name comparison
  const nameResult = compareNames(candidate.normalizedName, existing.normalizedName);
  const nameScore = nameResult.score;

  // Too low name score — don't even consider
  if (nameScore < THRESHOLDS.NAME_MIN) {
    return {
      confidence: nameScore * 0.4,
      method: 'name_only',
      signals: {
        nameScore,
        nameMethod: nameResult.method,
        dobScore: 0,
        sameNationality: false,
        samePosition: false,
        sameLeague: false,
        sameTeam: false,
        hasSourceIdLink: false,
      },
      action: 'skip',
    };
  }

  // DOB comparison
  const dobScore = compareDob(candidate.dateOfBirth, existing.dateOfBirth);
  const hasDob = !!candidate.dateOfBirth && !!existing.dateOfBirth;

  // Secondary signals
  const sameNationality = !!(candidate.nationality && existing.nationality
    && candidate.nationality === existing.nationality);
  const samePosition = !!(candidate.position && existing.position
    && candidate.position === existing.position);
  const sameLeague = !!(candidate.league && existing.league
    && candidate.league === existing.league);
  const sameTeam = !!(candidate.teamName && existing.teamName
    && normalizeForMatching(candidate.teamName) === normalizeForMatching(existing.teamName));

  // Calculate secondary signal score
  const signalScore =
    (sameNationality ? 0.10 : 0) +
    (samePosition ? 0.05 : 0) +
    (sameLeague ? 0.05 : 0) +
    (sameTeam ? 0.05 : 0);
  const signalMax = 0.25;

  // Composite score depends on whether DOB is available
  let confidence: number;
  let method: MatchMethod;

  if (hasDob && dobScore >= 1.0) {
    // Strong DOB match
    if (nameScore >= THRESHOLDS.NAME_STRONG) {
      confidence = 0.40 * nameScore + 0.35 * dobScore + signalScore;
      method = 'exact_name_dob';
    } else {
      confidence = 0.40 * nameScore + 0.35 * dobScore + signalScore;
      method = 'fuzzy_name_dob';
    }
  } else if (hasDob && dobScore >= 0.5) {
    // Partial DOB match (same year+month)
    confidence = 0.40 * nameScore + 0.35 * dobScore + signalScore;
    method = 'fuzzy_name_dob';
  } else if (hasDob && dobScore === 0.0) {
    // DOB mismatch — strong signal AGAINST matching
    // Two players with same name but different DOBs are probably different people
    confidence = nameScore * 0.3; // Heavily penalize
    method = 'name_only';
  } else {
    // No DOB available — rely more on name + signals
    // Redistribute DOB weight to name and signals
    const adjustedSignalScore = signalScore / signalMax * 0.40; // signals now worth 40%
    confidence = 0.60 * nameScore + adjustedSignalScore;
    method = signalScore > 0 ? 'exact_name_signals' : 'name_only';
    if (nameScore < THRESHOLDS.NAME_STRONG && signalScore > 0) {
      method = 'fuzzy_name_signals';
    }
  }

  // Clamp to [0, 1]
  confidence = Math.min(1.0, Math.max(0.0, confidence));
  confidence = Math.round(confidence * 100) / 100;

  // Determine action
  let action: 'link' | 'flag' | 'skip';
  if (confidence >= THRESHOLDS.AUTO_LINK) {
    action = 'link';
  } else if (confidence >= THRESHOLDS.FLAG) {
    action = 'flag';
  } else {
    action = 'skip';
  }

  return {
    confidence,
    method,
    signals: {
      nameScore: Math.round(nameScore * 1000) / 1000,
      nameMethod: nameResult.method,
      dobScore,
      sameNationality,
      samePosition,
      sameLeague,
      sameTeam,
      hasSourceIdLink: false,
    },
    action,
  };
}
