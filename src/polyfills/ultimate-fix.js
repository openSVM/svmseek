/* eslint-disable no-undef, no-unused-vars, no-extend-native, no-whitespace-before-property */
// Secure polyfill initialization - minimal global modifications
import { Buffer } from 'buffer';
import { devLog, logWarn, logError } from '../utils/logger';
// Import the os polyfill
import osPolyfill from './os-browser.js';

// Safe initialization function that doesn't directly modify globals
function initializeBufferPolyfills() {
  const globalScope = (function() {
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
        configurable: false
      });
    }
    if (!globalScope.global) {
      Object.defineProperty(globalScope, 'global', {
        value: globalScope,
        writable: false,
        configurable: false
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
    isBuffer: Buffer.isBuffer.bind(Buffer)
  };
}

// Safe crypto initialization
function initializeCryptoPolyfills() {
  const globalScope = (function() {
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  })();

  // Only add crypto if it doesn't exist and we're in browser
  if (globalScope && typeof globalScope === 'object' && typeof window !== 'undefined') {
    if (!globalScope.crypto && window.crypto) {
      Object.defineProperty(globalScope, 'crypto', {
        value: window.crypto,
        writable: false,
        configurable: false
      });
    }
  }
}

// Initialize OS module polyfill for dependencies like Anchor
function initializeOsPolyfill() {
  const globalScope = (function() {
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    return {};
  })();

  if (globalScope && typeof globalScope === 'object') {
    // Create or enhance the require function to handle os module
    if (typeof globalScope.require === 'undefined') {
      globalScope.require = function(moduleName) {
        if (moduleName === 'os') {
          return osPolyfill;
        }
        throw new Error(`Module ${moduleName} not found`);
      };
    } else {
      const originalRequire = globalScope.require;
      globalScope.require = function(moduleName) {
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
        configurable: false
      });
    }
  }
}

// Secure error handler for crypto-related errors
function setupSecureErrorHandling() {
  // Only in browser environment
  if (typeof window !== 'undefined') {
    const originalOnError = window.onerror;
    const secureErrorHandler = function(message, source, lineno, colno, error) {
      // Handle homedir errors specifically
      if (typeof message === 'string' && (
        message.includes("c.homedir is not a function") ||
        message.includes("homedir is not a function") ||
        message.includes("Cannot read properties of undefined (reading 'homedir')") ||
        message.includes("Cannot read properties of undefined (reading 'buffer')")
      )) {
        logError('OS/Buffer access error intercepted:', message);

        // Show user-friendly error instead of crashing
        if (document.body && !document.body.querySelector('.crypto-error-message')) {
          const errorDiv = document.createElement('div');
          errorDiv.className = 'crypto-error-message';
          errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            max-width: 300px;
          `;
          errorDiv.textContent = 'Compatibility issue detected. Attempting to recover...';
          document.body.appendChild(errorDiv);

          setTimeout(() => {
            if (errorDiv.parentNode) {
              errorDiv.parentNode.removeChild(errorDiv);
            }
          }, 3000);
        }

        return true; // Prevent default error handling
      }

      // Call original handler for other errors
      if (originalOnError) {
        return originalOnError.call(this, message, source, lineno, colno, error);
      }
      return false;
    };

    // Set up secure error handler using property descriptor
    Object.defineProperty(window, 'onerror', {
      value: secureErrorHandler,
      writable: true,
      configurable: true
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
