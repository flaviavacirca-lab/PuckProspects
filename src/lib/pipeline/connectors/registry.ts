// ============================================================================
// Connector Registry
// ============================================================================
// Central registry for all data source connectors. The ETL engine and
// ingestion service use this to discover and instantiate connectors.
//
// To register a new connector:
//   import { registry } from './registry';
//   import { MyConnector } from './scrapers/my-connector';
//   registry.register('my_source', () => new MyConnector());
// ============================================================================

import { IConnector } from './base';
import { SourceDescriptor } from '../domain/models';

type ConnectorFactory = () => IConnector;

class ConnectorRegistry {
  private factories = new Map<string, ConnectorFactory>();

  /** Register a connector factory by source name */
  register(sourceName: string, factory: ConnectorFactory): void {
    if (this.factories.has(sourceName)) {
      console.warn(`[Registry] Overwriting connector: ${sourceName}`);
    }
    this.factories.set(sourceName, factory);
  }

  /** Create a connector instance by source name */
  create(sourceName: string): IConnector {
    const factory = this.factories.get(sourceName);
    if (!factory) {
      throw new Error(`[Registry] Unknown connector: ${sourceName}. Available: ${this.listNames().join(', ')}`);
    }
    return factory();
  }

  /** Check if a connector is registered */
  has(sourceName: string): boolean {
    return this.factories.has(sourceName);
  }

  /** List all registered connector names */
  listNames(): string[] {
    return Array.from(this.factories.keys());
  }

  /** Get descriptors for all registered connectors */
  listDescriptors(): SourceDescriptor[] {
    return this.listNames().map(name => this.create(name).descriptor);
  }

  /** Get connectors for a specific league */
  getForLeague(leagueCode: string): IConnector[] {
    return this.listNames()
      .map(name => this.create(name))
      .filter(c => c.descriptor.league === leagueCode);
  }

  /** Unregister a connector (useful for testing) */
  unregister(sourceName: string): void {
    this.factories.delete(sourceName);
  }

  /** Clear all registered connectors (useful for testing) */
  clear(): void {
    this.factories.clear();
  }
}

/** Singleton connector registry */
export const registry = new ConnectorRegistry();

// ============================================================================
// Auto-registration
// ============================================================================
// Import connector modules here to auto-register them.
// As connectors are built, add their imports below.
//
// Example:
//   import './apis/ahl-connector';
//   import './scrapers/ep-ohl-connector';
//   import './enrichment/elite-prospects-enrichment';
//
// Each connector file should call registry.register() at module load time.
// ============================================================================

// --- Connector imports will be added here as they are built ---
// import './scrapers/ep-connector';
// import './apis/ahl-connector';
