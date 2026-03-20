# PuckProspects — NHL Prospect Analytics Platform

A modern, cross-league hockey analytics platform for NHL prospect evaluation, scouting, and development tracking across 27+ feeder leagues worldwide.

## Architecture Overview

```
PuckProspects/
├── src/                          # Next.js frontend + API
│   ├── app/                      # App router pages
│   │   ├── page.tsx              # Master prospect dashboard
│   │   ├── players/[id]/         # Player profile pages
│   │   ├── compare/              # Player comparison tool
│   │   ├── rankings/             # Multi-view rankings
│   │   ├── analytics/            # Visual analytics
│   │   ├── admin/                # Source monitoring & admin
│   │   └── api/                  # REST API endpoints
│   ├── components/               # React components
│   ├── lib/                      # Shared utilities, DB client
│   ├── types/                    # TypeScript type definitions
│   └── data/                     # Mock data for development
├── backend/                      # Python ingestion pipeline
│   ├── connectors/               # Per-league connector modules
│   │   ├── base.py               # BaseConnector abstract class
│   │   ├── registry.py           # Connector registry
│   │   ├── ahl.py                # AHL connector
│   │   ├── ohl.py                # OHL connector
│   │   ├── whl.py                # WHL connector
│   │   └── ...                   # 19 total connector modules
│   ├── pipeline/                 # Pipeline orchestration
│   │   ├── runner.py             # Ingestion runner (CLI)
│   │   └── analytics.py          # Post-ingestion analytics
│   ├── models/                   # Data models
│   │   └── player.py             # Normalized player/stats models
│   └── utils/                    # Normalization, matching
│       └── normalize.py          # Name normalization, parsing
└── database/                     # PostgreSQL schema & scripts
    ├── schema.sql                # Full database schema
    ├── migrate.js                # Migration runner
    ├── seed.js                   # League registry seeder
    └── reset.js                  # Full reset script
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + React 18 | Server & client rendering, routing |
| **Styling** | Tailwind CSS | Dark-themed analytics UI |
| **API** | Next.js API Routes | REST endpoints for data access |
| **Database** | PostgreSQL | Normalized storage with analytics columns |
| **Ingestion** | Python 3.11+ | League-specific connectors & ETL pipeline |
| **Types** | TypeScript | End-to-end type safety |

## Supported Leagues (27)

### Primary Pipeline (Tier 1)
- **AHL** — American Hockey League
- **OHL** — Ontario Hockey League (CHL)
- **WHL** — Western Hockey League (CHL)
- **QMJHL** — Quebec Major Junior Hockey League (CHL)
- **NCAA** — NCAA Division I Men's Hockey
- **USHL** — United States Hockey League
- **SHL** — Swedish Hockey League
- **Liiga** — Finnish Liiga
- **KHL** — Kontinental Hockey League
- **NL** — Swiss National League
- **DEL** — Deutsche Eishockey Liga
- **ELH** — Czech Extraliga
- **NTDP** — USA Hockey National Team Development Program

### Secondary & Development (Tier 2)
- **ECHL**, **NAHL**, **J20 Nationell**, **MHL**, **BCHL**, **Hockey Canada**

### Future / Placeholder (Tier 3)
- Swedish U18, Russian U18, US Prep/HS, European U18, CJHL

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+ (optional for development — mock data works without it)

### Install & Run

```bash
# Install Node dependencies
npm install

# Run development server (uses mock data, no database required)
npm run dev

# Open http://localhost:3000
```

### Database Setup (Optional)

```bash
# Create database
createdb puckprospects

# Copy environment config
cp .env.example .env
# Edit .env with your database URL

# Run migrations
npm run db:migrate

# Seed league registry
npm run db:seed
```

### Ingestion Pipeline

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# List all registered connectors
python -m backend.pipeline.runner --list

# Run ingestion for all leagues
python -m backend.pipeline.runner

# Run for specific leagues
python -m backend.pipeline.runner --leagues ahl ohl whl

# Run for a specific season
python -m backend.pipeline.runner --season 2024-25
```

## Key Features

### Master Prospect Dashboard
- Global search across all players and leagues
- Filterable by league, position, nationality, age, draft status, NHL affiliation
- Sortable columns with derived metrics
- League and age percentile indicators
- Paginated results with CSV export

### Player Profile Pages
- Biographical info with current context
- Season history with multi-year trends
- Percentile rankings (league, age, position)
- Similar player suggestions
- Source traceability

### Player Comparison Tool
- Side-by-side comparison of 2-4 players
- Stat comparison with visual bars
- Best-in-group highlighting
- Cross-league context

### Rankings Engine
- Multiple ranking views: Overall, By Position, Age-Adjusted, Draft Eligible, NHL Affiliated
- Custom scoring metrics
- Configurable filters

### Visual Analytics
- League breakdown (avg PPG, player counts)
- Age distribution charts
- Nationality breakdown
- Position distribution
- Draft status analysis
- Trend movers

### Admin Panel
- Source registry with connector status
- Ingestion log viewer
- Health monitoring dashboard
- Per-league status indicators

## Connector Pattern

Each league has a dedicated connector module that follows this pattern:

```python
class MyLeagueConnector(BaseConnector):
    league_code = 'my_league'
    league_name = 'My League'
    source_url = 'https://example.com/stats'

    def fetch_raw(self) -> dict:
        # Fetch data from source site
        ...

    def parse_players(self, raw: dict) -> list[NormalizedPlayer]:
        # Extract player records
        ...

    def parse_skater_stats(self, raw: dict) -> list[NormalizedSkaterStats]:
        # Extract stat lines
        ...

    def parse_goalie_stats(self, raw: dict) -> list[NormalizedGoalieStats]:
        # Extract goalie stats
        ...
```

Connectors feed into a unified normalized schema. The pipeline handles:
1. **Fetch** — HTTP requests to source sites
2. **Parse** — Extract structured data from HTML/JSON
3. **Normalize** — Map to common schema
4. **Validate** — Check data integrity
5. **Persist** — Write to PostgreSQL

### Adding a New Connector

1. Create `backend/connectors/my_league.py`
2. Subclass `BaseConnector`
3. Implement `fetch_raw()`, `parse_players()`, `parse_skater_stats()`
4. Register in `backend/connectors/registry.py`
5. Add league config to `src/lib/leagues.ts`

## Database Schema

Core tables:
- `leagues` — League registry with connector status
- `teams` — Team records with NHL affiliations
- `players` — Canonical player identity with fuzzy matching support
- `player_stats` — Per-season skater statistics with analytics columns
- `goalie_stats` — Per-season goalie statistics
- `stat_snapshots` — Historical snapshots for trend analysis
- `ingestion_log` — Connector run history
- `watchlist` — User-pinned players
- `league_averages` — Cached averages for normalization

## Analytics & Derived Metrics

Computed post-ingestion:
- Points per game, goals per game, assists per game
- League-relative scoring index (PPG vs league average)
- Age-adjusted production (younger = boost, older = penalty)
- Percentile ranks: league, age group, position
- Team points share
- Historical trend detection

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/players` | Search/filter players with pagination |
| GET | `/api/leagues` | List all leagues with status |
| GET | `/api/rankings` | Ranked player lists by various criteria |
| GET | `/api/comparisons?ids=1,2,3` | Player comparison data |
| GET | `/api/analytics` | Aggregate analytics for charts |
| GET | `/api/ingestion` | Ingestion status for all leagues |
| POST | `/api/ingestion` | Trigger ingestion run |

## Development Notes

- The app runs with **mock data** by default — no database required for frontend development
- Mock data includes ~200 realistic prospect records across 9 leagues
- All connector modules are **placeholder** implementations with detailed comments on how to implement scraping/parsing for each source
- The architecture is designed so connectors can be implemented incrementally without affecting other parts of the system
- Source sites may have different structures (HTML tables, JSON APIs, SPAs) — each connector handles its source's specifics

## License

Private — All rights reserved.
