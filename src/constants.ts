/** Severity of logging types */
export enum LOG_LEVEL {
  ERR, /// Only log errors
  INFO, /// Log errors and info
  DEBUG, /// Log everything
}

/** @type {number} Severity of current logging functionality */
export const CURR_LOG_LEVEL: number = LOG_LEVEL.DEBUG;
