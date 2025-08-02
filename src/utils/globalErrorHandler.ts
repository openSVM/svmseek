/**
 * Global error handler for runtime errors and wallet conflicts
 * Provides comprehensive error catching and user-friendly error recovery
 */

import { logError, logWarn } from './logger';

export interface ErrorHandlerConfig {
  enableRecovery: boolean;
  enableLogging: boolean;
  enableUserNotification: boolean;
}

export class GlobalErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCounts: Map<string, number> = new Map();
  private maxErrorsPerType = 5;

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
   */
  private addNullAccessProtection(): void {
    // Monkey patch common problematic patterns
    const originalEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      const safeListener = (event: any) => {
        try {
          // Ensure event and event.data exist before calling listener
          if (event && typeof listener === 'function') {
            if (event.data !== undefined && event.data !== null) {
              return listener.call(this, event);
            } else if (!event.data) {
              // For events that don't need data, call anyway
              return listener.call(this, event);
            }
          }
        } catch (error: any) {
          if (error?.message?.includes("Cannot read properties of null")) {
            logWarn('Null property access prevented:', error.message);
            return;
          }
          throw error;
        }
      };

      return originalEventListener.call(this, type, safeListener, options);
    };
  }

  /**
   * Add wallet extension conflict protection
   */
  private addWalletConflictProtection(): void {
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
          logWarn('Ethereum property conflict prevented:', error.message);
          return obj;
        }
      }
      return originalDefineProperty.call(this, obj, prop, descriptor);
    };
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
      logError('Too many errors of type:', errorType, 'stopping recovery attempts');
      return;
    }

    if (this.config.enableLogging) {
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
}

// Create and export a singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  globalErrorHandler.initialize();
}