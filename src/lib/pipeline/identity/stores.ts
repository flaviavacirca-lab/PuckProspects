// ============================================================================
// Identity Store Implementations
// ============================================================================
// Two implementations of the IdentityStore interface:
//   1. InMemoryIdentityStore — for testing, examples, and environments without DB
//   2. PostgresIdentityStore — production store backed by the pipeline database
// ============================================================================

import { NormalizedPlayer, PlayerIdentityLink } from '../domain/models';
import {
  CanonicalPlayer,
  FlaggedMatch,
  IdentityStore,
} from './resolver';
import { normalizeForMatching } from './matching';
import { createLogger } from '../core/logger';

const log = createLogger('IdentityStore');

// ============================================================================
// In-Memory Store (for testing and examples)
// ============================================================================

export class InMemoryIdentityStore implements IdentityStore {
  private players: Map<number, CanonicalPlayer> = new Map();
  private sourceIdIndex: Map<string, number> = new Map(); // "source:id" → internalId
  private nameIndex: Map<string, number[]> = new Map(); // normalizedName → [internalId]
  private leagueIndex: Map<string, number[]> = new Map(); // leagueCode → [internalId]
  private links: PlayerIdentityLink[] = [];
  private flaggedMatches: FlaggedMatch[] = [];
  private nextId = 1;

  /** Seed with existing players for testing */
  seed(players: CanonicalPlayer[]): void {
    for (const p of players) {
      this.players.set(p.internalId, p);
      this.nextId = Math.max(this.nextId, p.internalId + 1);

      // Index by source IDs
      for (const [source, sourceId] of Object.entries(p.sourceIds)) {
        this.sourceIdIndex.set(`${source}:${sourceId}`, p.internalId);
      }

      // Index by normalized name
      const existing = this.nameIndex.get(p.normalizedName) || [];
      existing.push(p.internalId);
      this.nameIndex.set(p.normalizedName, existing);

      // Index by league
      if (p.league) {
        const leaguePlayers = this.leagueIndex.get(p.league) || [];
        leaguePlayers.push(p.internalId);
        this.leagueIndex.set(p.league, leaguePlayers);
      }
    }
  }

  async findBySourceId(sourceName: string, sourcePlayerId: string): Promise<CanonicalPlayer | null> {
    const key = `${sourceName}:${sourcePlayerId}`;
    const id = this.sourceIdIndex.get(key);
    return id !== undefined ? this.players.get(id) || null : null;
  }

  async findByNormalizedName(normalizedName: string): Promise<CanonicalPlayer[]> {
    const ids = this.nameIndex.get(normalizedName) || [];
    return ids.map(id => this.players.get(id)!).filter(Boolean);
  }

  async findCandidatesByNamePrefix(namePrefix: string): Promise<CanonicalPlayer[]> {
    const results: CanonicalPlayer[] = [];
    this.nameIndex.forEach((ids, name) => {
      if (name.includes(namePrefix)) {
        for (const id of ids) {
          const p = this.players.get(id);
          if (p) results.push(p);
        }
      }
    });
    return results;
  }

  async findByLeague(leagueCode: string): Promise<CanonicalPlayer[]> {
    const ids = this.leagueIndex.get(leagueCode) || [];
    return ids.map(id => this.players.get(id)!).filter(Boolean);
  }

  async createPlayer(player: NormalizedPlayer): Promise<number> {
    const id = this.nextId++;
    const canonical: CanonicalPlayer = {
      internalId: id,
      normalizedName: player.normalizedName,
      dateOfBirth: player.dateOfBirth,
      nationality: player.nationality,
      position: player.position,
      league: player.league,
      teamName: player.teamName,
      sourceIds: { ...player.sourceIds },
    };
    this.players.set(id, canonical);

    // Update indexes
    const existing = this.nameIndex.get(player.normalizedName) || [];
    existing.push(id);
    this.nameIndex.set(player.normalizedName, existing);

    if (player.league) {
      const leaguePlayers = this.leagueIndex.get(player.league) || [];
      leaguePlayers.push(id);
      this.leagueIndex.set(player.league, leaguePlayers);
    }

    for (const [source, sourceId] of Object.entries(player.sourceIds)) {
      this.sourceIdIndex.set(`${source}:${sourceId}`, id);
    }

    return id;
  }

  async createLink(link: PlayerIdentityLink): Promise<void> {
    this.links.push(link);
    this.sourceIdIndex.set(`${link.sourceName}:${link.sourcePlayerId}`, link.internalPlayerId);
  }

  async recordFlaggedMatch(flag: FlaggedMatch): Promise<void> {
    this.flaggedMatches.push(flag);
    log.info('Flagged match recorded', {
      player: flag.sourcePlayer.fullName,
      reason: flag.reason,
      bestConfidence: flag.bestConfidence,
      candidateCount: flag.candidates.length,
    });
  }

  // ── Test helpers ──

  getLinks(): PlayerIdentityLink[] {
    return [...this.links];
  }

  getFlaggedMatches(): FlaggedMatch[] {
    return [...this.flaggedMatches];
  }

  getPlayer(id: number): CanonicalPlayer | undefined {
    return this.players.get(id);
  }

  getPlayerCount(): number {
    return this.players.size;
  }
}

// ============================================================================
// PostgreSQL Store (production)
// ============================================================================

export class PostgresIdentityStore implements IdentityStore {
  private pool: import('pg').Pool;

  constructor(pool: import('pg').Pool) {
    this.pool = pool;
  }

  async findBySourceId(sourceName: string, sourcePlayerId: string): Promise<CanonicalPlayer | null> {
    const result = await this.pool.query(
      `SELECT p.id, p.normalized_name, p.date_of_birth, p.nationality,
              p.position, l.code as league, p.external_ids
       FROM players p
       JOIN player_identity_links pil ON pil.internal_player_id = p.id
       LEFT JOIN leagues l ON l.id = p.current_league_id
       WHERE pil.source_name = $1 AND pil.source_player_id = $2`,
      [sourceName, sourcePlayerId]
    );
    if (result.rows.length === 0) return null;
    return this.rowToCanonical(result.rows[0]);
  }

  async findByNormalizedName(normalizedName: string): Promise<CanonicalPlayer[]> {
    const result = await this.pool.query(
      `SELECT p.id, p.normalized_name, p.date_of_birth, p.nationality,
              p.position, l.code as league, p.external_ids
       FROM players p
       LEFT JOIN leagues l ON l.id = p.current_league_id
       WHERE p.normalized_name = $1`,
      [normalizedName]
    );
    return result.rows.map(row => this.rowToCanonical(row));
  }

  async findCandidatesByNamePrefix(namePrefix: string): Promise<CanonicalPlayer[]> {
    const result = await this.pool.query(
      `SELECT p.id, p.normalized_name, p.date_of_birth, p.nationality,
              p.position, l.code as league, p.external_ids
       FROM players p
       LEFT JOIN leagues l ON l.id = p.current_league_id
       WHERE p.normalized_name LIKE $1
       LIMIT 50`,
      [`%${namePrefix}%`]
    );
    return result.rows.map(row => this.rowToCanonical(row));
  }

  async findByLeague(leagueCode: string): Promise<CanonicalPlayer[]> {
    const result = await this.pool.query(
      `SELECT p.id, p.normalized_name, p.date_of_birth, p.nationality,
              p.position, l.code as league, p.external_ids
       FROM players p
       JOIN leagues l ON l.id = p.current_league_id
       WHERE l.code = $1
       LIMIT 200`,
      [leagueCode]
    );
    return result.rows.map(row => this.rowToCanonical(row));
  }

  async createPlayer(player: NormalizedPlayer): Promise<number> {
    const posGroup = player.positionGroup
      || (player.position === 'G' ? 'G' : player.position === 'D' ? 'D' : 'F');

    const result = await this.pool.query(
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
    return result.rows[0].id;
  }

  async createLink(link: PlayerIdentityLink): Promise<void> {
    await this.pool.query(
      `INSERT INTO player_identity_links
        (internal_player_id, source_name, source_player_id, confidence, match_method, verified_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (source_name, source_player_id)
       DO UPDATE SET
         internal_player_id = $1,
         confidence = GREATEST(player_identity_links.confidence, $4)`,
      [link.internalPlayerId, link.sourceName, link.sourcePlayerId, link.confidence, link.matchMethod, link.verifiedAt]
    );
  }

  async recordFlaggedMatch(flag: FlaggedMatch): Promise<void> {
    await this.pool.query(
      `INSERT INTO flagged_identity_matches
        (source_name, source_player_id, source_full_name, source_normalized_name,
         source_dob, source_league, candidates, reason, best_confidence, flagged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        flag.sourcePlayer.sourceName,
        flag.sourcePlayer.sourcePlayerId,
        flag.sourcePlayer.fullName,
        flag.sourcePlayer.normalizedName,
        flag.sourcePlayer.dateOfBirth,
        flag.sourcePlayer.league,
        JSON.stringify(flag.candidates),
        flag.reason,
        flag.bestConfidence,
        flag.flaggedAt,
      ]
    );
  }

  private rowToCanonical(row: Record<string, unknown>): CanonicalPlayer {
    return {
      internalId: row.id as number,
      normalizedName: row.normalized_name as string,
      dateOfBirth: row.date_of_birth as string | null,
      nationality: row.nationality as string | null,
      position: row.position as string | null,
      league: row.league as string | null,
      teamName: null,
      sourceIds: (row.external_ids as Record<string, string>) || {},
    };
  }
}
