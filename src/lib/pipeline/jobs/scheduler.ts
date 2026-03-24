// ============================================================================
// Job Scheduler
// ============================================================================
// Simple interval-based scheduler for running ingestion jobs.
// For production, replace with a proper job queue (BullMQ, pg-boss, etc.)
//
// Usage:
//   npx tsx src/lib/pipeline/jobs/scheduler.ts
// ============================================================================

import { getIngestionService } from '../services/ingestion-service';
import { getPipelineConfig } from '../config';
import { createLogger } from '../core/logger';
import '../connectors/registry';

const log = createLogger('Scheduler');

/**
 * Parse a simple cron expression and return the interval in milliseconds.
 * Only supports the subset we need: "0 * /N * * *" (every N hours).
 * For production, use a real cron library (node-cron, croner, etc.)
 */
function cronToIntervalMs(cron: string): number {
  // "0 */6 * * *" → every 6 hours
  const hourMatch = cron.match(/\*\/(\d+)/);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60 * 60 * 1000;
  }
  // Default: every 6 hours
  return 6 * 60 * 60 * 1000;
}

async function runScheduledIngestion() {
  const service = getIngestionService();
  log.info('Scheduled ingestion starting...');
  try {
    const results = await service.ingestAll();
    const succeeded = results.filter(r => r.run.status === 'success').length;
    const failed = results.filter(r => r.run.status === 'failed').length;
    log.info(`Scheduled ingestion complete: ${succeeded} ok, ${failed} failed`);
  } catch (err) {
    log.error('Scheduled ingestion failed', { error: String(err) });
  }
}

async function main() {
  const config = getPipelineConfig();
  const intervalMs = cronToIntervalMs(config.cronSchedule);

  log.info(`Scheduler started. Interval: ${intervalMs / 1000 / 60} minutes`);
  log.info(`Cron expression: ${config.cronSchedule}`);

  // Run immediately on startup
  await runScheduledIngestion();

  // Then run on interval
  setInterval(runScheduledIngestion, intervalMs);

  // Keep process alive
  log.info('Scheduler running. Press Ctrl+C to stop.');
}

main().catch(err => {
  log.error('Scheduler failed to start', { error: String(err) });
  process.exit(1);
});
