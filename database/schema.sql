-- PuckProspects Database Schema
-- Normalized schema for cross-league NHL prospect analytics

-- Leagues registry
CREATE TABLE IF NOT EXISTS leagues (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,        -- e.g. 'ahl', 'ohl', 'shl'
    name VARCHAR(100) NOT NULL,              -- e.g. 'American Hockey League'
    short_name VARCHAR(20) NOT NULL,         -- e.g. 'AHL'
    country VARCHAR(60),
    level VARCHAR(30),                       -- 'pro', 'junior', 'college', 'u20', 'u18', 'development'
    tier INTEGER DEFAULT 1,                  -- 1=top, 2=secondary, 3=development
    source_url TEXT,
    connector_status VARCHAR(20) DEFAULT 'placeholder',  -- 'active', 'partial', 'manual', 'placeholder'
    last_ingested_at TIMESTAMPTZ,
    ingestion_healthy BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20),
    league_id INTEGER REFERENCES leagues(id),
    city VARCHAR(100),
    country VARCHAR(60),
    nhl_affiliate_id INTEGER,                -- self-ref for NHL parent team
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, league_id)
);

-- Players (canonical identity)
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    alternate_names TEXT[],                   -- for fuzzy matching across sources
    normalized_name VARCHAR(200),             -- lowercase, accent-stripped for matching
    date_of_birth DATE,
    age INTEGER,                             -- computed/cached
    birth_city VARCHAR(100),
    birth_country VARCHAR(60),
    nationality VARCHAR(60),
    position VARCHAR(10),                    -- 'C', 'LW', 'RW', 'D', 'G'
    position_group VARCHAR(10),              -- 'F', 'D', 'G'
    shoots_catches VARCHAR(5),               -- 'L', 'R'
    height_cm INTEGER,
    weight_kg INTEGER,
    height_display VARCHAR(10),              -- e.g. "6'1\""
    weight_display VARCHAR(10),              -- e.g. "195 lbs"

    -- NHL draft and affiliation
    draft_status VARCHAR(20),                -- 'drafted', 'undrafted', 'draft_eligible', 're_entry'
    draft_year INTEGER,
    draft_round INTEGER,
    draft_pick INTEGER,
    draft_overall INTEGER,
    drafted_by VARCHAR(60),                  -- NHL team that drafted
    nhl_rights_holder VARCHAR(60),           -- current NHL rights (may differ from drafted_by)
    nhl_team_id INTEGER,

    -- Current context
    current_team_id INTEGER REFERENCES teams(id),
    current_league_id INTEGER REFERENCES leagues(id),

    -- Source tracking
    external_ids JSONB DEFAULT '{}',         -- { "elite_prospects": "123", "ahl": "456" }
    source_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_players_normalized_name ON players(normalized_name);
CREATE INDEX idx_players_nationality ON players(nationality);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_draft_status ON players(draft_status);
CREATE INDEX idx_players_nhl_rights ON players(nhl_rights_holder);
CREATE INDEX idx_players_dob ON players(date_of_birth);
CREATE INDEX idx_players_league ON players(current_league_id);

-- Player season stats (skaters)
CREATE TABLE IF NOT EXISTS player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    season VARCHAR(10) NOT NULL,             -- e.g. '2024-25'
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    team_id INTEGER REFERENCES teams(id),
    team_name VARCHAR(100),

    -- Core stats
    games_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    penalty_minutes INTEGER DEFAULT 0,
    plus_minus INTEGER,

    -- Derived (computed on insert/update)
    points_per_game NUMERIC(5,2),
    goals_per_game NUMERIC(5,2),
    assists_per_game NUMERIC(5,2),

    -- Power play
    pp_goals INTEGER,
    pp_assists INTEGER,
    pp_points INTEGER,

    -- Shorthanded
    sh_goals INTEGER,
    sh_assists INTEGER,
    sh_points INTEGER,

    -- Shooting
    shots INTEGER,
    shooting_pct NUMERIC(5,2),

    -- Faceoffs
    faceoff_wins INTEGER,
    faceoff_losses INTEGER,
    faceoff_pct NUMERIC(5,2),

    -- Ice time (minutes per game avg)
    avg_toi NUMERIC(6,2),

    -- Game-winning
    gw_goals INTEGER,
    ot_goals INTEGER,
    first_goals INTEGER,

    -- Hits & blocks (if available)
    hits INTEGER,
    blocked_shots INTEGER,
    takeaways INTEGER,
    giveaways INTEGER,

    -- Advanced / derived analytics (computed post-ingestion)
    league_scoring_index NUMERIC(5,2),       -- pts relative to league avg
    age_adjusted_ppg NUMERIC(5,2),           -- age-context adjusted
    team_pts_share NUMERIC(5,2),             -- % of team points
    league_percentile NUMERIC(5,2),          -- percentile within league
    age_percentile NUMERIC(5,2),             -- percentile within age group
    position_percentile NUMERIC(5,2),        -- percentile within position

    -- Source tracking
    source_league VARCHAR(20),
    source_site VARCHAR(100),
    source_url TEXT,
    raw_data JSONB,                          -- original payload for debugging
    snapshot_date DATE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(player_id, season, league_id, team_id)
);

CREATE INDEX idx_stats_player ON player_stats(player_id);
CREATE INDEX idx_stats_season ON player_stats(season);
CREATE INDEX idx_stats_league ON player_stats(league_id);
CREATE INDEX idx_stats_points ON player_stats(points DESC);
CREATE INDEX idx_stats_ppg ON player_stats(points_per_game DESC);

-- Goalie stats
CREATE TABLE IF NOT EXISTS goalie_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    season VARCHAR(10) NOT NULL,
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    team_id INTEGER REFERENCES teams(id),
    team_name VARCHAR(100),

    games_played INTEGER DEFAULT 0,
    games_started INTEGER,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    otl INTEGER DEFAULT 0,
    ties INTEGER,
    shutouts INTEGER DEFAULT 0,

    goals_against INTEGER,
    goals_against_avg NUMERIC(5,2),
    saves INTEGER,
    shots_against INTEGER,
    save_pct NUMERIC(6,4),

    minutes_played NUMERIC(8,2),
    quality_starts INTEGER,

    -- Derived analytics
    league_percentile NUMERIC(5,2),
    age_percentile NUMERIC(5,2),

    -- Source tracking
    source_league VARCHAR(20),
    source_url TEXT,
    raw_data JSONB,
    snapshot_date DATE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(player_id, season, league_id, team_id)
);

-- Historical snapshots for trend analysis
CREATE TABLE IF NOT EXISTS stat_snapshots (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    season VARCHAR(10) NOT NULL,
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    snapshot_date DATE NOT NULL,
    stat_type VARCHAR(10) DEFAULT 'skater',  -- 'skater' or 'goalie'
    stats_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_snapshots_player_date ON stat_snapshots(player_id, snapshot_date);

-- Ingestion log
CREATE TABLE IF NOT EXISTS ingestion_log (
    id SERIAL PRIMARY KEY,
    league_code VARCHAR(20) NOT NULL,
    connector_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,             -- 'started', 'success', 'partial', 'failed'
    records_fetched INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    errors JSONB,
    duration_ms INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ingestion_league ON ingestion_log(league_code);
CREATE INDEX idx_ingestion_status ON ingestion_log(status);

-- User watchlists
CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    notes TEXT,
    tags TEXT[],
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- League averages cache (for normalization)
CREATE TABLE IF NOT EXISTS league_averages (
    id SERIAL PRIMARY KEY,
    league_id INTEGER NOT NULL REFERENCES leagues(id),
    season VARCHAR(10) NOT NULL,
    position_group VARCHAR(10),              -- 'F', 'D', 'G', or NULL for all
    avg_goals NUMERIC(5,2),
    avg_assists NUMERIC(5,2),
    avg_points NUMERIC(5,2),
    avg_ppg NUMERIC(5,2),
    avg_gpg NUMERIC(5,2),
    avg_pim NUMERIC(5,2),
    median_points NUMERIC(5,2),
    stddev_points NUMERIC(5,2),
    total_players INTEGER,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, season, position_group)
);
