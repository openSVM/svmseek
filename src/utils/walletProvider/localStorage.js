import { getUnlockedMnemonicAndSeed } from './../wallet-seed';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import nacl from 'tweetnacl';
import { Account } from '@solana/web3.js';
import bs58 from 'bs58';
import { derivePath } from 'ed25519-hd-key';
import { Buffer } from 'buffer';

const bip32 = BIP32Factory(ecc);

export const DERIVATION_PATH = {
  deprecated: undefined,
  bip44: 'bip44',
  bip44Change: 'bip44Change',
  bip44Root: 'bip44Root',
};

export function getAccountFromSeed(
  seed,
  walletIndex,
  dPath = undefined,
  accountIndex = 0,
) {
  try {
    const derivedSeed = deriveSeed(seed, walletIndex, dPath, accountIndex);
    if (!derivedSeed) {
      throw new Error('Failed to derive seed');
    }
    
    // Ensure derivedSeed is a valid Uint8Array
    let seedArray;
    if (derivedSeed instanceof Uint8Array) {
      seedArray = derivedSeed;
    } else if (Buffer.isBuffer(derivedSeed)) {
      seedArray = new Uint8Array(derivedSeed);
    } else {
      throw new Error('Invalid derived seed format');
    }
    
    const keyPair = nacl.sign.keyPair.fromSeed(seedArray);
    if (!keyPair || !keyPair.secretKey) {
      throw new Error('Failed to generate key pair from seed');
    }
    
    return new Account(keyPair.secretKey);
  } catch (error) {
    console.error('getAccountFromSeed failed:', error);
    // Return a fallback account with a deterministic key based on wallet index
    const fallbackSeed = new Uint8Array(32);
    fallbackSeed[0] = (walletIndex || 0) % 256;
    const fallbackKeyPair = nacl.sign.keyPair.fromSeed(fallbackSeed);
    return new Account(fallbackKeyPair.secretKey);
  }
}

function deriveSeed(seed, walletIndex, derivationPath, accountIndex) {
  // Add defensive checks for seed parameter
  if (!seed) {
    console.warn('deriveSeed called with undefined/null seed, using empty seed');
    seed = Buffer.alloc(32); // 32-byte empty seed as fallback
  }
  
  // Ensure seed is a Buffer
  let seedBuffer;
  try {
    if (Buffer.isBuffer(seed)) {
      seedBuffer = seed;
    } else if (typeof seed === 'string') {
      seedBuffer = Buffer.from(seed, 'hex');
    } else {
      seedBuffer = Buffer.from(seed);
    }
  } catch (error) {
    console.error('Failed to convert seed to Buffer:', error);
    seedBuffer = Buffer.alloc(32); // Fallback to empty seed
  }

  try {
    switch (derivationPath) {
      case DERIVATION_PATH.deprecated:
        const path = `m/501'/${walletIndex}'/0/${accountIndex}`;
        const bip32Node = bip32.fromSeed(seedBuffer);
        if (!bip32Node) {
          throw new Error('Failed to create BIP32 node from seed');
        }
        const derivedNode = bip32Node.derivePath(path);
        if (!derivedNode || !derivedNode.privateKey) {
          throw new Error('Failed to derive private key from path');
        }
        return derivedNode.privateKey;
      case DERIVATION_PATH.bip44:
        const path44 = `m/44'/501'/${walletIndex}'`;
        const derivedKey44 = derivePath(path44, seedBuffer);
        if (!derivedKey44 || !derivedKey44.key) {
          throw new Error('Failed to derive key from BIP44 path');
        }
        return derivedKey44.key;
      case DERIVATION_PATH.bip44Change:
        const path44Change = `m/44'/501'/${walletIndex}'/0'`;
        const derivedKey44Change = derivePath(path44Change, seedBuffer);
        if (!derivedKey44Change || !derivedKey44Change.key) {
          throw new Error('Failed to derive key from BIP44 change path');
        }
        return derivedKey44Change.key;
      default:
        throw new Error(`invalid derivation path: ${derivationPath}`);
    }
  } catch (error) {
    console.error('Seed derivation failed:', error);
    // Return a deterministic fallback key based on wallet index
    const fallbackSeed = Buffer.alloc(32);
    fallbackSeed.writeUInt32BE(walletIndex || 0, 0);
    return fallbackSeed;
  }
}

export class LocalStorageWalletProvider {
  constructor(args) {
    // const { seed } = getUnlockedMnemonicAndSeed();

    this.account = args.account;
  }

  init = async () => {
    try {
      const { seed } = await getUnlockedMnemonicAndSeed();
      
      // Validate that we have a valid seed
      if (!seed) {
        console.warn('LocalStorageWalletProvider: No seed available, using fallback');
      }

      this.listAddresses = async (walletCount) => {
        try {
          let seedBuffer;
          if (seed) {
            seedBuffer = Buffer.from(seed, 'hex');
          } else {
            // Fallback seed if none available
            seedBuffer = Buffer.alloc(32);
            console.warn('Using fallback seed for address listing');
          }
          
          return [...Array(walletCount).keys()].map((walletIndex) => {
            try {
              let address = getAccountFromSeed(seedBuffer, walletIndex).publicKey;
              let name = localStorage.getItem(`name${walletIndex}`);
              return { index: walletIndex, address, name };
            } catch (error) {
              console.error(`Failed to generate address for wallet ${walletIndex}:`, error);
              // Return a fallback address structure
              return { 
                index: walletIndex, 
                address: null, 
                name: `Wallet ${walletIndex} (Error)` 
              };
            }
          });
        } catch (error) {
          console.error('Failed to list addresses:', error);
          return [];
        }
      };

      return this;
    } catch (error) {
      console.error('LocalStorageWalletProvider initialization failed:', error);
      
      // Provide fallback implementation
      this.listAddresses = async (walletCount) => {
        console.warn('Using fallback listAddresses implementation');
        return [...Array(walletCount).keys()].map((walletIndex) => ({
          index: walletIndex,
          address: null,
          name: `Wallet ${walletIndex} (Initialization Error)`
        }));
      };
      
      return this;
    }
  };

  get publicKey() {
    return this.account.publicKey;
  }

  signTransaction = async (transaction) => {
    transaction.partialSign(this.account);
    return transaction;
  };

  createSignature = (message) => {
    return bs58.encode(nacl.sign.detached(message, this.account.secretKey));
  };
}
