// ============================================================================
// Pipeline Logger
// ============================================================================
// Structured logging for the ingestion pipeline. Uses console for now but
// can be swapped for a structured logger (pino, winston) later.
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL = (process.env.PIPELINE_LOG_LEVEL as LogLevel) || 'info';

export function createLogger(context: string) {
  function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LEVEL]) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      ...data,
    };

    switch (level) {
      case 'error':
        console.error(`[${context}]`, message, data ? JSON.stringify(data) : '');
        break;
      case 'warn':
        console.warn(`[${context}]`, message, data ? JSON.stringify(data) : '');
        break;
      case 'debug':
        console.debug(`[${context}]`, message, data ? JSON.stringify(data) : '');
        break;
      default:
        console.log(`[${context}]`, message, data ? JSON.stringify(data) : '');
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
