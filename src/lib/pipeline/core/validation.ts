// ============================================================================
// Validation Layer
// ============================================================================
// Standalone validation functions that can be used by any connector or the
// ETL engine. The BaseConnector has its own validate() that calls these,
// but they can also be used independently.
// ============================================================================

import {
  NormalizedPlayer,
  NormalizedSkaterStats,
  NormalizedGoalieStats,
  ValidationMessage,
} from '../domain/models';

export function validatePlayer(player: NormalizedPlayer): ValidationMessage[] {
  const msgs: ValidationMessage[] = [];

  if (!player.fullName || player.fullName.trim().length < 2) {
    msgs.push({ field: 'fullName', level: 'error', message: 'Player name is required and must be at least 2 characters' });
  }
  if (!player.league) {
    msgs.push({ field: 'league', level: 'error', message: 'League code is required' });
  }
  if (player.age !== null && (player.age < 14 || player.age > 45)) {
    msgs.push({ field: 'age', level: 'warning', message: `Unusual age: ${player.age}` });
  }
  if (player.position && !['C', 'LW', 'RW', 'D', 'G'].includes(player.position)) {
    msgs.push({ field: 'position', level: 'warning', message: `Non-standard position: ${player.position}` });
  }
  if (player.heightCm !== null && (player.heightCm < 150 || player.heightCm > 220)) {
    msgs.push({ field: 'heightCm', level: 'warning', message: `Unusual height: ${player.heightCm}cm` });
  }
  if (player.weightKg !== null && (player.weightKg < 50 || player.weightKg > 140)) {
    msgs.push({ field: 'weightKg', level: 'warning', message: `Unusual weight: ${player.weightKg}kg` });
  }
  if (player.dateOfBirth && !player.dateOfBirth.match(/^\d{4}-\d{2}-\d{2}$/)) {
    msgs.push({ field: 'dateOfBirth', level: 'warning', message: `Non-standard DOB format: ${player.dateOfBirth}` });
  }

  return msgs;
}

export function validateSkaterStats(stats: NormalizedSkaterStats): ValidationMessage[] {
  const msgs: ValidationMessage[] = [];

  if (!stats.season || !stats.season.match(/^\d{4}-\d{2,4}$/)) {
    msgs.push({ field: 'season', level: 'error', message: `Invalid season format: ${stats.season}` });
  }
  if (!stats.league) {
    msgs.push({ field: 'league', level: 'error', message: 'League code is required' });
  }
  if (stats.gamesPlayed < 0) {
    msgs.push({ field: 'gamesPlayed', level: 'error', message: 'Games played cannot be negative' });
  }
  if (stats.goals < 0 || stats.assists < 0 || stats.points < 0) {
    msgs.push({ field: 'points', level: 'error', message: 'Core stats cannot be negative' });
  }
  if (stats.goals + stats.assists !== stats.points) {
    msgs.push({ field: 'points', level: 'warning', message: `G+A (${stats.goals}+${stats.assists}=${stats.goals + stats.assists}) != P (${stats.points})` });
  }
  if (stats.shootingPct !== null && (stats.shootingPct < 0 || stats.shootingPct > 100)) {
    msgs.push({ field: 'shootingPct', level: 'warning', message: `Shooting % out of range: ${stats.shootingPct}` });
  }
  if (stats.faceoffPct !== null && (stats.faceoffPct < 0 || stats.faceoffPct > 100)) {
    msgs.push({ field: 'faceoffPct', level: 'warning', message: `Faceoff % out of range: ${stats.faceoffPct}` });
  }
  if (stats.gamesPlayed > 100) {
    msgs.push({ field: 'gamesPlayed', level: 'warning', message: `Unusually high GP: ${stats.gamesPlayed}` });
  }

  return msgs;
}

export function validateGoalieStats(stats: NormalizedGoalieStats): ValidationMessage[] {
  const msgs: ValidationMessage[] = [];

  if (!stats.season || !stats.season.match(/^\d{4}-\d{2,4}$/)) {
    msgs.push({ field: 'season', level: 'error', message: `Invalid season format: ${stats.season}` });
  }
  if (stats.gamesPlayed < 0) {
    msgs.push({ field: 'gamesPlayed', level: 'error', message: 'Games played cannot be negative' });
  }
  if (stats.savePct !== null && (stats.savePct < 0 || stats.savePct > 1)) {
    msgs.push({ field: 'savePct', level: 'warning', message: `Save % should be 0-1, got: ${stats.savePct}` });
  }
  if (stats.goalsAgainstAvg !== null && stats.goalsAgainstAvg < 0) {
    msgs.push({ field: 'goalsAgainstAvg', level: 'warning', message: `GAA cannot be negative: ${stats.goalsAgainstAvg}` });
  }

  return msgs;
}

/**
 * Run validation on a full batch and annotate each record's dataQuality.
 */
export function validateBatch(data: {
  players: NormalizedPlayer[];
  skaterStats: NormalizedSkaterStats[];
  goalieStats: NormalizedGoalieStats[];
}): {
  players: NormalizedPlayer[];
  skaterStats: NormalizedSkaterStats[];
  goalieStats: NormalizedGoalieStats[];
  allErrors: ValidationMessage[];
} {
  const allErrors: ValidationMessage[] = [];

  for (const player of data.players) {
    const msgs = validatePlayer(player);
    allErrors.push(...msgs);
    player.dataQuality = {
      ...player.dataQuality,
      passedValidation: msgs.filter(m => m.level === 'error').length === 0,
      validationMessages: msgs,
    };
  }

  for (const stat of data.skaterStats) {
    const msgs = validateSkaterStats(stat);
    allErrors.push(...msgs);
    stat.dataQuality = {
      ...stat.dataQuality,
      passedValidation: msgs.filter(m => m.level === 'error').length === 0,
      validationMessages: msgs,
    };
  }

  for (const stat of data.goalieStats) {
    const msgs = validateGoalieStats(stat);
    allErrors.push(...msgs);
    stat.dataQuality = {
      ...stat.dataQuality,
      passedValidation: msgs.filter(m => m.level === 'error').length === 0,
      validationMessages: msgs,
    };
  }

  return { ...data, allErrors };
}
