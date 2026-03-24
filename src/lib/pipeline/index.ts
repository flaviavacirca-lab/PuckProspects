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
} from './core/normalization';

// Validation
export { validateBatch, validatePlayer, validateSkaterStats, validateGoalieStats } from './core/validation';

// Services
export { getIngestionService, IngestionService } from './services/ingestion-service';
export { getHealthService, HealthService } from './services/health-service';
export type { SourceHealth, PipelineHealth } from './services/health-service';

// Config
export { getPipelineConfig, getEnabledSources, getSource, getSourcesByTier, getSourcesByMaturity, getSourcesSummary } from './config';
export type { PipelineConfig, SourceConfig } from './config';
