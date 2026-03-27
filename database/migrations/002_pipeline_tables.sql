-- ============================================================================
-- Pipeline Tables Migration
-- ============================================================================
-- Adds tables needed by the live data ingestion pipeline.
-- Run after the base schema (schema.sql).
-- ============================================================================

-- Source connectors registry (tracks connector config & health in DB)
CREATE TABLE IF NOT EXISTS source_connectors (
    id SERIAL PRIMARY KEY,
    connector_name VARCHAR(50) UNIQUE NOT NULL,    -- e.g. 'ep_ohl_scraper'
    source_type VARCHAR(20) NOT NULL,              -- 'api', 'scrape', 'hybrid', 'enrichment', 'partial'
    league_code VARCHAR(20) NOT NULL,
    source_url TEXT,
    enabled BOOLEAN DEFAULT true,
    ingestion_cadence VARCHAR(20) DEFAULT 'daily', -- 'realtime', 'hourly', 'daily', 'weekly', 'manual'
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    consecutive_failures INTEGER DEFAULT 0,
    field_coverage JSONB DEFAULT '{}',
    known_limitations TEXT[],
    config JSONB DEFAULT '{}',                     -- connector-specific config
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_source_connectors_league ON source_connectors(league_code);
CREATE INDEX idx_source_connectors_enabled ON source_connectors(enabled);

-- Raw source payloads (stores fetched HTML/JSON for auditing and replay)
CREATE TABLE IF NOT EXISTS raw_source_payloads (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(50) NOT NULL,
    source_url TEXT,
    league_code VARCHAR(20),
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    content_type VARCHAR(10),                      -- 'html', 'json', 'csv', 'xml'
    http_status INTEGER,
    body_hash VARCHAR(64),                         -- SHA-256 for dedup
    body_size INTEGER,
    raw_body TEXT,                                  -- the actual payload
    ingestion_run_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_raw_payloads_source ON raw_source_payloads(source_name);
CREATE INDEX idx_raw_payloads_league ON raw_source_payloads(league_code);
CREATE INDEX idx_raw_payloads_hash ON raw_source_payloads(body_hash);
CREATE INDEX idx_raw_payloads_fetched ON raw_source_payloads(fetched_at);

-- Player identity links (cross-source player resolution)
CREATE TABLE IF NOT EXISTS player_identity_links (
    id SERIAL PRIMARY KEY,
    internal_player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    source_name VARCHAR(50) NOT NULL,
    source_player_id VARCHAR(100) NOT NULL,
    confidence NUMERIC(3,2) DEFAULT 1.0,           -- 0.00 to 1.00
    match_method VARCHAR(30),                      -- 'exact_name_dob', 'fuzzy_name_dob', 'source_id', 'manual'
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_name, source_player_id)
);

CREATE INDEX idx_identity_links_player ON player_identity_links(internal_player_id);
CREATE INDEX idx_identity_links_source ON player_identity_links(source_name, source_player_id);

-- Extend ingestion_log with more tracking fields (add columns if they don't exist)
-- Note: existing ingestion_log table from schema.sql already has the basics.
-- We add a few more columns for the pipeline.
ALTER TABLE ingestion_log ADD COLUMN IF NOT EXISTS records_skipped INTEGER DEFAULT 0;
ALTER TABLE ingestion_log ADD COLUMN IF NOT EXISTS warnings JSONB;
ALTER TABLE ingestion_log ADD COLUMN IF NOT EXISTS phase VARCHAR(20);
ALTER TABLE ingestion_log ADD COLUMN IF NOT EXISTS raw_payload_id INTEGER;

-- Flagged identity matches (uncertain matches needing human review)
CREATE TABLE IF NOT EXISTS flagged_identity_matches (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(50) NOT NULL,
    source_player_id VARCHAR(100),
    source_full_name TEXT NOT NULL,
    source_normalized_name TEXT NOT NULL,
    source_dob DATE,
    source_league VARCHAR(20),
    candidates JSONB NOT NULL DEFAULT '[]',           -- array of {internalId, normalizedName, confidence, method}
    reason VARCHAR(30) NOT NULL,                      -- 'ambiguous_match', 'low_confidence', 'multiple_candidates', 'dob_mismatch'
    best_confidence NUMERIC(3,2),
    resolution VARCHAR(20) DEFAULT 'pending',         -- 'pending', 'linked', 'new_player', 'dismissed'
    resolved_by VARCHAR(50),                          -- admin username
    resolved_internal_player_id INTEGER REFERENCES players(id),
    flagged_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_flagged_matches_status ON flagged_identity_matches(resolution);
CREATE INDEX idx_flagged_matches_source ON flagged_identity_matches(source_name);
CREATE INDEX idx_flagged_matches_league ON flagged_identity_matches(source_league);
