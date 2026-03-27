// ============================================================================
// Pipeline Public API
// ============================================================================
// Single entry point for the live data pipeline. Import from here rather
// than reaching into internal modules.
// ============================================================================

// Domain models
export type {
  SourceDescriptor,
  SourceType,
  IngestionCadence,
  FieldCoverage,
  DataQualityFlags,
  ValidationMessage,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
  IngestionRun,
  IngestionError,
  IngestionStatus,
  ConnectorResult,
  RawSourcePayload,
  PlayerIdentityLink,
  ConnectorMaturity,
  ConnectorTier,
} from './domain/models';

// Connector base
export { BaseConnector } from './connectors/base';
export type { IConnector, ParsedRecord, FetchResult } from './connectors/base';
export { registry } from './connectors/registry';

// ETL engine
export { runConnector, runAll, runByName } from './core/etl';
export type { ETLOptions } from './core/etl';

// Normalization helpers
export {
  normalizeName,
  splitName,
  normalizeSeason,
  normalizePosition,
  normalizeNationality,
  parseHeight,
  parseWeight,
  calculateAge,
  safeInt,
  safeFloat,
  todaySnapshot,
  createDefaultQuality,
  createEmptyPlayer,
  createEmptySkaterStats,
  createEmptyGoalieStats,
} from './core/normalization';

// Validation
export { validateBatch, validatePlayer, validateSkaterStats, validateGoalieStats } from './core/validation';

// Logging
export { createLogger, getRecentLogs } from './core/logger';
export type { LogLevel, LogEntry } from './core/logger';

// Services
export { getIngestionService, IngestionService } from './services/ingestion-service';
export { getHealthService, HealthService } from './services/health-service';
export type { SourceHealth, PipelineHealth, IngestionRunSummary, FlaggedMatchSummary } from './services/health-service';

// Identity resolution
export { PlayerIdentityResolver, InMemoryIdentityStore } from './identity';
export type { CanonicalPlayer, ResolvedIdentity, FlaggedMatch, IdentityStore } from './identity';

// Config
export { getPipelineConfig, getEnabledSources, getSource, getSourcesByTier, getSourcesByMaturity, getSourcesSummary, SOURCES } from './config';
export type { PipelineConfig, SourceConfig } from './config';

// Persistence
export { persistWithIdentityResolution } from './core/persistence';
export type { PersistenceResult } from './core/persistence';
