// ============================================================================
// Player Identity Resolver
// ============================================================================
// Orchestrates the identity resolution workflow: given a normalized player
// record from any source, determine whether it represents a known player
// or a new one. Uses a cascade of strategies from high to low confidence,
// and flags uncertain matches for human review.
//
// Resolution cascade:
//   1. Source ID lookup (exact, highest confidence)
//   2. Exact normalized name + DOB
//   3. Fuzzy name + DOB match (uses Levenshtein/Dice from matching.ts)
//   4. Fuzzy name + secondary signals (nationality, position, team, league)
//   5. Name-only match (lowest confidence, always flagged)
//
// Actions:
//   - 'link'  → auto-link to existing player (confidence >= 0.85)
//   - 'flag'  → uncertain match, needs human review (0.60 <= confidence < 0.85)
//   - 'create' → no match found, create new canonical player
// ============================================================================

import { NormalizedPlayer, PlayerIdentityLink } from '../domain/models';
import {
  scoreMatch,
  normalizeForMatching,
  compareNames,
  MatchResult,
} from './matching';
import { createLogger } from '../core/logger';

const log = createLogger('IdentityResolver');

// ── Types ──

export interface CanonicalPlayer {
  internalId: number;
  normalizedName: string;
  dateOfBirth: string | null;
  nationality: string | null;
  position: string | null;
  league: string | null;
  teamName: string | null;
  sourceIds: Record<string, string>;
}

export interface ResolvedIdentity {
  /** What to do with this player record */
  action: 'link' | 'flag' | 'create';
  /** Internal player ID (set for 'link' and 'flag', null for 'create') */
  internalPlayerId: number | null;
  /** Match confidence 0.0–1.0 */
  confidence: number;
  /** How the match was determined */
  method: PlayerIdentityLink['matchMethod'];
  /** Full match details for logging */
  matchDetails: MatchResult | null;
  /** Competing candidates when ambiguous */
  candidates: CandidateMatch[];
}

export interface CandidateMatch {
  internalId: number;
  normalizedName: string;
  confidence: number;
  method: string;
}

export interface FlaggedMatch {
  /** The incoming player record */
  sourcePlayer: {
    sourceName: string;
    sourcePlayerId: string;
    fullName: string;
    normalizedName: string;
    dateOfBirth: string | null;
    league: string;
  };
  /** The best matching existing player(s) */
  candidates: CandidateMatch[];
  /** Why it was flagged */
  reason: 'ambiguous_match' | 'low_confidence' | 'multiple_candidates' | 'dob_mismatch';
  /** The highest confidence seen */
  bestConfidence: number;
  /** Timestamp */
  flaggedAt: Date;
}

// ── Storage interfaces (injectable for DB vs in-memory) ──

export interface IdentityStore {
  /** Look up a player by a source-specific ID */
  findBySourceId(sourceName: string, sourcePlayerId: string): Promise<CanonicalPlayer | null>;
  /** Look up players by exact normalized name */
  findByNormalizedName(normalizedName: string): Promise<CanonicalPlayer[]>;
  /** Look up players by name similarity (prefix/contains) for fuzzy search */
  findCandidatesByNamePrefix(namePrefix: string): Promise<CanonicalPlayer[]>;
  /** Get all players in a league (for broad fuzzy matching) */
  findByLeague(leagueCode: string): Promise<CanonicalPlayer[]>;
  /** Create a new canonical player and return the ID */
  createPlayer(player: NormalizedPlayer): Promise<number>;
  /** Link a source ID to a canonical player */
  createLink(link: PlayerIdentityLink): Promise<void>;
  /** Record a flagged match for review */
  recordFlaggedMatch(flag: FlaggedMatch): Promise<void>;
}

// ── Resolver ──

export class PlayerIdentityResolver {
  constructor(private store: IdentityStore) {}

  /**
   * Resolve a single player record: find existing match or determine it's new.
   */
  async resolve(player: NormalizedPlayer): Promise<ResolvedIdentity> {
    // Strategy 1: Source ID lookup (highest confidence)
    for (const [source, sourceId] of Object.entries(player.sourceIds)) {
      const existing = await this.store.findBySourceId(source, sourceId);
      if (existing) {
        log.debug('Matched by source ID', {
          name: player.fullName,
          source,
          sourceId,
          internalId: existing.internalId,
        });
        return {
          action: 'link',
          internalPlayerId: existing.internalId,
          confidence: 1.0,
          method: 'source_id',
          matchDetails: null,
          candidates: [{
            internalId: existing.internalId,
            normalizedName: existing.normalizedName,
            confidence: 1.0,
            method: 'source_id',
          }],
        };
      }
    }

    // Strategy 2-4: Name-based matching
    // Gather candidates from multiple sources
    const candidates = await this.gatherCandidates(player);

    if (candidates.length === 0) {
      log.debug('No candidates found, creating new player', { name: player.fullName });
      return {
        action: 'create',
        internalPlayerId: null,
        confidence: 0,
        method: 'exact_name_dob',
        matchDetails: null,
        candidates: [],
      };
    }

    // Score all candidates
    const scored = candidates.map(candidate => {
      const matchResult = scoreMatch(
        {
          normalizedName: player.normalizedName,
          dateOfBirth: player.dateOfBirth,
          nationality: player.nationality,
          position: player.position,
          league: player.league,
          teamName: player.teamName,
        },
        {
          normalizedName: candidate.normalizedName,
          dateOfBirth: candidate.dateOfBirth,
          nationality: candidate.nationality,
          position: candidate.position,
          league: candidate.league,
          teamName: candidate.teamName,
        }
      );
      return { candidate, matchResult };
    });

    // Sort by confidence descending
    scored.sort((a, b) => b.matchResult.confidence - a.matchResult.confidence);

    const best = scored[0];
    const secondBest = scored.length > 1 ? scored[1] : null;

    // Check for ambiguity: two candidates with similar confidence
    const isAmbiguous = secondBest
      && secondBest.matchResult.confidence >= 0.60
      && (best.matchResult.confidence - secondBest.matchResult.confidence) < 0.10;

    const candidateMatches: CandidateMatch[] = scored
      .filter(s => s.matchResult.confidence >= 0.50)
      .slice(0, 5)
      .map(s => ({
        internalId: s.candidate.internalId,
        normalizedName: s.candidate.normalizedName,
        confidence: s.matchResult.confidence,
        method: s.matchResult.method,
      }));

    // Determine action
    if (best.matchResult.action === 'link' && !isAmbiguous) {
      // High confidence, unambiguous → auto-link
      log.debug('Auto-linking', {
        name: player.fullName,
        internalId: best.candidate.internalId,
        confidence: best.matchResult.confidence,
        method: best.matchResult.method,
      });
      return {
        action: 'link',
        internalPlayerId: best.candidate.internalId,
        confidence: best.matchResult.confidence,
        method: this.toMatchMethod(best.matchResult.method),
        matchDetails: best.matchResult,
        candidates: candidateMatches,
      };
    }

    if (best.matchResult.action === 'flag' || isAmbiguous) {
      // Uncertain → flag for review
      const reason = isAmbiguous
        ? 'multiple_candidates' as const
        : best.matchResult.signals.dobScore === 0 && !!player.dateOfBirth
          ? 'dob_mismatch' as const
          : 'low_confidence' as const;

      log.info('Flagging uncertain match', {
        name: player.fullName,
        bestMatch: best.candidate.normalizedName,
        confidence: best.matchResult.confidence,
        reason,
      });

      // Record the flag
      await this.store.recordFlaggedMatch({
        sourcePlayer: {
          sourceName: player.sourceName,
          sourcePlayerId: Object.values(player.sourceIds)[0] || '',
          fullName: player.fullName,
          normalizedName: player.normalizedName,
          dateOfBirth: player.dateOfBirth,
          league: player.league,
        },
        candidates: candidateMatches,
        reason,
        bestConfidence: best.matchResult.confidence,
        flaggedAt: new Date(),
      });

      return {
        action: 'flag',
        internalPlayerId: best.candidate.internalId,
        confidence: best.matchResult.confidence,
        method: this.toMatchMethod(best.matchResult.method),
        matchDetails: best.matchResult,
        candidates: candidateMatches,
      };
    }

    // No match strong enough → create new player
    log.debug('No strong match, creating new player', {
      name: player.fullName,
      bestConfidence: best.matchResult.confidence,
    });
    return {
      action: 'create',
      internalPlayerId: null,
      confidence: 0,
      method: 'exact_name_dob',
      matchDetails: null,
      candidates: candidateMatches,
    };
  }

  /**
   * Process a resolved identity: create/link the player and return the internal ID.
   */
  async processResolution(
    player: NormalizedPlayer,
    resolution: ResolvedIdentity
  ): Promise<number> {
    if (resolution.action === 'link' && resolution.internalPlayerId !== null) {
      // Link source IDs to the existing player
      for (const [source, sourceId] of Object.entries(player.sourceIds)) {
        await this.store.createLink({
          internalPlayerId: resolution.internalPlayerId,
          sourceName: source,
          sourcePlayerId: sourceId,
          confidence: resolution.confidence,
          matchMethod: resolution.method,
          createdAt: new Date(),
          verifiedAt: null,
        });
      }
      return resolution.internalPlayerId;
    }

    if (resolution.action === 'flag' && resolution.internalPlayerId !== null) {
      // For flagged matches, still link but with lower confidence
      // The flag record is already stored for review
      for (const [source, sourceId] of Object.entries(player.sourceIds)) {
        await this.store.createLink({
          internalPlayerId: resolution.internalPlayerId,
          sourceName: source,
          sourcePlayerId: sourceId,
          confidence: resolution.confidence,
          matchMethod: resolution.method,
          createdAt: new Date(),
          verifiedAt: null,
        });
      }
      return resolution.internalPlayerId;
    }

    // Create new player
    const newId = await this.store.createPlayer(player);
    for (const [source, sourceId] of Object.entries(player.sourceIds)) {
      await this.store.createLink({
        internalPlayerId: newId,
        sourceName: source,
        sourcePlayerId: sourceId,
        confidence: 1.0,
        matchMethod: 'source_id',
        createdAt: new Date(),
        verifiedAt: new Date(), // Self-link is verified
      });
    }
    return newId;
  }

  /**
   * Resolve and process in one step. Convenience method for the pipeline.
   */
  async resolveAndLink(player: NormalizedPlayer): Promise<{
    internalId: number;
    resolution: ResolvedIdentity;
  }> {
    const resolution = await this.resolve(player);
    const internalId = await this.processResolution(player, resolution);
    return { internalId, resolution };
  }

  // ── Private helpers ──

  private async gatherCandidates(player: NormalizedPlayer): Promise<CanonicalPlayer[]> {
    const seen = new Set<number>();
    const candidates: CanonicalPlayer[] = [];

    const add = (players: CanonicalPlayer[]) => {
      for (const p of players) {
        if (!seen.has(p.internalId)) {
          seen.add(p.internalId);
          candidates.push(p);
        }
      }
    };

    // Exact name match
    if (player.normalizedName) {
      add(await this.store.findByNormalizedName(player.normalizedName));
    }

    // Prefix match (first 4 chars of last name)
    const parts = player.normalizedName.split(/\s+/);
    const lastNamePart = parts[parts.length - 1];
    if (lastNamePart && lastNamePart.length >= 3) {
      add(await this.store.findCandidatesByNamePrefix(lastNamePart.slice(0, 4)));
    }

    // Same league candidates (for finding transferred players)
    if (player.league) {
      add(await this.store.findByLeague(player.league));
    }

    return candidates;
  }

  private toMatchMethod(method: string): PlayerIdentityLink['matchMethod'] {
    switch (method) {
      case 'exact': return 'exact_name_dob';
      case 'exact_last_fuzzy_first': return 'fuzzy_name_dob';
      case 'initial_match': return 'fuzzy_name_dob';
      case 'reversed_order': return 'fuzzy_name_dob';
      case 'levenshtein': return 'fuzzy_name_dob';
      case 'dice': return 'fuzzy_name_dob';
      case 'source_id': return 'source_id';
      case 'exact_name_dob': return 'exact_name_dob';
      case 'fuzzy_name_dob': return 'fuzzy_name_dob';
      case 'exact_name_signals': return 'exact_name_dob';
      case 'fuzzy_name_signals': return 'fuzzy_name_dob';
      default: return 'fuzzy_name_dob';
    }
  }
}
