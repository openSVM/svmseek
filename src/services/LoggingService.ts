import { devLog, logDebug, logInfo, logWarn, logError } from '../utils/logger';
/**
 * Centralized logging service for error reporting and monitoring
 * Integrates with external services like Sentry in production
 */

export interface ErrorLog {
  id: string;
  timestamp: number;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  error?: Error;
  context?: Record<string, any>;
  component?: string;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  stack?: string;
}

export interface LoggingConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  enableLocalStorage: boolean;
  maxLocalLogs: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  sentryDsn?: string;
  apiEndpoint?: string;
}

class LoggingService {
  private config: LoggingConfig;
  private sessionId: string;
  private logs: ErrorLog[] = [];
  private isInitialized = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: false, // Enable in production
      enableLocalStorage: true,
      maxLocalLogs: 100,
      logLevel: 'error',
      // sentryDsn: process.env.REACT_APP_SENTRY_DSN,
      // apiEndpoint: process.env.REACT_APP_LOGGING_ENDPOINT,
    };
  }

  /**
   * Initialize the logging service
   */
  public async initialize(config?: Partial<LoggingConfig>): Promise<void> {
    if (this.isInitialized) return;

    this.config = { ...this.config, ...config };

    // Initialize Sentry in production
    if (this.config.enableRemoteLogging && this.config.sentryDsn) {
      await this.initializeSentry();
    }

    // Load existing logs from localStorage
    if (this.config.enableLocalStorage) {
      this.loadLogsFromStorage();
    }

    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    this.isInitialized = true;
    this.info('Logging service initialized', { config: this.config });
  }

  /**
   * Log an error
   */
  public error(message: string, error?: Error, context?: Record<string, any>, component?: string): void {
    this.log('error', message, error, context, component);
  }

  /**
   * Log a warning
   */
  public warn(message: string, context?: Record<string, any>, component?: string): void {
    this.log('warn', message, undefined, context, component);
  }

  /**
   * Log an info message
   */
  public info(message: string, context?: Record<string, any>, component?: string): void {
    this.log('info', message, undefined, context, component);
  }

  /**
   * Log a debug message
   */
  public debug(message: string, context?: Record<string, any>, component?: string): void {
    this.log('debug', message, undefined, context, component);
  }

  /**
   * Log a React error boundary error
   */
  public logComponentError(error: Error, errorInfo: any, component: string): void {
    this.error(
      `Component error in ${component}`,
      error,
      {
        errorInfo,
        componentStack: errorInfo.componentStack,
      },
      component
    );
  }

  /**
   * Log a network/API error
   */
  public logNetworkError(url: string, error: Error, context?: Record<string, any>): void {
    this.error(
      `Network error: ${url}`,
      error,
      {
        url,
        ...context,
      },
      'NetworkError'
    );
  }

  /**
   * Log a wallet operation error
   */
  public logWalletError(operation: string, error: Error, context?: Record<string, any>): void {
    this.error(
      `Wallet error: ${operation}`,
      error,
      {
        operation,
        ...context,
      },
      'WalletError'
    );
  }

  /**
   * Get recent logs
   */
  public getRecentLogs(count: number = 50): ErrorLog[] {
    return this.logs.slice(-count);
  }

  /**
   * Get logs by level
   */
  public getLogsByLevel(level: ErrorLog['level']): ErrorLog[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs = [];
    if (this.config.enableLocalStorage) {
      localStorage.removeItem('svmseek_logs');
    }
  }

  /**
   * Export logs for debugging
   */
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Core logging method
   */
  private log(
    level: ErrorLog['level'],
    message: string,
    error?: Error,
    context?: Record<string, any>,
    component?: string
  ): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) return;

    const logEntry: ErrorLog = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level,
      message,
      error,
      context,
      component,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error?.stack,
    };

    // Add to local logs
    this.logs.push(logEntry);

    // Maintain log size limit
    if (this.logs.length > this.config.maxLocalLogs) {
      this.logs = this.logs.slice(-this.config.maxLocalLogs);
    }

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(logEntry);
    }

    // Local storage
    if (this.config.enableLocalStorage) {
      this.saveLogsToStorage();
    }

    // Remote logging
    if (this.config.enableRemoteLogging) {
      this.sendToRemote(logEntry);
    }
  }

  /**
   * Check if we should log this level
   */
  private shouldLog(level: ErrorLog['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log to console with appropriate styling
   */
  private logToConsole(log: ErrorLog): void {
    const timestamp = new Date(log.timestamp).toISOString();
    const prefix = `[${timestamp}] [${log.level.toUpperCase()}] ${log.component || 'App'}:`;

    switch (log.level) {
      case 'error':
        logError(prefix, log.message, log.error, log.context);
        break;
      case 'warn':
        logWarn(prefix, log.message, log.context);
        break;
      case 'info':
        logInfo(prefix, log.message, log.context);
        break;
      case 'debug':
        logDebug(prefix, log.message, log.context);
        break;
    }
  }

  /**
   * Save logs to localStorage
   */
  private saveLogsToStorage(): void {
    try {
      const recentLogs = this.logs.slice(-this.config.maxLocalLogs);
      localStorage.setItem('svmseek_logs', JSON.stringify(recentLogs));
    } catch (error) {
      logError('Failed to save logs to localStorage:', error);
    }
  }

  /**
   * Load logs from localStorage
   */
  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem('svmseek_logs');
      if (stored) {
        const logs = JSON.parse(stored) as ErrorLog[];
        this.logs = logs.filter(log => 
          log.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000 // Keep logs for 7 days
        );
      }
    } catch (error) {
      logError('Failed to load logs from localStorage:', error);
    }
  }

  /**
   * Send log to remote service
   */
  private async sendToRemote(log: ErrorLog): Promise<void> {
    if (!this.config.apiEndpoint) return;

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...log,
          // Don't send the full error object to avoid circular references
          error: log.error ? {
            name: log.error.name,
            message: log.error.message,
            stack: log.error.stack,
          } : undefined,
        }),
      });
    } catch (error) {
      logError('Failed to send log to remote service:', error);
    }
  }

  /**
   * Initialize Sentry for error tracking
   */
  private async initializeSentry(): Promise<void> {
    try {
      // This would require installing @sentry/react
      // For now, we'll just log that Sentry would be initialized
      logInfo('Sentry would be initialized here with DSN:', this.config.sentryDsn);
      
      /*
      // Example Sentry initialization:
      const Sentry = await import('@sentry/react');
      
      Sentry.init({
        dsn: this.config.sentryDsn,
        environment: process.env.NODE_ENV,
        integrations: [
          new Sentry.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
        beforeSend(event, hint) {
          // Filter sensitive data
          return event;
        },
      });
      */
    } catch (error) {
      logError('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error(
        'Unhandled promise rejection',
        new Error(event.reason),
        { reason: event.reason },
        'GlobalHandler'
      );
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.error(
        'Global JavaScript error',
        event.error || new Error(event.message),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        'GlobalHandler'
      );
    });
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const loggingService = new LoggingService();

// Initialize with default config
loggingService.initialize();

export default loggingService;