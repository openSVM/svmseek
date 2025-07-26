// Specific BIP32 and crypto library fixes
import { Buffer } from 'buffer';

// Pre-patch BIP32 libraries BEFORE they're imported anywhere
function patchCryptoLibraries() {
  // Store original BIP32 constructor if it exists
  let originalBIP32Factory;
  
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
          bip32.fromSeed = function(seed, network) {
            try {
              // Ensure seed is a proper Buffer
              if (seed && typeof seed === 'object' && seed.buffer === undefined) {
                console.warn('BIP32: Fixing undefined buffer in seed');
                seed = Buffer.from(seed);
              }
              return originalFromSeed.call(this, seed, network);
            } catch (error) {
              console.error('BIP32 fromSeed error caught:', error);
              throw new Error('Failed to create key from seed - crypto library compatibility issue');
            }
          };
        }
        
        if (originalFromPrivateKey) {
          bip32.fromPrivateKey = function(privateKey, chainCode, network) {
            try {
              if (privateKey && typeof privateKey === 'object' && privateKey.buffer === undefined) {
                console.warn('BIP32: Fixing undefined buffer in privateKey');
                privateKey = Buffer.from(privateKey);
              }
              if (chainCode && typeof chainCode === 'object' && chainCode.buffer === undefined) {
                console.warn('BIP32: Fixing undefined buffer in chainCode');
                chainCode = Buffer.from(chainCode);
              }
              return originalFromPrivateKey.call(this, privateKey, chainCode, network);
            } catch (error) {
              console.error('BIP32 fromPrivateKey error caught:', error);
              throw new Error('Failed to create key from private key - crypto library compatibility issue');
            }
          };
        }
        
        if (originalFromPublicKey) {
          bip32.fromPublicKey = function(publicKey, chainCode, network) {
            try {
              if (publicKey && typeof publicKey === 'object' && publicKey.buffer === undefined) {
                console.warn('BIP32: Fixing undefined buffer in publicKey');
                publicKey = Buffer.from(publicKey);
              }
              if (chainCode && typeof chainCode === 'object' && chainCode.buffer === undefined) {
                console.warn('BIP32: Fixing undefined buffer in chainCode');
                chainCode = Buffer.from(chainCode);
              }
              return originalFromPublicKey.call(this, publicKey, chainCode, network);
            } catch (error) {
              console.error('BIP32 fromPublicKey error caught:', error);
              throw new Error('Failed to create key from public key - crypto library compatibility issue');
            }
          };
        }
        
        return bip32;
      } catch (error) {
        console.error('BIP32Factory error caught:', error);
        throw new Error('Failed to initialize BIP32 - crypto library compatibility issue');
      }
    };
  };
  
  // Use module system to intercept BIP32 imports
  const moduleCache = require.cache || {};
  const originalRequire = require;
  
  // Override module resolution for BIP32
  require = function(id) {
    if (id === 'bip32') {
      const originalModule = originalRequire(id);
      if (originalModule && originalModule.BIP32Factory) {
        originalModule.BIP32Factory = createSafeBIP32Factory(originalModule.BIP32Factory);
      }
      return originalModule;
    }
    return originalRequire(id);
  };

  // Also patch if BIP32Factory is already loaded
  try {
    if (typeof window !== 'undefined' && window.BIP32Factory) {
      window.BIP32Factory = createSafeBIP32Factory(window.BIP32Factory);
    }
    if (typeof global !== 'undefined' && global.BIP32Factory) {
      global.BIP32Factory = createSafeBIP32Factory(global.BIP32Factory);
    }
  } catch (error) {
    console.warn('Could not patch existing BIP32Factory:', error);
  }
  
  console.log('BIP32 crypto library patches applied');
}

// Apply patches immediately when this module loads
patchCryptoLibraries();

export { patchCryptoLibraries };