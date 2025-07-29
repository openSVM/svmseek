/* eslint-disable no-undef, no-unused-vars, no-extend-native, no-whitespace-before-property */
// Secure polyfill initialization - minimal global modifications
import { Buffer } from 'buffer';
import { devLog, logWarn, logError } from '../utils/logger';

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

// Secure error handler for crypto-related errors
function setupSecureErrorHandling() {
  // Only in browser environment
  if (typeof window !== 'undefined') {
    const originalOnError = window.onerror;
    const secureErrorHandler = function(message, source, lineno, colno, error) {
      if (typeof message === 'string' && message.includes("Cannot read properties of undefined (reading 'buffer')")) {
        logError('Buffer access error intercepted:', message);
        
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
          errorDiv.textContent = 'Crypto library compatibility issue detected. Please refresh the page.';
          document.body.appendChild(errorDiv);
          
          setTimeout(() => {
            if (errorDiv.parentNode) {
              errorDiv.parentNode.removeChild(errorDiv);
            }
          }, 5000);
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
    setupSecureErrorHandling();
    devLog('Secure buffer and crypto polyfills initialized');
  } catch (error) {
    logError('Failed to initialize polyfills:', error);
  }
}

// Export the initialization function
export { initializeAll, createBufferPolyfill };

// Auto-initialize when module loads
initializeAll();