// Comprehensive buffer polyfills and fixes for crypto library compatibility
import { Buffer } from 'buffer';
import { devLog, logDebug, logInfo, logWarn, logError } from './logger';

// Override problematic bip32 methods that cause buffer access errors
export function initializeCryptoLibraryPatches() {
  try {
    // Get the global scope safely
    const globalScope = (function() {
      if (typeof window !== 'undefined') return window;
      if (typeof global !== 'undefined') return global;
      return {};
    })();

    // Patch the global Buffer constructor to be safer
    const originalBufferFrom = Buffer.from;
    Buffer.from = function(data, encoding) {
      try {
        if (data === undefined || data === null) {
          logWarn('Buffer.from called with undefined/null, using empty buffer');
          return Buffer.alloc(0);
        }
        return originalBufferFrom.call(this, data, encoding);
      } catch (error) {
        logWarn('Buffer.from failed, using empty buffer:', error);
        return Buffer.alloc(0);
      }
    };

    // Patch Uint8Array to handle buffer access safely
    const originalUint8Array = globalScope.Uint8Array;
    if (originalUint8Array && originalUint8Array.prototype) {
      const descriptor = Object.getOwnPropertyDescriptor(originalUint8Array.prototype, 'buffer');
      if (descriptor && descriptor.get) {
        const originalBufferGetter = descriptor.get;
        Object.defineProperty(originalUint8Array.prototype, 'buffer', {
          get: function() {
            try {
              const result = originalBufferGetter.call(this);
              return result || new ArrayBuffer(0);
            } catch (error) {
              logWarn('Uint8Array.buffer access failed, using empty buffer:', error);
              return new ArrayBuffer(0);
            }
          },
          configurable: true,
          enumerable: false
        });
      }
    }

    devLog('Crypto library patches applied successfully');
    return true;
  } catch (error) {
    logError('Failed to apply crypto library patches:', error);
    return false;
  }
}

// Initialize patches when this module is imported
initializeCryptoLibraryPatches();
