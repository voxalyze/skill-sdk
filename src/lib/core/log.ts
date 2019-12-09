/**
 * Prefix for console log output
 */
const PREFIX = '[VoxalyzeSDK]';

export default {
  /**
   * Error logger
   */
  error: (message: string) => console.error(`${PREFIX}[ERROR] ${message}`),

  /**
   * Warning logger
   */
  warn: (message: string) => console.warn(`${PREFIX}[WARN] ${message}`),
};
