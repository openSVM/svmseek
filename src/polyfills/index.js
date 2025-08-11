/* eslint-disable no-undef */
// Conditional polyfill loading based on feature flags
import { isFeatureEnabled } from '../utils/featureFlags';
import { devLog } from '../utils/logger';

// Load polyfills conditionally based on feature flags
async function loadPolyfills() {
  // Import the browser-compatible crypto utilities FIRST (if enabled)
  if (isFeatureEnabled('enableCryptoPolyfill')) {
    await import('../utils/crypto-browser-compatible.js');
  }

  // Import the ultimate fix (if buffer polyfill is enabled)
  if (isFeatureEnabled('enableBufferPolyfill')) {
    await import('./ultimate-fix.js');
  }

  // Import and initialize the os polyfill for browser compatibility (if enabled)
  if (isFeatureEnabled('enableOsPolyfill')) {
    const osPolyfillModule = await import('./os-browser.js');
    const osPolyfill = osPolyfillModule.default;

    // Ensure os module is available globally for dependencies like anchor
    if (typeof window !== 'undefined') {
      // Make os module available through require function if it exists
      if (typeof window.require === 'undefined') {
        window.require = function (moduleName) {
          if (moduleName === 'os') {
            return osPolyfill;
          }
          throw new Error(`Module ${moduleName} not found`);
        };
      } else {
        const originalRequire = window.require;
        window.require = function (moduleName) {
          if (moduleName === 'os') {
            return osPolyfill;
          }
          return originalRequire(moduleName);
        };
      }
    }

    devLog(
      'Buffer polyfills loaded with browser-compatible crypto, os polyfill, and ultimate protection',
    );
  } else {
    // Log that polyfills are disabled
    if (process.env.NODE_ENV === 'development') {
      console.log('🎛️ OS polyfill disabled via feature flags');
    }
  }
}

// Load polyfills immediately
loadPolyfills().catch(console.error);
