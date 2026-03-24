// ============================================================================
// Pipeline Configuration
// ============================================================================
// Central config loader for the ingestion pipeline. Reads from environment
// variables with sensible defaults for local development.
// ============================================================================

export interface PipelineConfig {
  /** Max concurrent connectors during a full run */
  concurrency: number;
  /** Default max retries per ETL phase */
  maxRetries: number;
  /** Store raw payloads in DB for auditing */
  storeRawPayloads: boolean;
  /** Cron expression for scheduled ingestion */
  cronSchedule: string;
  /** Database connection string */
  databaseUrl: string;
  /** Log level for pipeline operations */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** Default rate limit (requests per minute) for scrapers */
  defaultRateLimit: number;
  /** Request timeout in milliseconds */
  requestTimeout: number;
  /** User agent string for HTTP requests */
  userAgent: string;
}

export function loadPipelineConfig(): PipelineConfig {
  return {
    concurrency: parseInt(process.env.INGESTION_CONCURRENCY || '3', 10),
    maxRetries: parseInt(process.env.PIPELINE_MAX_RETRIES || '1', 10),
    storeRawPayloads: process.env.PIPELINE_STORE_RAW !== 'false',
    cronSchedule: process.env.INGESTION_CRON || '0 */6 * * *',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://puckprospects:puckprospects@localhost:5432/puckprospects',
    logLevel: (process.env.PIPELINE_LOG_LEVEL as PipelineConfig['logLevel']) || 'info',
    defaultRateLimit: parseInt(process.env.PIPELINE_RATE_LIMIT || '10', 10),
    requestTimeout: parseInt(process.env.PIPELINE_REQUEST_TIMEOUT || '30000', 10),
    userAgent: process.env.PIPELINE_USER_AGENT || 'PuckProspects/1.0 (analytics; +https://puckprospects.com)',
  };
}

/** Singleton config instance */
let _config: PipelineConfig | null = null;

export function getPipelineConfig(): PipelineConfig {
  if (!_config) {
    _config = loadPipelineConfig();
  }
  return _config;
}

/** Reset config (useful for testing) */
export function resetPipelineConfig(): void {
  _config = null;
}

// Re-export source config
export { SOURCES, getEnabledSources, getSourcesForLeague, getSource, getSourcesByTier, getSourcesByMaturity, getSourcesSummary } from './sources';
export type { SourceConfig } from './sources';
