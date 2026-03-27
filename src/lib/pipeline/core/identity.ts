// ============================================================================
// Player Identity Resolution — Core Pipeline Integration
// ============================================================================
// Factory for creating identity resolvers in the pipeline context.
// The resolver uses the identity module's fuzzy matching, confidence scoring,
// and cascading strategies to link players across sources.
// ============================================================================

import pool from '@/lib/db';
import { NormalizedPlayer, PlayerIdentityLink } from '../domain/models';
import { PlayerIdentityResolver } from '../identity/resolver';
import { PostgresIdentityStore, InMemoryIdentityStore } from '../identity/stores';
import { normalizeForMatching } from '../identity/matching';
import { createLogger } from './logger';

const log = createLogger('Identity');

// Re-export for convenience
export { PlayerIdentityResolver } from '../identity/resolver';
export { InMemoryIdentityStore, PostgresIdentityStore } from '../identity/stores';
export { normalizeForMatching as normalizeNameForMatching } from '../identity/matching';

/**
 * Create a resolver backed by the pipeline database.
 * Falls back to in-memory store if DB pool is unavailable.
 */
export function createResolver(pgPool?: import('pg').Pool): PlayerIdentityResolver {
  const effectivePool = pgPool || pool;
  try {
    return new PlayerIdentityResolver(new PostgresIdentityStore(effectivePool));
  } catch {
    log.warn('Could not create PostgreSQL identity store, falling back to in-memory');
    return new PlayerIdentityResolver(new InMemoryIdentityStore());
  }
}

/**
 * Legacy: resolve player identity via DB cascade (kept for backward compatibility).
 * Prefer using PlayerIdentityResolver for new code.
 */
export async function resolvePlayerIdentity(
  player: NormalizedPlayer
): Promise<{ internalPlayerId: number; confidence: number; method: PlayerIdentityLink['matchMethod'] } | null> {
  // Strategy 1: Source ID match
  for (const [source, sourceId] of Object.entries(player.sourceIds)) {
    const result = await pool.query(
      `SELECT internal_player_id, confidence FROM player_identity_links
       WHERE source_name = $1 AND source_player_id = $2`,
      [source, sourceId]
    );
    if (result.rows.length > 0) {
      return {
        internalPlayerId: result.rows[0].internal_player_id,
        confidence: result.rows[0].confidence,
        method: 'source_id',
      };
    }
  }

  // Strategy 2: Exact normalized name + DOB
  if (player.normalizedName && player.dateOfBirth) {
    const result = await pool.query(
      'SELECT id FROM players WHERE normalized_name = $1 AND date_of_birth = $2',
      [player.normalizedName, player.dateOfBirth]
    );
    if (result.rows.length === 1) {
      return {
        internalPlayerId: result.rows[0].id,
        confidence: 0.95,
        method: 'exact_name_dob',
      };
    }
  }

  // Strategy 3: Exact normalized name + same league
  if (player.normalizedName && player.league) {
    const result = await pool.query(
      `SELECT p.id FROM players p
       JOIN leagues l ON l.id = p.current_league_id
       WHERE p.normalized_name = $1 AND l.code = $2`,
      [player.normalizedName, player.league]
    );
    if (result.rows.length === 1) {
      return {
        internalPlayerId: result.rows[0].id,
        confidence: 0.8,
        method: 'fuzzy_name_dob',
      };
    }
  }

  log.debug('No identity match found', { name: player.fullName, league: player.league });
  return null;
}

/**
 * Legacy: create an identity link in the DB.
 */
export async function createIdentityLink(link: PlayerIdentityLink): Promise<void> {
  await pool.query(
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
