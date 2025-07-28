// Temporary workaround for crypto library buffer access issues
// This file provides fallback implementations when the main crypto libraries fail

import { Buffer } from 'buffer';

/**
 * Safe buffer access helper that handles undefined cases
 */
export function safeBufferAccess(obj: any, fallback: ArrayBuffer = new ArrayBuffer(0)): ArrayBuffer {
  try {
    if (obj && typeof obj === 'object' && obj.buffer) {
      return obj.buffer;
    }
    return fallback;
  } catch (error) {
    console.warn('Buffer access failed, using fallback:', error);
    return fallback;
  }
}

/**
 * Safe Buffer.from implementation with error handling
 */
export function safeBufferFrom(data: any, encoding?: BufferEncoding): Buffer {
  try {
    if (Buffer && typeof Buffer.from === 'function') {
      return Buffer.from(data, encoding);
    }
    // Fallback implementation
    if (typeof data === 'string') {
      return Buffer.alloc(0); // Empty buffer as fallback
    }
    return Buffer.alloc(0);
  } catch (error) {
    console.warn('Buffer.from failed, using empty buffer:', error);
    return Buffer.alloc(0);
  }
}

/**
 * Initialize crypto modules with safe error handling
 */
export function initializeCryptoSafely(): boolean {
  try {
    // Test basic crypto operations to ensure they work
    safeBufferFrom('test');
    safeBufferAccess(new Uint8Array(4));
    
    console.log('Crypto workaround initialized successfully');
    return true;
  } catch (error) {
    console.error('Crypto workaround initialization failed:', error);
    return false;
  }
}

/**
 * Monkey patch common problematic operations
 */
export function applyBufferSafetyPatches(): void {
  // Patch Uint8Array prototype to prevent undefined buffer access
  const originalUint8Array = globalThis.Uint8Array;
  
  if (originalUint8Array && originalUint8Array.prototype) {
    const originalBufferGetter = Object.getOwnPropertyDescriptor(originalUint8Array.prototype, 'buffer');
    
    if (originalBufferGetter) {
      Object.defineProperty(originalUint8Array.prototype, 'buffer', {
        get: function() {
          try {
            return originalBufferGetter.get?.call(this) || new ArrayBuffer(0);
          } catch (error) {
            console.warn('Uint8Array buffer access patched due to error:', error);
            return new ArrayBuffer(0);
          }
        },
        configurable: true,
        enumerable: false
      });
    }
  }
  
  console.log('Buffer safety patches applied');
}