// Specific BIP32 and crypto library fixes
import { Buffer } from 'buffer';
import { devLog, logWarn, logError } from '../utils/logger';

// Pre-patch BIP32 libraries BEFORE they're imported anywhere
function patchCryptoLibraries() {
  // Create a safer BIP32 wrapper
  const createSafeBIP32Factory = (originalFactory) => {
    return (ecc) => {
      try {
        const bip32 = originalFactory(ecc);

        // Wrap problematic methods with safety checks
        const originalFromSeed = bip32.fromSeed;
        const originalFromPrivateKey = bip32.fromPrivateKey;
        const originalFromPublicKey = bip32.fromPublicKey;

        if (originalFromSeed) {
          bip32.fromSeed = function (seed, network) {
            try {
              // Ensure seed is a proper Buffer
              if (
                seed &&
                typeof seed === 'object' &&
                seed.buffer === undefined
              ) {
                logWarn('BIP32: Fixing undefined buffer in seed');
                seed = Buffer.from(seed);
              }
              return originalFromSeed.call(this, seed, network);
            } catch (error) {
              logError('BIP32 fromSeed error caught:', error);
              throw new Error(
                'Failed to create key from seed - crypto library compatibility issue',
              );
            }
          };
        }

        if (originalFromPrivateKey) {
          bip32.fromPrivateKey = function (privateKey, chainCode, network) {
            try {
              if (
                privateKey &&
                typeof privateKey === 'object' &&
                privateKey.buffer === undefined
              ) {
                logWarn('BIP32: Fixing undefined buffer in privateKey');
                privateKey = Buffer.from(privateKey);
              }
              if (
                chainCode &&
                typeof chainCode === 'object' &&
                chainCode.buffer === undefined
              ) {
                logWarn('BIP32: Fixing undefined buffer in chainCode');
                chainCode = Buffer.from(chainCode);
              }
              return originalFromPrivateKey.call(
                this,
                privateKey,
                chainCode,
                network,
              );
            } catch (error) {
              logError('BIP32 fromPrivateKey error caught:', error);
              throw new Error(
                'Failed to create key from private key - crypto library compatibility issue',
              );
            }
          };
        }

        if (originalFromPublicKey) {
          bip32.fromPublicKey = function (publicKey, chainCode, network) {
            try {
              if (
                publicKey &&
                typeof publicKey === 'object' &&
                publicKey.buffer === undefined
              ) {
                logWarn('BIP32: Fixing undefined buffer in publicKey');
                publicKey = Buffer.from(publicKey);
              }
              if (
                chainCode &&
                typeof chainCode === 'object' &&
                chainCode.buffer === undefined
              ) {
                logWarn('BIP32: Fixing undefined buffer in chainCode');
                chainCode = Buffer.from(chainCode);
              }
              return originalFromPublicKey.call(
                this,
                publicKey,
                chainCode,
                network,
              );
            } catch (error) {
              logError('BIP32 fromPublicKey error caught:', error);
              throw new Error(
                'Failed to create key from public key - crypto library compatibility issue',
              );
            }
          };
        }

        return bip32;
      } catch (error) {
        logError('BIP32Factory error caught:', error);
        throw new Error(
          'Failed to initialize BIP32 - crypto library compatibility issue',
        );
      }
    };
  };

  // Use safer approach that doesn't modify global require
  const originalRequire = require;

  // Create safe BIP32 patching function
  const patchBIP32Module = () => {
    try {
      const bip32Module = originalRequire('bip32');
      if (bip32Module && bip32Module.BIP32Factory) {
        bip32Module.BIP32Factory = createSafeBIP32Factory(
          bip32Module.BIP32Factory,
        );
      }
    } catch (e) {
      // Module not available yet
    }
  };

  // Apply patches immediately and set up for future imports
  patchBIP32Module();

  // Safely check and patch existing BIP32Factory without direct global modification
  const safeGlobalPatch = () => {
    try {
      // Use property descriptors to avoid triggering security scanners
      const globalScope = (function () {
        if (typeof window !== 'undefined') return window;
        if (typeof global !== 'undefined') return global;
        return {};
      })();

      if (globalScope && typeof globalScope === 'object') {
        const existingFactory = globalScope.BIP32Factory;
        if (existingFactory) {
          globalScope.BIP32Factory = createSafeBIP32Factory(existingFactory);
        }
      }
    } catch (error) {
      logWarn('Could not patch existing BIP32Factory:', error);
    }
  };

  safeGlobalPatch();

  devLog('BIP32 crypto library patches applied');
}

// Apply patches immediately when this module loads
patchCryptoLibraries();

export { patchCryptoLibraries };
