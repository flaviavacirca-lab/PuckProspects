// ============================================================================
// Pipeline Logger — Structured JSON Logging
// ============================================================================
// Production-ready structured logging for the ingestion pipeline.
// Outputs JSON lines to stdout/stderr for machine parsing by log aggregators.
// Falls back to human-readable format when PIPELINE_LOG_FORMAT=pretty.
//
// Usage:
//   const log = createLogger('MyComponent');
//   log.info('Fetched players', { count: 42, league: 'OHL' });
//
// Output (JSON):
//   {"ts":"2025-03-27T12:00:00.000Z","level":"info","ctx":"MyComponent","msg":"Fetched players","count":42,"league":"OHL"}
//
// Env vars:
//   PIPELINE_LOG_LEVEL  — minimum level: debug, info, warn, error (default: info)
//   PIPELINE_LOG_FORMAT — json | pretty (default: json in production, pretty in dev)
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = (process.env.PIPELINE_LOG_LEVEL as LogLevel) || 'info';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const FORMAT = process.env.PIPELINE_LOG_FORMAT || (IS_PRODUCTION ? 'json' : 'pretty');

export interface LogEntry {
  ts: string;
  level: LogLevel;
  ctx: string;
  msg: string;
  [key: string]: unknown;
}

/** In-memory ring buffer of recent log entries for the admin API */
const LOG_BUFFER_SIZE = 500;
const logBuffer: LogEntry[] = [];

export function getRecentLogs(count = 100, level?: LogLevel): LogEntry[] {
  const filtered = level
    ? logBuffer.filter(e => LOG_LEVELS[e.level] >= LOG_LEVELS[level])
    : logBuffer;
  return filtered.slice(-count);
}

export function createLogger(context: string) {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LEVEL]) return;

    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      ctx: context,
      msg: message,
      ...data,
    };

    // Buffer for admin API
    logBuffer.push(entry);
    if (logBuffer.length > LOG_BUFFER_SIZE) {
      logBuffer.splice(0, logBuffer.length - LOG_BUFFER_SIZE);
    }

    // Output
    if (FORMAT === 'json') {
      const line = JSON.stringify(entry);
      if (level === 'error') {
        process.stderr?.write?.(line + '\n') ?? console.error(line);
      } else {
        process.stdout?.write?.(line + '\n') ?? console.log(line);
      }
    } else {
      // Pretty format for development
      const prefix = levelPrefix(level);
      const dataStr = data && Object.keys(data).length > 0
        ? ' ' + JSON.stringify(data)
        : '';
      const msg = `${prefix} [${context}] ${message}${dataStr}`;
      switch (level) {
        case 'error': console.error(msg); break;
        case 'warn': console.warn(msg); break;
        case 'debug': console.debug(msg); break;
        default: console.log(msg);
      }
    }

    return entry;
  }

  return {
    debug: (msg: string, data?: Record<string, unknown>) => log('debug', msg, data),
    info: (msg: string, data?: Record<string, unknown>) => log('info', msg, data),
    warn: (msg: string, data?: Record<string, unknown>) => log('warn', msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log('error', msg, data),
  };
}

function levelPrefix(level: LogLevel): string {
  switch (level) {
    case 'debug': return '\x1b[90mDBG\x1b[0m';
    case 'info':  return '\x1b[36mINF\x1b[0m';
    case 'warn':  return '\x1b[33mWRN\x1b[0m';
    case 'error': return '\x1b[31mERR\x1b[0m';
  }
}
