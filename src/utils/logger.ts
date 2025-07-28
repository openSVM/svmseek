/**
 * Production-safe logging utility
 * Automatically disables console logs in production builds
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.level = this.isProduction ? LogLevel.ERROR : LogLevel.DEBUG;
  }

  error(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.ERROR) {
      console.error(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.WARN) {
      console.warn(message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.INFO) {
      console.info(message, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.level >= LogLevel.DEBUG) {
      console.log(message, ...args);
    }
  }

  // Safe logging for production - only shows in development
  devLog(message: string, ...args: any[]): void {
    if (!this.isProduction) {
      console.log(message, ...args);
    }
  }

  // Force log even in production (for critical errors)
  forceLog(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
}

export const logger = new Logger();

// Convenience functions
export const logError = (message: string, ...args: any[]) => logger.error(message, ...args);
export const logWarn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const logInfo = (message: string, ...args: any[]) => logger.info(message, ...args);
export const logDebug = (message: string, ...args: any[]) => logger.debug(message, ...args);
export const devLog = (message: string, ...args: any[]) => logger.devLog(message, ...args);