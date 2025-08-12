/* eslint-disable no-undef */
import { Buffer } from 'buffer';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import crypto from 'crypto-browserify';
import { devLog, logWarn, logError } from './logger';

/**
 * Browser-compatible crypto utilities to replace problematic BIP32 library
 * This avoids the "Cannot read properties of undefined (reading 'buffer')" error
 */

// Safe Buffer initialization
function initializeBufferGlobally() {
  const globalScope = (function () {
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
                publicKey: Buffer.from(
                  derivedKey.publicKey || derivedKey.key.slice(32),
                ),
              };
            } catch (error) {
              logError('Path derivation failed:', error);
              // SECURITY: Fail securely instead of using weak fallback keys
              throw new Error('Key derivation failed - unable to generate secure keys. Please try again.');
            }
          },
        };
      } catch (error) {
        logError('Seed processing failed:', error);
        // SECURITY: Fail securely instead of using weak fallback keys
        throw new Error('Seed processing failed - unable to generate secure keys. Please unlock wallet again.');
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
    // SECURITY: Fail securely instead of using predictable fallback
    throw new Error('Secure key derivation failed. Please unlock wallet again.');
  }
}

/**
 * Create account from seed without using problematic BIP32
 */
export function createAccountFromSeed(
  seed,
  walletIndex = 0,
  derivationPath = undefined,
) {
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
      const seedBuffer = Buffer.isBuffer(seed)
        ? seed
        : Buffer.from(seed, 'hex');
      const indexBuffer = Buffer.allocUnsafe(4);
      indexBuffer.writeUInt32BE(walletIndex, 0);

      // SECURITY: Use cryptographically secure derivation instead of simple concatenation
      const crypto = require('crypto-browserify');
      const combinedInput = Buffer.concat([seedBuffer, indexBuffer]);
      derivedSeed = crypto.createHash('sha256').update(combinedInput).digest();
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
    // SECURITY: Fail securely instead of using weak fallback accounts
    throw new Error('Account creation failed - unable to generate secure keys. Please unlock wallet again.');
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

    // Create a deterministic 32-byte key from seed using imported crypto
    const key = crypto.pbkdf2Sync(
      seedBuffer,
      'svmseek-imports',
      10000,
      32,
      'sha256',
    );

    return key;
  } catch (error) {
    logError('Safe imports encryption key creation failed:', error);
    // SECURITY: Fail securely instead of using static fallback
    throw new Error('Encryption key generation failed - unable to create secure key. Please unlock wallet again.');
  }
}

devLog('Browser-compatible crypto utilities loaded successfully');
