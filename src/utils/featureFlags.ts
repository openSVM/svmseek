/**
 * Feature Flags Configuration
 *
 * Centralized configuration for experimental features, global patches,
 * and compatibility layers that can be toggled on/off for better control.
 *
 * IMPORTANT: These flags control potentially dangerous global modifications.
 * Only enable what's necessary for your environment.
 */

export interface FeatureFlags {
  // Global patch flags - use with extreme caution
  enableOsPolyfill: boolean;
  enableBufferPolyfill: boolean;
  enableSafeEventListeners: boolean;
  enableCryptoPolyfill: boolean;
  
  // Security enhancement flags
  enableAdvancedRateLimiting: boolean;
  enableOriginValidation: boolean;
  enableMessageSecurity: boolean;
  enableLoggingThrottling: boolean;
  
  // Development and debugging flags
  enableVerboseLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableSecurityAuditing: boolean;
  
  // Compatibility flags
  enableLegacyWalletSupport: boolean;
  enableExtensionCompatibility: boolean;
}

/**
 * Default feature flag configuration
 * 
 * Production-safe defaults with most global patches disabled
 * unless explicitly needed for wallet extension compatibility.
 */
const DEFAULT_FLAGS: FeatureFlags = {
  // Global patches - enabled by default for wallet compatibility
  enableOsPolyfill: process.env.REACT_APP_ENABLE_OS_POLYFILL !== 'false',
  enableBufferPolyfill: process.env.REACT_APP_ENABLE_BUFFER_POLYFILL !== 'false',
  enableSafeEventListeners: process.env.REACT_APP_ENABLE_SAFE_EVENT_LISTENERS !== 'false',
  enableCryptoPolyfill: process.env.REACT_APP_ENABLE_CRYPTO_POLYFILL !== 'false',
  
  // Security features - enabled by default
  enableAdvancedRateLimiting: process.env.REACT_APP_DISABLE_RATE_LIMITING !== 'true',
  enableOriginValidation: process.env.REACT_APP_DISABLE_ORIGIN_VALIDATION !== 'true',
  enableMessageSecurity: process.env.REACT_APP_DISABLE_MESSAGE_SECURITY !== 'true',
  enableLoggingThrottling: process.env.REACT_APP_DISABLE_LOGGING_THROTTLING !== 'true',
  
  // Development flags
  enableVerboseLogging: process.env.NODE_ENV === 'development' || process.env.REACT_APP_VERBOSE_LOGGING === 'true',
  enablePerformanceMonitoring: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true',
  enableSecurityAuditing: process.env.REACT_APP_ENABLE_SECURITY_AUDITING === 'true',
  
  // Compatibility flags
  enableLegacyWalletSupport: process.env.REACT_APP_ENABLE_LEGACY_WALLET_SUPPORT === 'true',
  enableExtensionCompatibility: process.env.REACT_APP_ENABLE_EXTENSION_COMPATIBILITY !== 'false', // enabled by default
};

/**
 * Get current feature flags with environment variable overrides
 */
export function getFeatureFlags(): FeatureFlags {
  return { ...DEFAULT_FLAGS };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature];
}

/**
 * Get feature flags for a specific environment
 */
export function getEnvironmentFlags(environment: 'development' | 'staging' | 'production'): FeatureFlags {
  const baseFlags = getFeatureFlags();
  
  switch (environment) {
    case 'development':
      return {
        ...baseFlags,
        enableVerboseLogging: true,
        enablePerformanceMonitoring: true,
        enableSecurityAuditing: true,
        enableOsPolyfill: true,
        enableBufferPolyfill: true,
        enableSafeEventListeners: true,
        enableCryptoPolyfill: true,
      };
      
    case 'staging':
      return {
        ...baseFlags,
        enablePerformanceMonitoring: true,
        enableSecurityAuditing: true,
        enableOsPolyfill: true,
        enableBufferPolyfill: true,
        enableExtensionCompatibility: true,
      };
      
    case 'production':
      return {
        ...baseFlags,
        enableVerboseLogging: false,
        // Only enable global patches if absolutely necessary in production
        enableOsPolyfill: baseFlags.enableOsPolyfill,
        enableBufferPolyfill: baseFlags.enableBufferPolyfill,
        enableSafeEventListeners: baseFlags.enableSafeEventListeners,
      };
      
    default:
      return baseFlags;
  }
}

/**
 * Log current feature flag status (for debugging)
 */
export function logFeatureFlags(): void {
  if (process.env.NODE_ENV === 'development') {
    const flags = getFeatureFlags();
    console.group('🎛️ Feature Flags Status');
    
    console.group('Global Patches (⚠️ Use with caution)');
    console.log('OS Polyfill:', flags.enableOsPolyfill ? '✅ Enabled' : '❌ Disabled');
    console.log('Buffer Polyfill:', flags.enableBufferPolyfill ? '✅ Enabled' : '❌ Disabled');
    console.log('Safe Event Listeners:', flags.enableSafeEventListeners ? '✅ Enabled' : '❌ Disabled');
    console.log('Crypto Polyfill:', flags.enableCryptoPolyfill ? '✅ Enabled' : '❌ Disabled');
    console.groupEnd();
    
    console.group('Security Features');
    console.log('Rate Limiting:', flags.enableAdvancedRateLimiting ? '✅ Enabled' : '❌ Disabled');
    console.log('Origin Validation:', flags.enableOriginValidation ? '✅ Enabled' : '❌ Disabled');
    console.log('Message Security:', flags.enableMessageSecurity ? '✅ Enabled' : '❌ Disabled');
    console.log('Logging Throttling:', flags.enableLoggingThrottling ? '✅ Enabled' : '❌ Disabled');
    console.groupEnd();
    
    console.group('Development Features');
    console.log('Verbose Logging:', flags.enableVerboseLogging ? '✅ Enabled' : '❌ Disabled');
    console.log('Performance Monitoring:', flags.enablePerformanceMonitoring ? '✅ Enabled' : '❌ Disabled');
    console.log('Security Auditing:', flags.enableSecurityAuditing ? '✅ Enabled' : '❌ Disabled');
    console.groupEnd();
    
    console.group('Compatibility Features');
    console.log('Legacy Wallet Support:', flags.enableLegacyWalletSupport ? '✅ Enabled' : '❌ Disabled');
    console.log('Extension Compatibility:', flags.enableExtensionCompatibility ? '✅ Enabled' : '❌ Disabled');
    console.groupEnd();
    
    console.groupEnd();
  }
}

/**
 * Validate feature flag configuration and warn about potentially dangerous combinations
 */
export function validateFeatureFlags(): void {
  const flags = getFeatureFlags();
  
  // Warn about production use of global patches
  if (process.env.NODE_ENV === 'production') {
    const globalPatches = [
      flags.enableOsPolyfill && 'OS Polyfill',
      flags.enableBufferPolyfill && 'Buffer Polyfill', 
      flags.enableSafeEventListeners && 'Safe Event Listeners',
      flags.enableCryptoPolyfill && 'Crypto Polyfill'
    ].filter(Boolean);
    
    if (globalPatches.length > 0) {
      console.warn(
        '⚠️ Global patches enabled in production:',
        globalPatches.join(', '),
        '\nThese modify global objects and should only be used when necessary for wallet extension compatibility.'
      );
    }
  }
  
  // Warn about disabled security features
  const disabledSecurity = [
    !flags.enableAdvancedRateLimiting && 'Rate Limiting',
    !flags.enableOriginValidation && 'Origin Validation',
    !flags.enableMessageSecurity && 'Message Security'
  ].filter(Boolean);
  
  if (disabledSecurity.length > 0) {
    console.warn(
      '🔓 Security features disabled:',
      disabledSecurity.join(', '),
      '\nThis may leave the application vulnerable to attacks.'
    );
  }
}

// Auto-validate flags on import
validateFeatureFlags();