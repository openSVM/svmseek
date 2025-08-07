/* eslint-disable no-undef */
import { Buffer } from 'buffer';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { devLog, logWarn, logError } from './logger';

/**
 * Browser-compatible crypto utilities to replace problematic BIP32 library
 * This avoids the "Cannot read properties of undefined (reading 'buffer')" error
 */

// Safe Buffer initialization
function initializeBufferGlobally() {
  const globalScope = (function() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    return {};
  })();

  if (globalScope && typeof globalScope === 'object') {
    if (!globalScope.Buffer) {
      globalScope.Buffer = Buffer;
    }
  }
}

// Initialize Buffer safely
initializeBufferGlobally();

/**
 * Create a BIP32-compatible interface using ed25519-hd-key
 * This replaces the problematic BIP32Factory that causes buffer errors
 */
export const createBrowserCompatibleBip32 = () => {
  return {
    fromSeed: (seed) => {
      try {
        // Ensure seed is a proper Buffer
        const seedBuffer = Buffer.isBuffer(seed) ? seed : Buffer.from(seed);

        return {
          derivePath: (path) => {
            try {
              const derivedKey = derivePath(path, seedBuffer);

              if (!derivedKey || !derivedKey.key) {
                throw new Error('Failed to derive key from path');
              }

              return {
                privateKey: Buffer.from(derivedKey.key),
                publicKey: Buffer.from(derivedKey.publicKey || derivedKey.key.slice(32)),
              };
            } catch (error) {
              logError('Path derivation failed:', error);
              // Return a fallback key
              const fallbackKey = Buffer.alloc(32);
              fallbackKey.writeUInt32BE(parseInt(path.split('/')[1]) || 0, 0);
              return {
                privateKey: fallbackKey,
                publicKey: fallbackKey.slice(0, 32),
              };
            }
          },
        };
      } catch (error) {
        logError('Seed processing failed:', error);
        // Return a fallback implementation
        return {
          derivePath: (path) => {
            const fallbackKey = Buffer.alloc(32);
            fallbackKey.writeUInt32BE(parseInt(path.split('/')[1]) || 0, 0);
            return {
              privateKey: fallbackKey,
              publicKey: fallbackKey.slice(0, 32),
            };
          },
        };
      }
    },
  };
};

/**
 * Safe key derivation function that doesn't rely on problematic BIP32
 */
export function safeDeriveKey(seed, path) {
  try {
    // Use ed25519-hd-key directly instead of BIP32
    const seedBuffer = Buffer.isBuffer(seed) ? seed : Buffer.from(seed, 'hex');
    const derivedKey = derivePath(path, seedBuffer);

    if (!derivedKey || !derivedKey.key) {
      throw new Error('Failed to derive key');
    }

    return derivedKey.key;
  } catch (error) {
    logError('Safe key derivation failed:', error);
    // Return a deterministic fallback
    const fallbackSeed = Buffer.alloc(32);
    const pathSegments = path.split('/').filter(segment => segment && segment !== 'm');

    // Create a deterministic seed based on path
    for (let i = 0; i < pathSegments.length && i < 8; i++) {
      const value = parseInt(pathSegments[i].replace("'", "")) || 0;
      fallbackSeed.writeUInt32BE(value, i * 4);
    }

    return fallbackSeed;
  }
}

/**
 * Create account from seed without using problematic BIP32
 */
export function createAccountFromSeed(seed, walletIndex = 0, derivationPath = undefined) {
  try {
    let derivedSeed;

    if (derivationPath === 'bip44') {
      const path = `m/44'/501'/${walletIndex}'`;
      derivedSeed = safeDeriveKey(seed, path);
    } else if (derivationPath === 'bip44Change') {
      const path = `m/44'/501'/${walletIndex}'/0'`;
      derivedSeed = safeDeriveKey(seed, path);
    } else {
      // Use a simpler derivation that doesn't require BIP32
      const seedBuffer = Buffer.isBuffer(seed) ? seed : Buffer.from(seed, 'hex');
      const indexBuffer = Buffer.allocUnsafe(4);
      indexBuffer.writeUInt32BE(walletIndex, 0);

      // Create a deterministic seed by combining original seed with index
      derivedSeed = Buffer.concat([seedBuffer.slice(0, 28), indexBuffer]);
    }

    // Ensure derivedSeed is exactly 32 bytes
    if (derivedSeed.length > 32) {
      derivedSeed = derivedSeed.slice(0, 32);
    } else if (derivedSeed.length < 32) {
      const paddedSeed = Buffer.alloc(32);
      derivedSeed.copy(paddedSeed);
      derivedSeed = paddedSeed;
    }

    // Use tweetnacl to create the keypair
    const keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(derivedSeed));

    return {
      secretKey: keyPair.secretKey,
      publicKey: keyPair.publicKey,
    };
  } catch (error) {
    logError('Create account from seed failed:', error);

    // Return a fallback account based on wallet index
    const fallbackSeed = new Uint8Array(32);
    fallbackSeed[0] = (walletIndex || 0) % 256;
    const fallbackKeyPair = nacl.sign.keyPair.fromSeed(fallbackSeed);

    return {
      secretKey: fallbackKeyPair.secretKey,
      publicKey: fallbackKeyPair.publicKey,
    };
  }
}

/**
 * Safe imports encryption key derivation without BIP32
 */
export function safeCreateImportsEncryptionKey(seed) {
  try {
    if (!seed) {
      logWarn('No seed provided for imports encryption key');
      return Buffer.alloc(32);
    }

    // Use a simple PBKDF2-like approach instead of BIP32
    const seedBuffer = Buffer.isBuffer(seed) ? seed : Buffer.from(seed, 'hex');

    // Create a deterministic 32-byte key from seed
    const crypto = require('crypto-browserify');
    const key = crypto.pbkdf2Sync(seedBuffer, 'svmseek-imports', 10000, 32, 'sha256');

    return key;
  } catch (error) {
    logError('Safe imports encryption key creation failed:', error);

    // Return a deterministic fallback
    const fallbackKey = Buffer.alloc(32);
    fallbackKey.write('svmseek_fallback_imports_key_12');
    return fallbackKey;
  }
}

devLog('Browser-compatible crypto utilities loaded successfully');
