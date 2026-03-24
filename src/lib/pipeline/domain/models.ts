// ============================================================================
// Pipeline Domain Models
// ============================================================================
// These types represent the normalized data flowing through the ingestion
// pipeline. They are separate from the frontend display types in src/types/
// because the pipeline needs to handle partial data, quality flags, and
// source-specific metadata that the frontend doesn't care about.
//
// Data flows: Source → RawPayload → NormalizedPlayer/Stats → DB → Frontend types
// ============================================================================

// --- Source / Connector Metadata ---

export type SourceType = 'api' | 'scrape' | 'hybrid' | 'enrichment' | 'partial';

export type IngestionCadence = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';

export interface SourceDescriptor {
  /** Unique identifier for this source, e.g. "elite_prospects", "ahl_api" */
  sourceName: string;
  sourceType: SourceType;
  sourceUrl: string;
  league: string;
  ingestionCadence: IngestionCadence;
  /** Known gaps or limitations of this source */
  knownLimitations: string[];
  /** Which fields this source can provide */
  fieldCoverage: FieldCoverage;
}

export interface FieldCoverage {
  hasBasicStats: boolean;
  hasPlusMinus: boolean;
  hasSpecialTeams: boolean;
  hasShots: boolean;
  hasFaceoffs: boolean;
  hasIceTime: boolean;
  hasHitsBlocks: boolean;
  hasGoalieStats: boolean;
  hasBiographicalData: boolean;
  hasDraftInfo: boolean;
  hasNhlAffiliation: boolean;
  /** Source-specific extra fields not in the standard schema */
  customFields?: string[];
}

// --- Data Quality ---

export interface DataQualityFlags {
  /** Overall confidence: 0.0 (garbage) to 1.0 (verified) */
  confidence: number;
  /** Which fields are missing or unverifiable */
  missingFields: string[];
  /** Which fields differ from other sources */
  conflictingFields: string[];
  /** Whether this record passed validation */
  passedValidation: boolean;
  /** Validation errors/warnings */
  validationMessages: ValidationMessage[];
  /** Is this a partial record (e.g. only bio, no stats)? */
  isPartial: boolean;
}

export interface ValidationMessage {
  field: string;
  level: 'error' | 'warning' | 'info';
  message: string;
}

// --- Raw Payload ---

export interface RawSourcePayload {
  id?: number;
  sourceName: string;
  sourceUrl: string;
  league: string;
  fetchedAt: Date;
  /** The raw response body (HTML, JSON string, etc.) */
  rawBody: string;
  contentType: 'html' | 'json' | 'csv' | 'xml';
  httpStatus: number;
  /** Checksum to detect unchanged data */
  bodyHash: string;
  /** Size in bytes */
  bodySize: number;
}

// --- Normalized Player ---

export interface NormalizedPlayer {
  /** Internal player ID (null if new/unresolved) */
  internalId: number | null;
  /** Source-specific IDs, keyed by source name */
  sourceIds: Record<string, string>;
  /** Source URL where this player was found */
  sourceUrl: string | null;
  /** Source name that produced this record */
  sourceName: string;

  // Identity
  firstName: string;
  lastName: string;
  fullName: string;
  /** Lowercase, accent-stripped, for matching */
  normalizedName: string;
  alternateNames: string[];
  dateOfBirth: string | null;
  age: number | null;
  nationality: string | null;
  birthCity: string | null;
  birthCountry: string | null;

  // Physical
  position: string | null;
  positionGroup: 'F' | 'D' | 'G' | null;
  handedness: 'L' | 'R' | null;
  heightCm: number | null;
  weightKg: number | null;

  // Team context
  teamName: string | null;
  league: string;
  country: string | null;

  // NHL affiliation
  draftStatus: string | null;
  draftYear: number | null;
  draftRound: number | null;
  draftPick: number | null;
  draftOverall: number | null;
  draftedBy: string | null;
  nhlRightsHolder: string | null;

  // Metadata
  lastUpdated: Date;
  snapshotDate: string;
  dataQuality: DataQualityFlags;
  /** Arbitrary extra fields from the source */
  customFields: Record<string, unknown>;
}

// --- Normalized Season Stats (Skater) ---

export interface NormalizedSkaterStats {
  /** Links to NormalizedPlayer */
  playerId: number | null;
  sourceName: string;
  sourceUrl: string | null;

  season: string;
  league: string;
  teamName: string | null;

  // Core
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  pointsPerGame: number | null;
  penaltyMinutes: number | null;
  plusMinus: number | null;

  // Special teams
  ppGoals: number | null;
  ppAssists: number | null;
  ppPoints: number | null;
  shGoals: number | null;
  shAssists: number | null;
  shPoints: number | null;

  // Shooting
  shots: number | null;
  shootingPct: number | null;

  // Faceoffs
  faceoffWins: number | null;
  faceoffLosses: number | null;
  faceoffPct: number | null;

  // Ice time
  avgToi: number | null;

  // Game events
  gwGoals: number | null;
  hits: number | null;
  blockedShots: number | null;

  // Metadata
  snapshotDate: string;
  lastUpdated: Date;
  dataQuality: DataQualityFlags;
  /** Original payload preserved for debugging */
  rawPayload: Record<string, unknown> | null;
  customFields: Record<string, unknown>;
}

// --- Normalized Goalie Stats ---

export interface NormalizedGoalieStats {
  playerId: number | null;
  sourceName: string;
  sourceUrl: string | null;

  season: string;
  league: string;
  teamName: string | null;

  gamesPlayed: number;
  gamesStarted: number | null;
  wins: number;
  losses: number;
  otl: number | null;
  shutouts: number | null;

  goalsAgainst: number | null;
  goalsAgainstAvg: number | null;
  saves: number | null;
  shotsAgainst: number | null;
  savePct: number | null;
  minutesPlayed: number | null;

  snapshotDate: string;
  lastUpdated: Date;
  dataQuality: DataQualityFlags;
  rawPayload: Record<string, unknown> | null;
  customFields: Record<string, unknown>;
}

// --- Ingestion Run Tracking ---

export type IngestionStatus = 'started' | 'fetching' | 'parsing' | 'normalizing' | 'validating' | 'persisting' | 'success' | 'partial' | 'failed';

export interface IngestionRun {
  id?: number;
  connectorName: string;
  league: string;
  status: IngestionStatus;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: IngestionError[];
  warnings: string[];
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
}

export interface IngestionError {
  phase: 'fetch' | 'parse' | 'normalize' | 'validate' | 'persist';
  message: string;
  details?: unknown;
  timestamp: Date;
}

// --- Player Identity Resolution ---

export interface PlayerIdentityLink {
  id?: number;
  /** Our canonical internal player ID */
  internalPlayerId: number;
  /** The source system name */
  sourceName: string;
  /** The player's ID in that source system */
  sourcePlayerId: string;
  /** Confidence of this link: 0.0 to 1.0 */
  confidence: number;
  /** How the link was established */
  matchMethod: 'exact_name_dob' | 'fuzzy_name_dob' | 'source_id' | 'manual';
  createdAt: Date;
  verifiedAt: Date | null;
}

// --- Pipeline Result ---

export interface ConnectorResult {
  players: NormalizedPlayer[];
  skaterStats: NormalizedSkaterStats[];
  goalieStats: NormalizedGoalieStats[];
  run: IngestionRun;
}
