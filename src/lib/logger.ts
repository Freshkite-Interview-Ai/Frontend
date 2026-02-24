type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV !== 'production';

const shouldLog = (level: LogLevel): boolean => {
  if (isDevelopment) return true;
  return level === 'warn' || level === 'error';
};

const formatMessage = (scope: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${scope}] ${message}`;
};

export const logger = {
  debug(scope: string, message: string, meta?: unknown) {
    if (!shouldLog('debug')) return;
    console.debug(formatMessage(scope, message), meta ?? '');
  },
  info(scope: string, message: string, meta?: unknown) {
    if (!shouldLog('info')) return;
    console.info(formatMessage(scope, message), meta ?? '');
  },
  warn(scope: string, message: string, meta?: unknown) {
    if (!shouldLog('warn')) return;
    console.warn(formatMessage(scope, message), meta ?? '');
  },
  error(scope: string, message: string, meta?: unknown) {
    if (!shouldLog('error')) return;
    console.error(formatMessage(scope, message), meta ?? '');
  },
};

export default logger;
