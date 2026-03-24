// ============================================================================
// Player Identity Resolution
// ============================================================================
// Resolves whether a player record from a source matches an existing player
// in our database. Uses a cascade of matching strategies from high to low
// confidence.
// ============================================================================

import pool from '@/lib/db';
import { NormalizedPlayer, PlayerIdentityLink } from '../domain/models';
import { createLogger } from './logger';

const log = createLogger('Identity');

export interface IdentityMatch {
  internalPlayerId: number;
  confidence: number;
  method: PlayerIdentityLink['matchMethod'];
}

/**
 * Try to find an existing player that matches the given normalized player.
 * Returns null if no match is found (new player).
 */
export async function resolvePlayerIdentity(
  player: NormalizedPlayer
): Promise<IdentityMatch | null> {
  // Strategy 1: Source ID match (highest confidence)
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

  // Strategy 3: Exact normalized name + same league (weaker)
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

  // Strategy 4: Check alternate names
  if (player.normalizedName) {
    const result = await pool.query(
      `SELECT id FROM players
       WHERE $1 = ANY(
         SELECT unnest(alternate_names)
       )
       OR normalized_name = $1`,
      [player.normalizedName]
    );
    if (result.rows.length === 1) {
      return {
        internalPlayerId: result.rows[0].id,
        confidence: 0.7,
        method: 'fuzzy_name_dob',
      };
    }
  }

  log.debug('No identity match found', { name: player.fullName, league: player.league });
  return null;
}

/**
 * Normalize a name for identity matching.
 * Strips accents, lowercases, removes non-alpha characters.
 */
export function normalizeNameForMatching(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Link a player record from a source to our internal player.
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
