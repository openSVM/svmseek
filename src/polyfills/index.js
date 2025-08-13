/* eslint-disable no-undef, strict */
// CRITICAL: Vite-compatible polyfill system
// Simplified polyfill system that works with Vite's native polyfill support

// Import os polyfill directly  
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

  // Immediately inject os polyfill
  if (globalScope && typeof globalScope === 'object') {
    // Direct os module assignment
    if (!globalScope.os) {
      globalScope.os = osPolyfill;
    }

    // Simplified require function for os module
    if (!globalScope.require) {
      globalScope.require = function(moduleName) {
        if (moduleName === 'os') return osPolyfill;
        throw new Error(`Module ${moduleName} not found`);
      };
    }

    // Set global for compatibility
    globalScope.global = globalScope;
  }
})();

// Load additional polyfills if needed
async function loadAdditionalPolyfills() {
  try {
    const { isFeatureEnabled } = await import('../utils/featureFlags');
    const { devLog } = await import('../utils/logger');

    if (isFeatureEnabled('enableCryptoPolyfill')) {
      await import('../utils/crypto-browser-compatible.js');
    }

    devLog('Vite-compatible polyfills loaded successfully');
  } catch (error) {
    console.warn('Additional polyfill loading failed:', error);
  }
}

// Load additional polyfills
loadAdditionalPolyfills().catch(error => {
  console.error('Failed to load additional polyfills:', error);
});
