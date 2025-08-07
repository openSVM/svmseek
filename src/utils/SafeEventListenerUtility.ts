/**
 * Safe Event Listener Utility
 *
 * Provides opt-in safe event listener functionality to prevent null property access
 * crashes commonly caused by third-party wallet extensions. This is a more controlled
 * alternative to global monkey-patching.
 *
 * Usage:
 * import { SafeEventListenerUtility } from './SafeEventListenerUtility';
 *
 * // Opt-in to safe event handling for specific elements
 * const safeEventUtil = new SafeEventListenerUtility();
 * safeEventUtil.enableSafeListeners();
 *
 * // Or use safe listeners directly
 * safeEventUtil.addSafeEventListener(element, 'message', handler);
 */

import { logWarn, logError } from './logger';

export interface SafeEventListenerConfig {
  enableLogging: boolean;
  enableNullChecks: boolean;
  enableErrorRecovery: boolean;
}

export class SafeEventListenerUtility {
  private config: SafeEventListenerConfig;
  private originalAddEventListener: typeof EventTarget.prototype.addEventListener | null = null;
  private isGloballyEnabled = false;

  constructor(config: Partial<SafeEventListenerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableNullChecks: true,
      enableErrorRecovery: true,
      ...config
    };
  }

  /**
   * Enable safe event listeners globally (opt-in monkey-patch)
   *
   * IMPORTANT: This modifies EventTarget.prototype.addEventListener globally.
   * Only call this if you need protection against third-party extension crashes.
   *
   * @onboarding This is a compatibility layer for wallet extension environments
   * where multiple extensions may cause null property access errors.
   */
  public enableSafeListeners(): void {
    if (this.isGloballyEnabled) {
      if (this.config.enableLogging) {
        logWarn('SafeEventListenerUtility: Already enabled globally');
      }
      return;
    }

    this.originalAddEventListener = EventTarget.prototype.addEventListener;

    const utility = this;
    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      // Validate that 'this' is an EventTarget instance
      if (!(this instanceof EventTarget)) {
        throw new TypeError('Can only call EventTarget.addEventListener on instances of EventTarget');
      }
      
      const safeListener = utility.createSafeListener(listener);
      return utility.originalAddEventListener!.call(this, type, safeListener, options);
    };

    // Store reference to utility for error handling
    (EventTarget.prototype.addEventListener as any).__safeEventUtility = this;

    this.isGloballyEnabled = true;

    if (this.config.enableLogging) {
      logWarn('SafeEventListenerUtility: Global safe event listeners enabled');
    }
  }

  /**
   * Disable global safe event listeners and restore original behavior
   */
  public disableSafeListeners(): void {
    if (!this.isGloballyEnabled || !this.originalAddEventListener) {
      return;
    }

    EventTarget.prototype.addEventListener = this.originalAddEventListener;
    delete (EventTarget.prototype.addEventListener as any).__safeEventUtility;
    this.isGloballyEnabled = false;

    if (this.config.enableLogging) {
      logWarn('SafeEventListenerUtility: Global safe event listeners disabled');
    }
  }

  /**
   * Add a safe event listener to a specific element without global patching
   */
  public addSafeEventListener(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    const safeListener = this.createSafeListener(listener);
    target.addEventListener(type, safeListener, options);
  }

  /**
   * Create a safe wrapper around an event listener
   */
  private createSafeListener(listener: any): EventListener {
    return (event: Event) => {
      try {
        if (!event) {
          if (this.config.enableLogging) {
            logWarn('SafeEventListenerUtility: Null event object');
          }
          return;
        }

        if (typeof listener === 'function') {
          // For message events, check data property safety
          if (event.type === 'message' && this.config.enableNullChecks) {
            const messageEvent = event as MessageEvent;
            if (messageEvent.data === null || messageEvent.data === undefined) {
              if (this.config.enableLogging) {
                logWarn('SafeEventListenerUtility: Message event with null data');
              }
              return;
            }
          }

          return listener.call(this, event);
        } else if (listener && typeof listener.handleEvent === 'function') {
          return listener.handleEvent(event);
        }
      } catch (error: any) {
        if (this.config.enableErrorRecovery && error?.message?.includes("Cannot read properties of null")) {
          if (this.config.enableLogging) {
            logWarn('SafeEventListenerUtility: Prevented null property access:', error.message);
          }
          return;
        }

        if (this.config.enableLogging) {
          logError('SafeEventListenerUtility: Error in event listener:', error);
        }

        // Re-throw non-recoverable errors
        throw error;
      }
    };
  }

  /**
   * Check if safe listeners are currently enabled globally
   */
  public isEnabled(): boolean {
    return this.isGloballyEnabled;
  }

  /**
   * Get current configuration
   */
  public getConfig(): SafeEventListenerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SafeEventListenerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance for convenience
export const safeEventListenerUtility = new SafeEventListenerUtility();
