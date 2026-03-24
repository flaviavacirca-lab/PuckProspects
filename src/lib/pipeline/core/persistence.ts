// ============================================================================
// Persistence Layer
// ============================================================================
// Handles writing normalized data to the database. Implements upsert logic
// so re-ingesting the same data is safe (idempotent).
// ============================================================================

import { PoolClient } from 'pg';
import pool from '@/lib/db';
import {
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
  IngestionRun,
  RawSourcePayload,
  PlayerIdentityLink,
} from '../domain/models';
import { createLogger } from './logger';

const log = createLogger('Persistence');

// --- Ingestion Run ---

export async function insertIngestionRun(run: IngestionRun): Promise<number> {
  const result = await pool.query(
    `INSERT INTO ingestion_log
      (league_code, connector_name, status, records_fetched, records_inserted,
       records_updated, records_skipped, errors, warnings, started_at, completed_at, duration_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id`,
    [
      run.league, run.connectorName, run.status,
      run.recordsFetched, run.recordsInserted, run.recordsUpdated, run.recordsSkipped,
      JSON.stringify(run.errors), JSON.stringify(run.warnings),
      run.startedAt, run.completedAt, run.durationMs,
    ]
  );
  return result.rows[0].id;
}

export async function updateIngestionRun(id: number, run: Partial<IngestionRun>): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  if (run.status !== undefined) { sets.push(`status = $${idx++}`); vals.push(run.status); }
  if (run.recordsFetched !== undefined) { sets.push(`records_fetched = $${idx++}`); vals.push(run.recordsFetched); }
  if (run.recordsInserted !== undefined) { sets.push(`records_inserted = $${idx++}`); vals.push(run.recordsInserted); }
  if (run.recordsUpdated !== undefined) { sets.push(`records_updated = $${idx++}`); vals.push(run.recordsUpdated); }
  if (run.recordsSkipped !== undefined) { sets.push(`records_skipped = $${idx++}`); vals.push(run.recordsSkipped); }
  if (run.errors !== undefined) { sets.push(`errors = $${idx++}`); vals.push(JSON.stringify(run.errors)); }
  if (run.completedAt !== undefined) { sets.push(`completed_at = $${idx++}`); vals.push(run.completedAt); }
  if (run.durationMs !== undefined) { sets.push(`duration_ms = $${idx++}`); vals.push(run.durationMs); }

  if (sets.length === 0) return;
  vals.push(id);
  await pool.query(`UPDATE ingestion_log SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
}

// --- Raw Payloads ---

export async function insertRawPayload(payload: RawSourcePayload): Promise<number> {
  const result = await pool.query(
    `INSERT INTO raw_source_payloads
      (source_name, source_url, league_code, fetched_at, content_type,
       http_status, body_hash, body_size, raw_body)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      payload.sourceName, payload.sourceUrl, payload.league,
      payload.fetchedAt, payload.contentType,
      payload.httpStatus, payload.bodyHash, payload.bodySize, payload.rawBody,
    ]
  );
  return result.rows[0].id;
}

/** Check if we already have this exact payload (by hash) */
export async function payloadExists(bodyHash: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM raw_source_payloads WHERE body_hash = $1 LIMIT 1',
    [bodyHash]
  );
  return result.rows.length > 0;
}

// --- Players ---

export interface UpsertResult {
  id: number;
  action: 'inserted' | 'updated' | 'skipped';
}

/**
 * Upsert a player by normalized name + date of birth.
 * If a match exists, update fields that are non-null in the new data.
 * If no match, insert a new player.
 */
export async function upsertPlayer(player: NormalizedPlayer, client?: PoolClient): Promise<UpsertResult> {
  const db = client || pool;

  // Try to find existing player by source ID first
  for (const [source, sourceId] of Object.entries(player.sourceIds)) {
    const existing = await db.query(
      `SELECT p.id FROM players p
       JOIN player_identity_links pil ON pil.internal_player_id = p.id
       WHERE pil.source_name = $1 AND pil.source_player_id = $2`,
      [source, sourceId]
    );
    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;
      await updatePlayerFields(id, player, db);
      return { id, action: 'updated' };
    }
  }

  // Try to match by normalized name + DOB
  if (player.normalizedName && player.dateOfBirth) {
    const match = await db.query(
      'SELECT id FROM players WHERE normalized_name = $1 AND date_of_birth = $2',
      [player.normalizedName, player.dateOfBirth]
    );
    if (match.rows.length > 0) {
      const id = match.rows[0].id;
      await updatePlayerFields(id, player, db);
      return { id, action: 'updated' };
    }
  }

  // Try to match by normalized name only (weaker match)
  if (player.normalizedName) {
    const match = await db.query(
      'SELECT id FROM players WHERE normalized_name = $1',
      [player.normalizedName]
    );
    if (match.rows.length === 1) {
      const id = match.rows[0].id;
      await updatePlayerFields(id, player, db);
      return { id, action: 'updated' };
    }
  }

  // Insert new player
  const posGroup = player.positionGroup || (player.position === 'G' ? 'G' : player.position === 'D' ? 'D' : 'F');
  const result = await db.query(
    `INSERT INTO players
      (first_name, last_name, full_name, normalized_name, alternate_names,
       date_of_birth, age, birth_city, birth_country, nationality,
       position, position_group, shoots_catches, height_cm, weight_kg,
       draft_status, draft_year, draft_round, draft_pick, draft_overall,
       drafted_by, nhl_rights_holder, external_ids, source_urls)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
     RETURNING id`,
    [
      player.firstName, player.lastName, player.fullName, player.normalizedName,
      player.alternateNames.length > 0 ? player.alternateNames : null,
      player.dateOfBirth, player.age, player.birthCity, player.birthCountry,
      player.nationality, player.position, posGroup, player.handedness,
      player.heightCm, player.weightKg,
      player.draftStatus, player.draftYear, player.draftRound, player.draftPick,
      player.draftOverall, player.draftedBy, player.nhlRightsHolder,
      JSON.stringify(player.sourceIds), player.sourceUrl ? [player.sourceUrl] : null,
    ]
  );

  return { id: result.rows[0].id, action: 'inserted' };
}

async function updatePlayerFields(
  id: number,
  player: NormalizedPlayer,
  db: PoolClient | typeof pool
): Promise<void> {
  // Only update non-null fields from the new data
  const updates: string[] = [];
  const vals: unknown[] = [];
  let idx = 1;

  const maybeSet = (col: string, val: unknown) => {
    if (val !== null && val !== undefined) {
      updates.push(`${col} = $${idx++}`);
      vals.push(val);
    }
  };

  maybeSet('nationality', player.nationality);
  maybeSet('position', player.position);
  maybeSet('height_cm', player.heightCm);
  maybeSet('weight_kg', player.weightKg);
  maybeSet('age', player.age);
  maybeSet('draft_status', player.draftStatus);
  maybeSet('nhl_rights_holder', player.nhlRightsHolder);
  maybeSet('shoots_catches', player.handedness);

  if (Object.keys(player.sourceIds).length > 0) {
    updates.push(`external_ids = COALESCE(external_ids, '{}'::jsonb) || $${idx++}::jsonb`);
    vals.push(JSON.stringify(player.sourceIds));
  }

  updates.push(`updated_at = NOW()`);

  if (updates.length > 1) {
    vals.push(id);
    await db.query(
      `UPDATE players SET ${updates.join(', ')} WHERE id = $${idx}`,
      vals
    );
  }
}

// --- Skater Stats ---

export async function upsertSkaterStats(
  stats: NormalizedSkaterStats,
  playerId: number,
  client?: PoolClient
): Promise<UpsertResult> {
  const db = client || pool;

  // Look up league_id from league code
  const leagueResult = await db.query('SELECT id FROM leagues WHERE code = $1', [stats.league]);
  const leagueId = leagueResult.rows[0]?.id;
  if (!leagueId) {
    log.warn('League not found, skipping stats', { league: stats.league });
    return { id: 0, action: 'skipped' };
  }

  // Check for existing stat row
  const existing = await db.query(
    `SELECT id FROM player_stats
     WHERE player_id = $1 AND season = $2 AND league_id = $3
     AND (team_name = $4 OR ($4 IS NULL AND team_name IS NULL))`,
    [playerId, stats.season, leagueId, stats.teamName]
  );

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await db.query(
      `UPDATE player_stats SET
        games_played = $1, goals = $2, assists = $3, points = $4,
        penalty_minutes = $5, plus_minus = $6,
        points_per_game = $7, goals_per_game = $8, assists_per_game = $9,
        pp_goals = $10, pp_assists = $11, pp_points = $12,
        sh_goals = $13, sh_assists = $14, sh_points = $15,
        shots = $16, shooting_pct = $17,
        faceoff_wins = $18, faceoff_losses = $19, faceoff_pct = $20,
        avg_toi = $21, gw_goals = $22, hits = $23, blocked_shots = $24,
        source_league = $25, source_url = $26,
        raw_data = $27, snapshot_date = $28, last_updated = NOW()
       WHERE id = $29`,
      [
        stats.gamesPlayed, stats.goals, stats.assists, stats.points,
        stats.penaltyMinutes, stats.plusMinus,
        stats.pointsPerGame,
        stats.gamesPlayed > 0 ? Math.round((stats.goals / stats.gamesPlayed) * 100) / 100 : 0,
        stats.gamesPlayed > 0 ? Math.round((stats.assists / stats.gamesPlayed) * 100) / 100 : 0,
        stats.ppGoals, stats.ppAssists, stats.ppPoints,
        stats.shGoals, stats.shAssists, stats.shPoints,
        stats.shots, stats.shootingPct,
        stats.faceoffWins, stats.faceoffLosses, stats.faceoffPct,
        stats.avgToi, stats.gwGoals, stats.hits, stats.blockedShots,
        stats.league, stats.sourceUrl,
        stats.rawPayload ? JSON.stringify(stats.rawPayload) : null,
        stats.snapshotDate,
        id,
      ]
    );
    return { id, action: 'updated' };
  }

  // Insert new stat row
  const result = await db.query(
    `INSERT INTO player_stats
      (player_id, season, league_id, team_name,
       games_played, goals, assists, points, penalty_minutes, plus_minus,
       points_per_game, goals_per_game, assists_per_game,
       pp_goals, pp_assists, pp_points,
       sh_goals, sh_assists, sh_points,
       shots, shooting_pct,
       faceoff_wins, faceoff_losses, faceoff_pct,
       avg_toi, gw_goals, hits, blocked_shots,
       source_league, source_url, raw_data, snapshot_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)
     RETURNING id`,
    [
      playerId, stats.season, leagueId, stats.teamName,
      stats.gamesPlayed, stats.goals, stats.assists, stats.points,
      stats.penaltyMinutes, stats.plusMinus,
      stats.pointsPerGame,
      stats.gamesPlayed > 0 ? Math.round((stats.goals / stats.gamesPlayed) * 100) / 100 : 0,
      stats.gamesPlayed > 0 ? Math.round((stats.assists / stats.gamesPlayed) * 100) / 100 : 0,
      stats.ppGoals, stats.ppAssists, stats.ppPoints,
      stats.shGoals, stats.shAssists, stats.shPoints,
      stats.shots, stats.shootingPct,
      stats.faceoffWins, stats.faceoffLosses, stats.faceoffPct,
      stats.avgToi, stats.gwGoals, stats.hits, stats.blockedShots,
      stats.league, stats.sourceUrl,
      stats.rawPayload ? JSON.stringify(stats.rawPayload) : null,
      stats.snapshotDate,
    ]
  );
  return { id: result.rows[0].id, action: 'inserted' };
}

// --- Goalie Stats ---

export async function upsertGoalieStats(
  stats: NormalizedGoalieStats,
  playerId: number,
  client?: PoolClient
): Promise<UpsertResult> {
  const db = client || pool;

  const leagueResult = await db.query('SELECT id FROM leagues WHERE code = $1', [stats.league]);
  const leagueId = leagueResult.rows[0]?.id;
  if (!leagueId) {
    log.warn('League not found for goalie stats', { league: stats.league });
    return { id: 0, action: 'skipped' };
  }

  const existing = await db.query(
    `SELECT id FROM goalie_stats
     WHERE player_id = $1 AND season = $2 AND league_id = $3`,
    [playerId, stats.season, leagueId]
  );

  if (existing.rows.length > 0) {
    const id = existing.rows[0].id;
    await db.query(
      `UPDATE goalie_stats SET
        team_name = $1, games_played = $2, games_started = $3,
        wins = $4, losses = $5, otl = $6, shutouts = $7,
        goals_against = $8, goals_against_avg = $9,
        saves = $10, shots_against = $11, save_pct = $12,
        minutes_played = $13, source_league = $14, source_url = $15,
        raw_data = $16, snapshot_date = $17, last_updated = NOW()
       WHERE id = $18`,
      [
        stats.teamName, stats.gamesPlayed, stats.gamesStarted,
        stats.wins, stats.losses, stats.otl, stats.shutouts,
        stats.goalsAgainst, stats.goalsAgainstAvg,
        stats.saves, stats.shotsAgainst, stats.savePct,
        stats.minutesPlayed, stats.league, stats.sourceUrl,
        stats.rawPayload ? JSON.stringify(stats.rawPayload) : null,
        stats.snapshotDate, id,
      ]
    );
    return { id, action: 'updated' };
  }

  const result = await db.query(
    `INSERT INTO goalie_stats
      (player_id, season, league_id, team_name,
       games_played, games_started, wins, losses, otl, shutouts,
       goals_against, goals_against_avg, saves, shots_against, save_pct,
       minutes_played, source_league, source_url, raw_data, snapshot_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
     RETURNING id`,
    [
      playerId, stats.season, leagueId, stats.teamName,
      stats.gamesPlayed, stats.gamesStarted, stats.wins, stats.losses,
      stats.otl, stats.shutouts,
      stats.goalsAgainst, stats.goalsAgainstAvg, stats.saves,
      stats.shotsAgainst, stats.savePct,
      stats.minutesPlayed, stats.league, stats.sourceUrl,
      stats.rawPayload ? JSON.stringify(stats.rawPayload) : null,
      stats.snapshotDate,
    ]
  );
  return { id: result.rows[0].id, action: 'inserted' };
}

// --- Identity Links ---

export async function upsertIdentityLink(link: PlayerIdentityLink, client?: PoolClient): Promise<void> {
  const db = client || pool;
  await db.query(
    `INSERT INTO player_identity_links
      (internal_player_id, source_name, source_player_id, confidence, match_method)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (source_name, source_player_id)
     DO UPDATE SET
       internal_player_id = $1,
       confidence = GREATEST(player_identity_links.confidence, $4)`,
    [link.internalPlayerId, link.sourceName, link.sourcePlayerId, link.confidence, link.matchMethod]
  );
}

// --- Source Connector Registration ---

export async function upsertSourceConnector(
  connectorName: string,
  sourceType: string,
  leagueCode: string,
  sourceUrl: string,
  config: Record<string, unknown> = {}
): Promise<void> {
  await pool.query(
    `INSERT INTO source_connectors
      (connector_name, source_type, league_code, source_url, config)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (connector_name)
     DO UPDATE SET
       source_url = $4, config = $5, updated_at = NOW()`,
    [connectorName, sourceType, leagueCode, sourceUrl, JSON.stringify(config)]
  );
}

export async function markConnectorSuccess(connectorName: string): Promise<void> {
  await pool.query(
    `UPDATE source_connectors
     SET last_success_at = NOW(), consecutive_failures = 0, updated_at = NOW()
     WHERE connector_name = $1`,
    [connectorName]
  );
}

export async function markConnectorFailure(connectorName: string): Promise<void> {
  await pool.query(
    `UPDATE source_connectors
     SET last_failure_at = NOW(), consecutive_failures = consecutive_failures + 1, updated_at = NOW()
     WHERE connector_name = $1`,
    [connectorName]
  );
}

// --- Batch persistence (wraps all writes in a transaction) ---

export async function persistConnectorResult(result: {
  players: NormalizedPlayer[];
  skaterStats: NormalizedSkaterStats[];
  goalieStats: NormalizedGoalieStats[];
}): Promise<{ inserted: number; updated: number; skipped: number }> {
  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    await client.query('BEGIN');

    // Map: sourceName:sourceId → internalId
    const playerIdMap = new Map<string, number>();

    // Persist players first
    for (const player of result.players) {
      try {
        const res = await upsertPlayer(player, client);
        if (res.action === 'inserted') inserted++;
        else if (res.action === 'updated') updated++;
        else skipped++;

        // Map source IDs to internal ID
        for (const [source, sourceId] of Object.entries(player.sourceIds)) {
          playerIdMap.set(`${source}:${sourceId}`, res.id);
          await upsertIdentityLink({
            internalPlayerId: res.id,
            sourceName: source,
            sourcePlayerId: sourceId,
            confidence: 1.0,
            matchMethod: 'source_id',
            createdAt: new Date(),
            verifiedAt: null,
          }, client);
        }

        // Also map by normalized name for stats matching
        if (player.normalizedName) {
          playerIdMap.set(`name:${player.normalizedName}`, res.id);
        }
      } catch (err) {
        log.warn('Failed to upsert player', { name: player.fullName, error: String(err) });
        skipped++;
      }
    }

    // Persist skater stats
    for (const stat of result.skaterStats) {
      try {
        // Resolve player ID
        let playerId = stat.playerId;
        if (!playerId) {
          // Try to find by source ID in the map
          for (const player of result.players) {
            for (const [source, sourceId] of Object.entries(player.sourceIds)) {
              const key = `${source}:${sourceId}`;
              if (playerIdMap.has(key) && player.normalizedName) {
                // Match stat to player by name (stats don't carry source IDs directly)
                // This is a simple approach; real matching uses identity resolution
                playerId = playerIdMap.get(key) || null;
              }
            }
          }
        }
        if (!playerId) {
          log.warn('Could not resolve player for stats', { team: stat.teamName, league: stat.league });
          skipped++;
          continue;
        }

        const res = await upsertSkaterStats(stat, playerId, client);
        if (res.action === 'inserted') inserted++;
        else if (res.action === 'updated') updated++;
        else skipped++;
      } catch (err) {
        log.warn('Failed to upsert skater stats', { error: String(err) });
        skipped++;
      }
    }

    // Persist goalie stats
    for (const stat of result.goalieStats) {
      try {
        const playerId = stat.playerId;
        if (!playerId) {
          skipped++;
          continue;
        }
        const res = await upsertGoalieStats(stat, playerId, client);
        if (res.action === 'inserted') inserted++;
        else if (res.action === 'updated') updated++;
        else skipped++;
      } catch (err) {
        log.warn('Failed to upsert goalie stats', { error: String(err) });
        skipped++;
      }
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return { inserted, updated, skipped };
}
