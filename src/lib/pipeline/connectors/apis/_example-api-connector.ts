// ============================================================================
// Example API Connector (Template)
// ============================================================================
// Copy this file and rename it to create a new API-based connector.
// This example shows the structure for an API that returns JSON.
//
// Steps:
// 1. Copy this file, rename to your-connector.ts
// 2. Update the descriptor, fetch, parse, and normalize methods
// 3. Register in connectors/registry.ts
// 4. Add config to config/sources.ts
// 5. Enable the source and run the pipeline
// ============================================================================

import { BaseConnector, FetchResult, ParsedRecord } from '../base';
import {
  SourceDescriptor,
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
} from '../../domain/models';
import {
  normalizeName,
  splitName,
  normalizePosition,
  normalizeNationality,
  normalizeSeason,
  safeInt,
  safeFloat,
  todaySnapshot,
  createDefaultQuality,
  createEmptyPlayer,
  createEmptySkaterStats,
} from '../../core/normalization';
// import { registry } from '../registry';

export class ExampleApiConnector extends BaseConnector {
  readonly descriptor: SourceDescriptor = {
    sourceName: 'example_api',
    sourceType: 'api',
    sourceUrl: 'https://api.example.com/v1/stats',
    league: 'ahl',                // Which league this connector serves
    ingestionCadence: 'daily',
    knownLimitations: [
      'Requires API key',
      'Rate limited to 60 req/min',
      'Only returns current season data',
    ],
    fieldCoverage: {
      hasBasicStats: true,
      hasPlusMinus: true,
      hasSpecialTeams: true,
      hasShots: true,
      hasFaceoffs: false,
      hasIceTime: true,
      hasHitsBlocks: false,
      hasGoalieStats: true,
      hasBiographicalData: true,
      hasDraftInfo: false,
      hasNhlAffiliation: true,
    },
  };

  async fetch(): Promise<FetchResult[]> {
    // TODO: Replace with actual API endpoint
    const apiKey = process.env.EXAMPLE_API_KEY;
    if (!apiKey) throw new Error('EXAMPLE_API_KEY not configured');

    const data = await this.fetchJson<{ players: unknown[] }>(
      `${this.descriptor.sourceUrl}?season=2025-26`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );

    if (!data) throw new Error('API returned no data');

    return [{
      rawBody: JSON.stringify(data),
      contentType: 'json',
      httpStatus: 200,
      url: this.descriptor.sourceUrl,
      fetchedAt: new Date(),
    }];
  }

  async parse(raw: FetchResult[]): Promise<ParsedRecord[]> {
    const records: ParsedRecord[] = [];

    for (const fetchResult of raw) {
      const data = JSON.parse(fetchResult.rawBody);
      const players = data.players || [];

      for (const p of players) {
        records.push({
          sourcePlayerId: String(p.id),
          recordType: p.position === 'G' ? 'goalie' : 'skater',
          fields: p, // Pass the raw API object through
        });
      }
    }

    return records;
  }

  async normalize(parsed: ParsedRecord[]): Promise<{
    players: NormalizedPlayer[];
    skaterStats: NormalizedSkaterStats[];
    goalieStats: NormalizedGoalieStats[];
  }> {
    const players: NormalizedPlayer[] = [];
    const skaterStats: NormalizedSkaterStats[] = [];
    const goalieStats: NormalizedGoalieStats[] = [];
    const snapshot = todaySnapshot();

    for (const record of parsed) {
      const f = record.fields as Record<string, unknown>;

      // TODO: Map your API's field names to NormalizedPlayer
      const fullName = `${f.firstName} ${f.lastName}`;
      const player = createEmptyPlayer(this.descriptor.sourceName, this.descriptor.league);
      player.firstName = f.firstName as string || '';
      player.lastName = f.lastName as string || '';
      player.fullName = fullName;
      player.normalizedName = normalizeName(fullName);
      player.sourceIds[this.descriptor.sourceName] = record.sourcePlayerId;
      player.position = normalizePosition(f.position as string);
      player.positionGroup = this.getPositionGroup(player.position);
      player.nationality = normalizeNationality(f.nationality as string);
      player.teamName = f.team as string || null;
      player.snapshotDate = snapshot;
      player.dataQuality = createDefaultQuality();

      players.push(player);

      // TODO: Map your API's stat fields
      if (record.recordType === 'skater') {
        const stat = createEmptySkaterStats(this.descriptor.sourceName, this.descriptor.league, '2025-26');
        stat.gamesPlayed = safeInt(f.gp) || 0;
        stat.goals = safeInt(f.g) || 0;
        stat.assists = safeInt(f.a) || 0;
        stat.points = stat.goals + stat.assists;
        stat.pointsPerGame = stat.gamesPlayed > 0 ? stat.points / stat.gamesPlayed : 0;
        stat.plusMinus = safeInt(f.plusMinus);
        stat.penaltyMinutes = safeInt(f.pim);
        stat.shots = safeInt(f.sog);
        stat.ppGoals = safeInt(f.ppg);
        stat.ppAssists = safeInt(f.ppa);
        stat.snapshotDate = snapshot;
        stat.rawPayload = f;
        stat.dataQuality = createDefaultQuality();

        skaterStats.push(stat);
      }
    }

    return { players, skaterStats, goalieStats };
  }
}

// --- Registration ---
// Uncomment to register:
// registry.register('example_api', () => new ExampleApiConnector());
