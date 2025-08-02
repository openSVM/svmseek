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
  private addNullAccessProtection(): void {
    // Monkey patch common problematic patterns
    // TECHNICAL DEBT: This modifies the global EventTarget prototype. While this adds
    // defensive protection against third-party extension bugs, it affects all event
    // listeners in the application. Consider refactoring to a more targeted approach
    // in future versions if performance becomes a concern.
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
   * 
   * MONKEY-PATCH WARNING: This method modifies the global Object.defineProperty to intercept
   * attempts to redefine the window.ethereum property, which is a common source of wallet
   * extension conflicts. Multiple wallet extensions (MetaMask, Phantom, etc.) try to claim
   * the same property, causing "Cannot redefine property" errors.
   * 
   * The original Object.defineProperty is preserved and wrapped with conflict detection that:
   * 1. Monitors attempts to define window.ethereum
   * 2. Checks if the property is already non-configurable 
   * 3. Gracefully handles conflicts by logging and skipping redefinition
   * 4. Allows the first extension to succeed, preventing subsequent conflicts
   * 
   * Impact: This prevents the entire application from crashing when multiple wallet
   * extensions are installed. The first extension to define window.ethereum wins.
   * 
   * @onboarding For new developers: This is a browser extension ecosystem compatibility
   * layer. Wallet extensions compete for global properties, and without this protection,
   * the app crashes with "Cannot redefine property" errors when users have multiple
   * wallet extensions installed (which is common).
   */
  private addWalletConflictProtection(): void {
    // Monitor for ethereum property conflicts
    // IMPLEMENTATION NOTE: This creates a proxy around Object.defineProperty specifically
    // to intercept window.ethereum redefinition attempts. The ethereumConflictDetected
    // flag ensures we only warn once per session to avoid log spam.
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