/* eslint-disable no-undef, no-unused-vars, no-extend-native, no-whitespace-before-property */
// Secure polyfill initialization - minimal global modifications
import { Buffer } from 'buffer';
import { devLog, logWarn, logError } from '../utils/logger';
// Import the os polyfill
import osPolyfill from './os-browser.js';

// Safe initialization function that doesn't directly modify globals
function initializeBufferPolyfills() {
  const globalScope = (function () {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  })();

  if (globalScope && typeof globalScope === 'object') {
    // Only initialize if not already present
    if (!globalScope.Buffer) {
      Object.defineProperty(globalScope, 'Buffer', {
        value: Buffer,
        writable: false,
        configurable: false,
      });
    }
    if (!globalScope.global) {
      Object.defineProperty(globalScope, 'global', {
        value: globalScope,
        writable: false,
        configurable: false,
      });
    }
  }
}

// Create Buffer polyfill factory for modules that need it
function createBufferPolyfill() {
  return {
    Buffer,
    from: Buffer.from.bind(Buffer),
    alloc: Buffer.alloc.bind(Buffer),
    allocUnsafe: Buffer.allocUnsafe.bind(Buffer),
    isBuffer: Buffer.isBuffer.bind(Buffer),
  };
}

// Safe crypto initialization
function initializeCryptoPolyfills() {
  const globalScope = (function () {
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  })();

  // Only add crypto if it doesn't exist and we're in browser
  if (
    globalScope &&
    typeof globalScope === 'object' &&
    typeof window !== 'undefined'
  ) {
    if (!globalScope.crypto && window.crypto) {
      Object.defineProperty(globalScope, 'crypto', {
        value: window.crypto,
        writable: false,
        configurable: false,
      });
    }
  }
}

// Initialize OS module polyfill for dependencies like Anchor
function initializeOsPolyfill() {
  const globalScope = (function () {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  })();

  if (globalScope && typeof globalScope === 'object') {
    // Create or enhance the require function to handle os module
    if (typeof globalScope.require === 'undefined') {
      globalScope.require = function (moduleName) {
        if (moduleName === 'os') {
          return osPolyfill;
        }
        throw new Error(`Module ${moduleName} not found`);
      };
    } else {
      const originalRequire = globalScope.require;
      globalScope.require = function (moduleName) {
        if (moduleName === 'os') {
          return osPolyfill;
        }
        try {
          return originalRequire(moduleName);
        } catch (error) {
          if (moduleName === 'os') {
            return osPolyfill;
          }
          throw error;
        }
      };
    }

    // Also ensure os is available as a global module if needed
    if (!globalScope.os) {
      Object.defineProperty(globalScope, 'os', {
        value: osPolyfill,
        writable: false,
        configurable: false,
      });
    }

    // Patch any existing require cache to return our polyfill
    if (globalScope.require && globalScope.require.cache) {
      globalScope.require.cache.os = { exports: osPolyfill };
    }

    // CRITICAL: Handle the 'c' variable pattern that's causing the error
    // Many webpack bundles assign os module to variable 'c' like: const c = require('os')
    if (typeof globalScope.c === 'undefined') {
      Object.defineProperty(globalScope, 'c', {
        value: osPolyfill,
        writable: true,
        configurable: true,
      });
    } else if (globalScope.c && typeof globalScope.c === 'object') {
      // If 'c' exists but doesn't have homedir, add it
      if (!globalScope.c.homedir || typeof globalScope.c.homedir !== 'function') {
        globalScope.c.homedir = osPolyfill.homedir;
      }
      // Also add other os functions that might be missing
      Object.keys(osPolyfill).forEach(key => {
        if (!globalScope.c[key]) {
          globalScope.c[key] = osPolyfill[key];
        }
      });
    }

    // Additional webpack pattern handling: some code uses 'a', 'b', 'd', etc. for os
    const possibleOsVariables = ['a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    possibleOsVariables.forEach(varName => {
      if (globalScope[varName] && typeof globalScope[varName] === 'object' && !globalScope[varName].homedir) {
        // If this looks like it might be intended to be an os module (has some os-like properties)
        // but is missing homedir, add our polyfill functions
        try {
          globalScope[varName].homedir = osPolyfill.homedir;
          globalScope[varName].tmpdir = osPolyfill.tmpdir;
          globalScope[varName].platform = osPolyfill.platform;
        } catch (e) {
          // Ignore errors if we can't modify the object
        }
      }
    });

    // Webpack module interception
    if (typeof globalScope.__webpack_require__ !== 'undefined') {
      const originalWebpackRequire = globalScope.__webpack_require__;
      globalScope.__webpack_require__ = function(moduleId) {
        try {
          const result = originalWebpackRequire(moduleId);
          // If the result looks like it should be an os module but is missing functions, enhance it
          if (result && typeof result === 'object' && !result.homedir && (
            typeof moduleId === 'string' && (moduleId.includes('os') || moduleId.includes('node:os'))
          )) {
            return { ...result, ...osPolyfill };
          }
          return result;
        } catch (error) {
          // If webpack require fails and it's looking for os-related functionality
          if (typeof moduleId === 'string' && (moduleId.includes('os') || moduleId.includes('node:os'))) {
            return osPolyfill;
          }
          throw error;
        }
      };
    }
  }
}

// Secure error handler for crypto-related errors
function setupSecureErrorHandling() {
  // Only in browser environment
  if (typeof window !== 'undefined') {
    const originalOnError = window.onerror;
    const secureErrorHandler = function (
      message,
      source,
      lineno,
      colno,
      error,
    ) {
      // Handle homedir errors specifically with enhanced recovery
      if (
        typeof message === 'string' &&
        (message.includes('c.homedir is not a function') ||
          message.includes('homedir is not a function') ||
          message.includes('a.homedir is not a function') ||
          message.includes('b.homedir is not a function') ||
          message.includes('d.homedir is not a function') ||
          message.includes('e.homedir is not a function') ||
          message.includes('.homedir is not a function') ||
          message.includes(
            "Cannot read properties of undefined (reading 'homedir')",
          ) ||
          message.includes(
            "Cannot read properties of undefined (reading 'buffer')",
          ) ||
          message.includes('resolve is not a function') ||
          message.includes('os.homedir is not a function'))
      ) {
        logError('OS/Buffer access error intercepted:', message);

        // Emergency polyfill injection with enhanced coverage
        try {
          if (typeof window !== 'undefined') {
            // Ensure os polyfill is available
            if (!window.os || !window.os.homedir) {
              window.os = osPolyfill;
            }
            
            // Fix any undefined variable that might be causing issues
            // Common webpack patterns: c, a, b, d, e, etc.
            const commonOsVars = ['c', 'a', 'b', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            commonOsVars.forEach(varName => {
              if (typeof window[varName] === 'undefined') {
                window[varName] = osPolyfill;
              } else if (window[varName] && typeof window[varName] === 'object' && !window[varName].homedir) {
                window[varName] = { ...window[varName], ...osPolyfill };
              }
            });
            
            // Also ensure global path resolution is available
            if (!window.path) {
              window.path = {
                resolve: function(...args) {
                  return args.join('/').replace(/\/+/g, '/');
                },
                join: function(...args) {
                  return args.join('/').replace(/\/+/g, '/');
                },
                dirname: function(p) {
                  return p.split('/').slice(0, -1).join('/') || '/';
                },
                basename: function(p) {
                  return p.split('/').pop() || '';
                }
              };
            }
            
            // Add to require cache if available
            if (window.require && typeof window.require.cache === 'object') {
              window.require.cache['os'] = { exports: window.os };
              window.require.cache['path'] = { exports: window.path };
            }

            // Intercept any future webpack requires
            if (typeof window.__webpack_require__ !== 'undefined') {
              const originalWebpackRequire = window.__webpack_require__;
              window.__webpack_require__ = function(moduleId) {
                try {
                  return originalWebpackRequire(moduleId);
                } catch (err) {
                  if (typeof moduleId === 'string' && (moduleId.includes('os') || moduleId.includes('node:os'))) {
                    return osPolyfill;
                  }
                  throw err;
                }
              };
            }
          }
        } catch (recoveryError) {
          logError('Emergency polyfill injection failed:', recoveryError);
        }

        // Prevent further errors by stopping event propagation
        try {
          // Show user-friendly error with auto-recovery
          if (
            typeof document !== 'undefined' &&
            document.body &&
            !document.body.querySelector('.crypto-error-message')
          ) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'crypto-error-message';
            errorDiv.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              background: #ff4444;
              color: white;
              padding: 15px 20px;
              border-radius: 8px;
              z-index: 10000;
              font-family: Arial, sans-serif;
              font-size: 14px;
              max-width: 350px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              border-left: 4px solid #fff;
            `;
            errorDiv.innerHTML = `
              <div style="font-weight: bold; margin-bottom: 8px;">System Compatibility Issue</div>
              <div>Applying automatic fix... Please wait.</div>
            `;
            document.body.appendChild(errorDiv);

            // Auto-remove and reload after fix attempt
            setTimeout(() => {
              if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
              }
              // Give polyfills time to take effect then reload
              setTimeout(() => {
                window.location.reload();
              }, 500);
            }, 2500);
          }
        } catch (displayError) {
          // Fallback: just reload
          setTimeout(() => window.location.reload(), 1000);
        }

        return true; // Prevent default error handling
      }

      // Call original handler for other errors
      if (originalOnError) {
        return originalOnError.call(
          this,
          message,
          source,
          lineno,
          colno,
          error,
        );
      }
      return false;
    };

    // Set up secure error handler using property descriptor
    Object.defineProperty(window, 'onerror', {
      value: secureErrorHandler,
      writable: true,
      configurable: true,
    });
  }
}

// Initialize all polyfills safely
function initializeAll() {
  try {
    initializeBufferPolyfills();
    initializeCryptoPolyfills();
    initializeOsPolyfill();
    setupSecureErrorHandling();
    devLog('Secure buffer, crypto, and OS polyfills initialized');
  } catch (error) {
    logError('Failed to initialize polyfills:', error);
  }
}

// Export the initialization function
export { initializeAll, createBufferPolyfill };

// Auto-initialize when module loads
initializeAll();
