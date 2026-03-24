// ============================================================================
// Base Connector Interface
// ============================================================================
// All data source connectors (API, scraper, enrichment) implement this
// interface. The ETL engine calls these methods in sequence:
//   fetch() → parse() → normalize() → validate() → persist()
//
// To add a new connector:
// 1. Create a file in connectors/apis/ or connectors/scrapers/
// 2. Extend BaseConnector
// 3. Implement all abstract methods
// 4. Register it in connectors/registry.ts
// 5. Add config in config/sources.ts
// ============================================================================

import {
  SourceDescriptor,
  SourceType,
  IngestionCadence,
  FieldCoverage,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
  ConnectorResult,
  IngestionRun,
  IngestionError,
  IngestionStatus,
  RawSourcePayload,
  DataQualityFlags,
  ValidationMessage,
} from '../domain/models';

// --- Parsed intermediate type (connector-specific, pre-normalization) ---

export interface ParsedRecord {
  /** Source-specific player identifier */
  sourcePlayerId: string;
  /** Raw parsed fields before normalization */
  fields: Record<string, unknown>;
  /** Which record type: skater stats, goalie stats, bio only, etc. */
  recordType: 'skater' | 'goalie' | 'bio' | 'mixed';
}

// --- Fetch result ---

export interface FetchResult {
  rawBody: string;
  contentType: 'html' | 'json' | 'csv' | 'xml';
  httpStatus: number;
  url: string;
  fetchedAt: Date;
}

// --- The connector interface ---

export interface IConnector {
  /** Descriptor with source metadata */
  readonly descriptor: SourceDescriptor;

  /** Fetch raw data from the source. Returns raw body + metadata. */
  fetch(): Promise<FetchResult[]>;

  /** Parse raw data into intermediate records. */
  parse(raw: FetchResult[]): Promise<ParsedRecord[]>;

  /** Normalize parsed records into the shared schema. */
  normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }>;

  /** Validate normalized data. Returns the data with quality flags set. */
  validate(data: {
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
    validationErrors: ValidationMessage[];
  }>;

  /** Check if the source is reachable and healthy. */
  healthCheck?(): Promise<{ healthy: boolean; message: string }>;

  /** Get the last time this source was successfully ingested. */
  getLastUpdated?(): Promise<Date | null>;

  /** Get source-level metadata. */
  getSourceMetadata?(): Promise<Record<string, unknown>>;

  /** Backfill historical seasons. */
  backfillHistoricalData?(seasons: string[]): Promise<ConnectorResult>;
}

// --- Abstract base class with shared helpers ---

export abstract class BaseConnector implements IConnector {
  abstract readonly descriptor: SourceDescriptor;

  abstract fetch(): Promise<FetchResult[]>;
  abstract parse(raw: FetchResult[]): Promise<ParsedRecord[]>;
  abstract normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }>;

  /** Default validation - checks for required fields and data sanity */
  async validate(data: {
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
    validationErrors: ValidationMessage[];
  }> {
    const errors: ValidationMessage[] = [];

    for (const player of data.players) {
      const playerErrors = this.validatePlayer(player);
      errors.push(...playerErrors);
      player.dataQuality = {
        ...player.dataQuality,
        passedValidation: playerErrors.filter(e => e.level === 'error').length === 0,
        validationMessages: playerErrors,
      };
    }

    for (const stat of data.skaterStats) {
      const statErrors = this.validateSkaterStats(stat);
      errors.push(...statErrors);
      stat.dataQuality = {
        ...stat.dataQuality,
        passedValidation: statErrors.filter(e => e.level === 'error').length === 0,
        validationMessages: statErrors,
      };
    }

    for (const stat of data.goalieStats) {
      const statErrors = this.validateGoalieStats(stat);
      errors.push(...statErrors);
      stat.dataQuality = {
        ...stat.dataQuality,
        passedValidation: statErrors.filter(e => e.level === 'error').length === 0,
        validationMessages: statErrors,
      };
    }

    return { ...data, validationErrors: errors };
  }

  // --- Validation helpers (overridable per connector) ---

  protected validatePlayer(player: NormalizedPlayer): ValidationMessage[] {
    const msgs: ValidationMessage[] = [];

    if (!player.fullName || player.fullName.trim().length < 2) {
      msgs.push({ field: 'fullName', level: 'error', message: 'Player name is required' });
    }
    if (!player.league) {
      msgs.push({ field: 'league', level: 'error', message: 'League is required' });
    }
    if (player.age !== null && (player.age < 14 || player.age > 45)) {
      msgs.push({ field: 'age', level: 'warning', message: `Unusual age: ${player.age}` });
    }
    if (player.position && !['C', 'LW', 'RW', 'D', 'G'].includes(player.position)) {
      msgs.push({ field: 'position', level: 'warning', message: `Unknown position: ${player.position}` });
    }

    return msgs;
  }

  protected validateSkaterStats(stats: NormalizedSkaterStats): ValidationMessage[] {
    const msgs: ValidationMessage[] = [];

    if (stats.gamesPlayed < 0) {
      msgs.push({ field: 'gamesPlayed', level: 'error', message: 'Games played cannot be negative' });
    }
    if (stats.goals < 0 || stats.assists < 0 || stats.points < 0) {
      msgs.push({ field: 'points', level: 'error', message: 'Stats cannot be negative' });
    }
    if (stats.goals + stats.assists !== stats.points) {
      msgs.push({ field: 'points', level: 'warning', message: `Points (${stats.points}) != goals (${stats.goals}) + assists (${stats.assists})` });
    }
    if (stats.gamesPlayed > 0 && stats.pointsPerGame !== null) {
      const expectedPpg = Math.round((stats.points / stats.gamesPlayed) * 100) / 100;
      if (Math.abs(expectedPpg - stats.pointsPerGame) > 0.02) {
        msgs.push({ field: 'pointsPerGame', level: 'warning', message: `PPG mismatch: expected ${expectedPpg}, got ${stats.pointsPerGame}` });
      }
    }
    if (!stats.season || !stats.season.match(/^\d{4}-\d{2,4}$/)) {
      msgs.push({ field: 'season', level: 'error', message: `Invalid season format: ${stats.season}` });
    }

    return msgs;
  }

  protected validateGoalieStats(stats: NormalizedGoalieStats): ValidationMessage[] {
    const msgs: ValidationMessage[] = [];

    if (stats.gamesPlayed < 0) {
      msgs.push({ field: 'gamesPlayed', level: 'error', message: 'Games played cannot be negative' });
    }
    if (stats.savePct !== null && (stats.savePct < 0 || stats.savePct > 1)) {
      msgs.push({ field: 'savePct', level: 'warning', message: `Save percentage out of range: ${stats.savePct}` });
    }
    if (stats.goalsAgainstAvg !== null && stats.goalsAgainstAvg < 0) {
      msgs.push({ field: 'goalsAgainstAvg', level: 'warning', message: `GAA cannot be negative: ${stats.goalsAgainstAvg}` });
    }

    return msgs;
  }

  // --- Shared utility methods ---

  /** Create a default DataQualityFlags object */
  protected createDefaultQuality(missingFields: string[] = []): DataQualityFlags {
    return {
      confidence: missingFields.length === 0 ? 1.0 : Math.max(0.3, 1.0 - missingFields.length * 0.1),
      missingFields,
      conflictingFields: [],
      passedValidation: true,
      validationMessages: [],
      isPartial: missingFields.length > 5,
    };
  }

  /** Normalize a name for matching: lowercase, strip accents, collapse whitespace */
  protected normalizeName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Parse a season string into a normalized format, e.g. "2024-25" */
  protected normalizeSeason(input: string): string {
    // Handle "2024-2025" → "2024-25"
    const full = input.match(/^(\d{4})-(\d{4})$/);
    if (full) return `${full[1]}-${full[2].slice(2)}`;
    // Handle "2024-25" (already correct)
    if (input.match(/^\d{4}-\d{2}$/)) return input;
    // Handle "2024/25" or "2024/2025"
    const slash = input.match(/^(\d{4})\/(\d{2,4})$/);
    if (slash) return `${slash[1]}-${slash[2].slice(-2)}`;
    return input;
  }

  /** Map common position strings to our standard positions */
  protected normalizePosition(pos: string | null): string | null {
    if (!pos) return null;
    const map: Record<string, string> = {
      'c': 'C', 'center': 'C', 'centre': 'C',
      'lw': 'LW', 'left wing': 'LW', 'l': 'LW',
      'rw': 'RW', 'right wing': 'RW', 'r': 'RW',
      'w': 'LW', 'wing': 'LW', 'f': 'C',
      'd': 'D', 'defense': 'D', 'defence': 'D', 'defenseman': 'D',
      'ld': 'D', 'rd': 'D',
      'g': 'G', 'goalie': 'G', 'goaltender': 'G', 'goalkeeper': 'G',
    };
    return map[pos.toLowerCase().trim()] || pos.toUpperCase();
  }

  /** Determine position group from position */
  protected getPositionGroup(position: string | null): 'F' | 'D' | 'G' | null {
    if (!position) return null;
    if (position === 'G') return 'G';
    if (position === 'D') return 'D';
    return 'F';
  }

  /** Create a new ingestion run record */
  protected createRun(): IngestionRun {
    return {
      connectorName: this.descriptor.sourceName,
      league: this.descriptor.league,
      status: 'started',
      recordsFetched: 0,
      recordsInserted: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      warnings: [],
      startedAt: new Date(),
      completedAt: null,
      durationMs: null,
    };
  }

  /** Mark a run as complete */
  protected completeRun(run: IngestionRun, status: IngestionStatus): IngestionRun {
    run.status = status;
    run.completedAt = new Date();
    run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    return run;
  }

  /** Add an error to a run */
  protected addRunError(run: IngestionRun, phase: IngestionError['phase'], message: string, details?: unknown): void {
    run.errors.push({ phase, message, details, timestamp: new Date() });
  }

  /** Fetch a URL with retry logic and backoff */
  protected async fetchUrl(url: string, options: {
    retries?: number;
    headers?: Record<string, string>;
    timeout?: number;
  } = {}): Promise<{ body: string; status: number } | null> {
    const { retries = 2, headers = {}, timeout = 30000 } = options;
    const defaultHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      ...headers,
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url, {
          headers: defaultHeaders,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          return { body: await res.text(), status: res.status };
        }
        if (res.status === 429 || res.status >= 500) {
          // Retry on rate limit or server error
          if (attempt < retries) {
            await this.sleep(1000 * (attempt + 1));
            continue;
          }
        }
        return { body: '', status: res.status };
      } catch {
        if (attempt < retries) {
          await this.sleep(1000 * (attempt + 1));
        }
      }
    }
    return null;
  }

  /** Fetch JSON from an API endpoint */
  protected async fetchJson<T = unknown>(url: string, options: {
    retries?: number;
    headers?: Record<string, string>;
    timeout?: number;
  } = {}): Promise<T | null> {
    const result = await this.fetchUrl(url, {
      ...options,
      headers: { 'Accept': 'application/json', ...options.headers },
    });
    if (!result || result.status !== 200) return null;
    try {
      return JSON.parse(result.body) as T;
    } catch {
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
