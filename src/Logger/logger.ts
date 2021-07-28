import { CURR_LOG_LEVEL, LOG_LEVEL } from '../constants';

/**
 * Writes a message to the log if the _logLevel_ meets or exceeds the current logLevel
 * @param source Source of function writing this log
 * @param logLevel Severity of this log
 * @param msg Message(s) to log
 */
export const Log = (source: string, logLevel = 1, ...msg: unknown[]): void => {
  if (logLevel <= CURR_LOG_LEVEL) {
    source = source.padEnd(17);
    const date = new Date().toISOString();

    if (logLevel === LOG_LEVEL.DEBUG) {
      console.debug(date, `[${source}]`, ...msg);
    } else if (logLevel === LOG_LEVEL.ERR) {
      console.error(date, `[${source}]`, ...msg);
    } else {
      console.log(date, `[${source}]`, ...msg);
    }
  }
};
