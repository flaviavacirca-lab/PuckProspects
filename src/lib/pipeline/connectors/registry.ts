// ============================================================================
// Connector Registry
// ============================================================================
// Central registry for all data source connectors. The ETL engine and
// ingestion service use this to discover and instantiate connectors.
// ============================================================================

import { IConnector } from './base';
import { SourceDescriptor, ConnectorMaturity, ConnectorTier } from '../domain/models';

type ConnectorFactory = () => IConnector;

class ConnectorRegistry {
  private factories = new Map<string, ConnectorFactory>();
  private _initialized = false;

  /** Register a connector factory by source name */
  register(sourceName: string, factory: ConnectorFactory): void {
    this.factories.set(sourceName, factory);
  }

  /** Ensure all connectors are loaded (lazy initialization) */
  private ensureInitialized(): void {
    if (this._initialized) return;
    this._initialized = true;
    // Trigger dynamic imports of all connector modules
    loadAllConnectors();
  }

  /** Create a connector instance by source name */
  create(sourceName: string): IConnector {
    this.ensureInitialized();
    const factory = this.factories.get(sourceName);
    if (!factory) {
      throw new Error(`[Registry] Unknown connector: ${sourceName}. Available: ${this.listNames().join(', ')}`);
    }
    return factory();
  }

  /** Check if a connector is registered */
  has(sourceName: string): boolean {
    this.ensureInitialized();
    return this.factories.has(sourceName);
  }

  /** List all registered connector names */
  listNames(): string[] {
    this.ensureInitialized();
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
      .filter(c => c.descriptor.league === leagueCode || (c.descriptor.leaguesCovered || []).includes(leagueCode));
  }

  /** Get connectors by maturity level */
  getByMaturity(maturity: ConnectorMaturity): IConnector[] {
    return this.listNames()
      .map(name => this.create(name))
      .filter(c => c.descriptor.maturity === maturity);
  }

  /** Get connectors by tier */
  getByTier(tier: ConnectorTier): IConnector[] {
    return this.listNames()
      .map(name => this.create(name))
      .filter(c => c.descriptor.tier === tier);
  }

  /** Get a summary of all connectors grouped by maturity */
  getSummary(): Record<ConnectorMaturity, Array<{ name: string; league: string; type: string }>> {
    const summary: Record<string, Array<{ name: string; league: string; type: string }>> = {
      implemented: [],
      partial: [],
      scaffolded: [],
      future: [],
      blocked: [],
    };
    for (const name of this.listNames()) {
      const d = this.create(name).descriptor;
      summary[d.maturity].push({ name: d.sourceName, league: d.league, type: d.sourceType });
    }
    return summary as Record<ConnectorMaturity, Array<{ name: string; league: string; type: string }>>;
  }

  /** Unregister a connector (useful for testing) */
  unregister(sourceName: string): void {
    this.factories.delete(sourceName);
  }

  /** Clear all registered connectors (useful for testing) */
  clear(): void {
    this.factories.clear();
    this._initialized = false;
  }

  /** Count of registered connectors */
  get size(): number {
    this.ensureInitialized();
    return this.factories.size;
  }
}

/** Singleton connector registry */
export const registry = new ConnectorRegistry();

// ============================================================================
// Lazy loader — called once on first registry access
// ============================================================================
function loadAllConnectors(): void {
  // Tier 1: API connectors
  require('./apis/nhl-api-connector');
  require('./apis/balldontlie-connector');
  require('./apis/api-hockey-connector');
  require('./apis/thesportsdb-connector');
  require('./apis/morehockeystats-connector');

  // Tier 2: Scraping connectors — North America
  require('./scrapers/ahl-connector');
  require('./scrapers/echl-connector');
  require('./scrapers/ohl-connector');
  require('./scrapers/whl-connector');
  require('./scrapers/qmjhl-connector');
  require('./scrapers/ncaa-connector');
  require('./scrapers/ushl-connector');
  require('./scrapers/nahl-connector');

  // Tier 2: Scraping connectors — Europe
  require('./scrapers/shl-connector');
  require('./scrapers/j20-connector');
  require('./scrapers/liiga-connector');
  require('./scrapers/khl-connector');
  require('./scrapers/mhl-connector');
  require('./scrapers/swiss-nl-connector');
  require('./scrapers/del-connector');
  require('./scrapers/czech-extraliga-connector');

  // Tier 2: Development programs
  require('./scrapers/usntdp-connector');
  require('./scrapers/hockey-canada-connector');
  require('./scrapers/bchl-connector');

  // Tier 3: Enrichment
  require('./enrichment/hockeydb-connector');
  require('./enrichment/naturalstattrick-connector');
  require('./enrichment/moneypuck-connector');

  // Tier 2: Elite Prospects multi-league scraper
  require('./scrapers/ep-connector');
}
