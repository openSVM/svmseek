/**
 * Global error handler for runtime errors and wallet conflicts
 * Provides comprehensive error catching and user-friendly error recovery
 */

import { logError, logWarn } from './logger';
import { safeEventListenerUtility } from './SafeEventListenerUtility';

export interface ErrorHandlerConfig {
  enableRecovery: boolean;
  enableLogging: boolean;
  enableUserNotification: boolean;
}

export class GlobalErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCounts: Map<string, number> = new Map();
  private maxErrorsPerType = 5;

  // Logging throttling mechanism with cleanup
  private logThrottleMap: Map<string, number> = new Map();
  private readonly LOG_THROTTLE_WINDOW_MS = 60000; // 1 minute
  private readonly MAX_LOGS_PER_WINDOW = 10;
  private cleanupInterval: NodeJS.Timeout | null = null;

  // Track applied patches to prevent double-patching
  private patchesApplied = new Set<string>();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableRecovery: true,
      enableLogging: true,
      enableUserNotification: true,
      ...config
    };
  }

  /**
   * Initialize global error handling
   */
  public initialize(): void {
    // Prevent double-initialization
    if (this.patchesApplied.has('initialized')) {
      logWarn('GlobalErrorHandler: Already initialized, skipping');
      return;
    }

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event);
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });

    // Add protection for common null access patterns
    this.addNullAccessProtection();

    // Add wallet extension conflict protection
    this.addWalletConflictProtection();

    // Start cleanup interval for memory management
    this.startCleanupInterval();

    this.patchesApplied.add('initialized');

    if (this.config.enableLogging) {
      logWarn('GlobalErrorHandler: Error handling initialized');
    }
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    const errorMessage = error?.message || String(error);

    // Track error frequency
    this.incrementErrorCount('unhandled_rejection');

    if (this.config.enableLogging) {
      logError('Unhandled promise rejection:', error);
    }

    // Handle specific error types
    if (this.isKnownRecoverableError(errorMessage)) {
      if (this.config.enableRecovery) {
        event.preventDefault(); // Prevent console logging
        this.attemptRecovery(errorMessage, 'promise_rejection');
      }
    }
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(event: ErrorEvent): void {
    const error = event.error;
    const errorMessage = error?.message || event.message;

    // Track error frequency
    this.incrementErrorCount('global_error');

    if (this.config.enableLogging) {
      logError('Global error caught:', {
        message: errorMessage,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error
      });
    }

    // Handle specific error patterns
    if (this.isKnownRecoverableError(errorMessage)) {
      if (this.config.enableRecovery) {
        event.preventDefault(); // Prevent default error handling
        this.attemptRecovery(errorMessage, 'global_error');
        return;
      }
    }

    // Handle wallet-related errors specifically
    if (this.isWalletConflictError(errorMessage)) {
      this.handleWalletConflictError(errorMessage);
      event.preventDefault();
      return;
    }
  }

  /**
   * Add protection for common null access patterns
   *
   * MONKEY-PATCH WARNING: This method modifies the global EventTarget.prototype.addEventListener
   * to add defensive null-checking around event listeners. This is necessary because third-party
   * wallet extensions and other libraries often assume event.data is always defined, which
   * causes runtime crashes when it's null.
   *
   * The original addEventListener is preserved and wrapped with a safe proxy that:
   * 1. Validates event objects before passing to listeners
   * 2. Checks if event.data exists for data-dependent events
   * 3. Catches and logs null property access errors without crashing the app
   *
   * Impact: All new event listeners will be automatically wrapped with this protection.
   * Existing listeners are not affected. Performance impact is minimal as the wrapper
   * only adds basic null checks.
   *
   * @onboarding For new developers: This is a defensive programming pattern to handle
   * the reality of inconsistent third-party wallet extension behavior. While not ideal,
   * it prevents the entire application from crashing due to external library bugs.
   */
  /**
   * Add protection for common null access patterns using SafeEventListenerUtility
   *
   * This method enables global safe event listeners as an opt-in compatibility layer
   * for wallet extension environments. The SafeEventListenerUtility provides better
   * encapsulation and control compared to direct monkey-patching.
   *
   * @onboarding For new developers: This is a defensive programming pattern to handle
   * third-party wallet extension compatibility issues. The SafeEventListenerUtility
   * can be disabled if not needed and provides cleaner separation of concerns.
   */
  private addNullAccessProtection(): void {
    // Use the safer utility instead of direct monkey-patching
    safeEventListenerUtility.enableSafeListeners();

    if (this.config.enableLogging) {
      logWarn('GlobalErrorHandler: Null access protection enabled via SafeEventListenerUtility');
    }
  }

  /**
   * Add wallet extension conflict protection
   */
  private addWalletConflictProtection(): void {
    // Prevent double-patching
    if (this.patchesApplied.has('wallet_conflict_protection')) {
      return;
    }

    // Monitor for ethereum property conflicts
    let ethereumConflictDetected = false;

    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj: any, prop: string, descriptor: PropertyDescriptor) {
      if (obj === window && prop === 'ethereum' && !ethereumConflictDetected) {
        try {
          const existingDescriptor = Object.getOwnPropertyDescriptor(window, 'ethereum');
          if (existingDescriptor && !existingDescriptor.configurable) {
            ethereumConflictDetected = true;
            logWarn('Ethereum property conflict detected and resolved');
            return obj; // Skip redefinition
          }
        } catch (error: any) {
          ethereumConflictDetected = true;
          logWarn('Ethereum property conflict prevented:', error?.message || error);
          return obj;
        }
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    };
    
    this.patchesApplied.add('wallet_conflict_protection');
  }

  /**
   * Check if error is a known recoverable error
   */
  private isKnownRecoverableError(errorMessage: string): boolean {
    const recoverablePatterns = [
      'Cannot read properties of null (reading \'type\')',
      'Cannot read properties of undefined (reading \'type\')',
      'event.data is null',
      'event.data is undefined',
      'data.type is not a function',
      'Cannot read property \'type\' of null',
      'Cannot read property \'type\' of undefined'
    ];

    return recoverablePatterns.some(pattern =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Check if error is wallet-related
   */
  private isWalletConflictError(errorMessage: string): boolean {
    const walletPatterns = [
      'Cannot redefine property: ethereum',
      'ethereum provider',
      'metamask',
      'wallet adapter',
      'phantom',
      'solflare'
    ];

    return walletPatterns.some(pattern =>
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Attempt to recover from known errors
   */
  private attemptRecovery(errorMessage: string, errorType: string): void {
    const errorCount = this.errorCounts.get(errorType) || 0;

    if (errorCount > this.maxErrorsPerType) {
      if (this.shouldLog(errorType)) {
        logError('Too many errors of type:', errorType, 'stopping recovery attempts');
      }
      return;
    }

    if (this.config.enableLogging && this.shouldLog(errorType)) {
      logWarn(`Attempting recovery for ${errorType}:`, errorMessage);
    }

    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('svmseek-error-recovery', {
      detail: {
        errorMessage,
        errorType,
        errorCount
      }
    }));
  }

  /**
   * Handle wallet conflict errors
   */
  private handleWalletConflictError(errorMessage: string): void {
    if (this.config.enableLogging) {
      logWarn('Wallet conflict detected:', errorMessage);
    }

    // Dispatch wallet conflict event
    window.dispatchEvent(new CustomEvent('svmseek-wallet-conflict', {
      detail: {
        message: errorMessage,
        suggestion: 'Multiple wallet extensions detected. Consider disabling conflicting extensions for better compatibility.'
      }
    }));
  }

  /**
   * Throttled logging to prevent log spam in global error recovery attempts
   */
  private shouldLog(errorType: string): boolean {
    const currentTime = Date.now();
    const windowStart = Math.floor(currentTime / this.LOG_THROTTLE_WINDOW_MS) * this.LOG_THROTTLE_WINDOW_MS;
    const throttleKey = `${errorType}_${windowStart}`;

    const currentCount = this.logThrottleMap.get(throttleKey) || 0;
    if (currentCount >= this.MAX_LOGS_PER_WINDOW) {
      return false;
    }

    this.logThrottleMap.set(throttleKey, currentCount + 1);

    // Clean old entries to prevent memory leaks
    const cutoff = currentTime - this.LOG_THROTTLE_WINDOW_MS;
    for (const [key] of this.logThrottleMap) {
      const keyTime = parseInt(key.split('_').pop() || '0');
      if (keyTime < cutoff) {
        this.logThrottleMap.delete(key);
      }
    }

    return true;
  }

  /**
   * Track error frequency
   */
  private incrementErrorCount(errorType: string): void {
    const current = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, current + 1);
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCounts);
  }

  /**
   * Reset error counts
   */
  public resetErrorCounts(): void {
    this.errorCounts.clear();
  }

  /**
   * Start cleanup interval for memory management
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanupThrottleMaps();
    }, this.LOG_THROTTLE_WINDOW_MS);
  }

  /**
   * Clean up throttle maps to prevent memory leaks
   */
  private cleanupThrottleMaps(): void {
    const currentTime = Date.now();
    const cutoff = currentTime - this.LOG_THROTTLE_WINDOW_MS;
    
    for (const [key] of this.logThrottleMap) {
      const keyTime = parseInt(key.split('_').pop() || '0');
      if (keyTime < cutoff) {
        this.logThrottleMap.delete(key);
      }
    }
    
    // Also clean error counts if they get too large
    if (this.errorCounts.size > 100) {
      const entries = Array.from(this.errorCounts.entries());
      entries.sort((a, b) => b[1] - a[1]); // Sort by count, highest first
      this.errorCounts.clear();
      // Keep only the top 50 error types
      entries.slice(0, 50).forEach(([key, value]) => {
        this.errorCounts.set(key, value);
      });
    }
  }

  /**
   * Cleanup method to prevent memory leaks
   */
  public cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.logThrottleMap.clear();
    this.errorCounts.clear();
    this.patchesApplied.clear();
  }
}

// Create and export a singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  globalErrorHandler.initialize();
}
