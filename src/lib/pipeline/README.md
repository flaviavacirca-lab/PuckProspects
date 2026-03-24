# PuckProspects Live Data Pipeline

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Data Sources                       │
│  APIs (AHL, KHL...)  │  Scrapers (EP, league sites)  │
│  Enrichment (bios, draft info)                       │
└──────────┬────────────┬────────────┬────────────────┘
           │            │            │
     ┌─────▼────┐ ┌─────▼────┐ ┌────▼─────┐
     │ Connector │ │ Connector │ │ Connector │
     │  (API)    │ │ (Scraper) │ │ (Enrich)  │
     └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
           │              │              │
           └──────┬───────┴──────────────┘
                  │
    ┌─────────────▼──────────────┐
    │    ETL Engine (core/etl)    │
    │  fetch → parse → normalize  │
    │    → validate → persist     │
    └─────────────┬──────────────┘
                  │
    ┌─────────────▼──────────────┐
    │   PostgreSQL Database       │
    │  players, stats, identity   │
    │  ingestion_log, raw_payloads│
    └─────────────┬──────────────┘
                  │
    ┌─────────────▼──────────────┐
    │   Serving Layer             │
    │  Services → API Routes      │
    │  → Frontend                 │
    └────────────────────────────┘
```

## Folder Structure

```
src/lib/pipeline/
├── index.ts                    # Public API (import from here)
├── README.md                   # This file
├── domain/
│   └── models.ts               # All pipeline types and interfaces
├── connectors/
│   ├── base.ts                 # BaseConnector abstract class
│   ├── registry.ts             # Connector registry (singleton)
│   ├── apis/                   # API-based connectors
│   │   └── _example-api-connector.ts
│   ├── scrapers/               # Scrape-based connectors
│   │   └── ep-connector.ts     # Elite Prospects scraper
│   └── enrichment/             # Enrichment connectors
├── core/
│   ├── etl.ts                  # ETL orchestration engine
│   ├── persistence.ts          # Database write layer
│   ├── identity.ts             # Player identity resolution
│   ├── normalization.ts        # Data normalization helpers
│   ├── validation.ts           # Data validation
│   └── logger.ts               # Pipeline logging
├── services/
│   ├── ingestion-service.ts    # High-level ingestion API
│   └── health-service.ts       # Source health monitoring
├── jobs/
│   ├── ingest-all.ts           # CLI script for full ingestion
│   └── scheduler.ts            # Interval-based scheduler
└── config/
    ├── index.ts                # Pipeline config loader
    └── sources.ts              # Source enable/disable + settings
```

## Adding a New Connector

### 1. Choose the connector type

- **API connector** → `connectors/apis/`
- **Scraper connector** → `connectors/scrapers/`
- **Enrichment connector** → `connectors/enrichment/`

### 2. Create the connector file

Copy the example template:
```bash
# For an API connector:
cp src/lib/pipeline/connectors/apis/_example-api-connector.ts \
   src/lib/pipeline/connectors/apis/my-league-connector.ts

# For a scraper connector (reference ep-connector.ts):
cp src/lib/pipeline/connectors/scrapers/ep-connector.ts \
   src/lib/pipeline/connectors/scrapers/my-league-connector.ts
```

### 3. Implement the connector

Every connector must implement these methods:

```typescript
class MyConnector extends BaseConnector {
  // Metadata about this source
  readonly descriptor: SourceDescriptor = { ... };

  // Fetch raw data (HTTP requests)
  async fetch(): Promise<FetchResult[]> { ... }

  // Parse raw data into intermediate records
  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> { ... }

  // Normalize parsed records into the shared schema
  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> { ... }

  // Optional: validate() is inherited from BaseConnector
  // Optional: healthCheck(), getLastUpdated(), backfillHistoricalData()
}
```

The `BaseConnector` class provides:
- `fetchUrl()` / `fetchJson()` — HTTP with retry and timeout
- `normalizeName()`, `normalizePosition()`, `normalizeSeason()` — data cleanup
- `createDefaultQuality()` — quality flag boilerplate
- `createRun()` / `completeRun()` — run tracking helpers
- Default `validate()` implementation with sensible checks

### 4. Register the connector

In `connectors/registry.ts`, add:
```typescript
import { MyConnector } from './apis/my-league-connector';
registry.register('my_league', () => new MyConnector());
```

### 5. Configure the source

In `config/sources.ts`, add an entry:
```typescript
{
  name: 'my_league',
  label: 'My League API',
  type: 'api',
  league: 'my_league_code',
  url: 'https://api.example.com',
  enabled: true,
  cadence: 'daily',
  priority: 20,
  apiKeyEnv: 'MY_LEAGUE_API_KEY',
}
```

### 6. Test it

```bash
# Dry run (no database writes)
npx tsx src/lib/pipeline/jobs/ingest-all.ts --source my_league --dry-run

# Live run
npx tsx src/lib/pipeline/jobs/ingest-all.ts --source my_league

# Or via API
curl -X POST http://localhost:3000/api/pipeline/ingest \
  -H 'Content-Type: application/json' \
  -d '{"source": "my_league", "dryRun": true}'
```

## Running the Pipeline

### Manual run (all sources)
```bash
npx tsx src/lib/pipeline/jobs/ingest-all.ts
```

### Single league
```bash
npx tsx src/lib/pipeline/jobs/ingest-all.ts --league ohl
```

### Scheduled (background)
```bash
npx tsx src/lib/pipeline/jobs/scheduler.ts
```

### Via API
```bash
# Run all
curl -X POST http://localhost:3000/api/pipeline/ingest

# Single source
curl -X POST http://localhost:3000/api/pipeline/ingest \
  -d '{"source": "ep_ohl"}'

# Health check
curl http://localhost:3000/api/pipeline/health

# Recent runs
curl http://localhost:3000/api/pipeline/runs
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://...localhost:5432/puckprospects` | PostgreSQL connection |
| `INGESTION_CONCURRENCY` | `3` | Max parallel connectors |
| `INGESTION_CRON` | `0 */6 * * *` | Scheduler interval |
| `PIPELINE_MAX_RETRIES` | `1` | Retries per ETL phase |
| `PIPELINE_STORE_RAW` | `true` | Store raw payloads |
| `PIPELINE_LOG_LEVEL` | `info` | Log verbosity |
| `PIPELINE_RATE_LIMIT` | `10` | Default requests/minute |
| `PIPELINE_REQUEST_TIMEOUT` | `30000` | HTTP timeout (ms) |

## Database Setup

Run the base schema, then the pipeline migration:
```bash
npm run db:migrate
psql $DATABASE_URL -f database/migrations/002_pipeline_tables.sql
```

## Design Decisions

- **TypeScript throughout**: Shares types with the Next.js frontend, no cross-runtime boundary.
- **Connector pattern**: Each source is isolated behind a standard interface. API and scraper connectors are treated identically by the ETL engine.
- **Transaction-safe persistence**: All writes for a connector run are wrapped in a single DB transaction.
- **Identity resolution**: Players are matched across sources by source ID → name+DOB → name+league. Links stored in `player_identity_links`.
- **Raw payload storage**: Every fetch is stored for auditing and replay. Deduped by SHA-256 hash.
- **Graceful degradation**: Pipeline works without a database (logs to console). DB writes are best-effort where marked.
