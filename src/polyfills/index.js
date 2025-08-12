/* eslint-disable no-undef, strict */
// CRITICAL: Immediate polyfill loading - must be synchronous and unconditional
// This fixes the "c.homedir is not a function" error that occurs during webpack bundle execution

// Import polyfills synchronously to ensure they're available immediately
import './ultimate-fix.js';
import osPolyfill from './os-browser.js';

// IMMEDIATE polyfill injection - runs before any other code
(function() {
  'use strict';
  
  // Get global scope
  const globalScope = (function() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  })();

  // Immediately inject os polyfill into ALL possible locations
  if (globalScope && typeof globalScope === 'object') {
    // Direct os module assignment
    if (!globalScope.os) {
      globalScope.os = osPolyfill;
    }

    // Create/enhance require function
    if (!globalScope.require) {
      globalScope.require = function(moduleName) {
        if (moduleName === 'os') return osPolyfill;
        throw new Error(`Module ${moduleName} not found`);
      };
    } else {
      const originalRequire = globalScope.require;
      globalScope.require = function(moduleName) {
        if (moduleName === 'os') return osPolyfill;
        try {
          return originalRequire(moduleName);
        } catch (error) {
          if (moduleName === 'os') return osPolyfill;
          throw error;
        }
      };
    }

    // CRITICAL: Handle the specific 'c.homedir' pattern that's causing the error
    // Some bundled code assigns os module to variable 'c' and then calls c.homedir()
    if (!globalScope.c) {
      globalScope.c = osPolyfill;
    } else if (globalScope.c && typeof globalScope.c === 'object') {
      // Merge our polyfill into existing 'c' object
      Object.assign(globalScope.c, osPolyfill);
    }

    // Add require cache if available
    if (globalScope.require && !globalScope.require.cache) {
      globalScope.require.cache = {};
    }
    if (globalScope.require && globalScope.require.cache) {
      globalScope.require.cache.os = { exports: osPolyfill };
    }

    // Additional safety: intercept any webpack require patterns
    if (typeof globalScope.__webpack_require__ !== 'undefined') {
      const originalWebpackRequire = globalScope.__webpack_require__;
      globalScope.__webpack_require__ = function(moduleId) {
        try {
          return originalWebpackRequire(moduleId);
        } catch (error) {
          // If webpack require fails and it's looking for os-related functionality,
          // provide our polyfill
          if (typeof moduleId === 'string' && moduleId.includes('os')) {
            return osPolyfill;
          }
          throw error;
        }
      };
    }
  }
})();

// Conditional polyfill loading for additional features
async function loadAdditionalPolyfills() {
  try {
    // Dynamically import feature flags only after critical polyfills are loaded
    const { isFeatureEnabled } = await import('../utils/featureFlags');
    const { devLog } = await import('../utils/logger');

    // Import the browser-compatible crypto utilities (if enabled)
    if (isFeatureEnabled('enableCryptoPolyfill')) {
      await import('../utils/crypto-browser-compatible.js');
    }

    devLog('Critical OS polyfills loaded immediately, additional polyfills loaded conditionally');
  } catch (error) {
    // Fallback logging if logger fails
    if (typeof console !== 'undefined') {
      console.warn('Additional polyfill loading failed:', error);
    }
  }
}

// Load additional polyfills after critical ones are in place
loadAdditionalPolyfills().catch(error => {
  if (typeof console !== 'undefined') {
    console.error('Failed to load additional polyfills:', error);
  }
});
