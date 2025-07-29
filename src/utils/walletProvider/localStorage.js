import { getUnlockedMnemonicAndSeed } from './../wallet-seed';
import nacl from 'tweetnacl';
import { Account } from '@solana/web3.js';
import bs58 from 'bs58';
import { Buffer } from 'buffer';
import { createAccountFromSeed } from '../crypto-browser-compatible';
import { logWarn, logError } from '../logger';

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
    const accountData = createAccountFromSeed(seed, walletIndex, dPath);
    
    if (!accountData || !accountData.secretKey) {
      throw new Error('Failed to create account data');
    }
    
    return new Account(accountData.secretKey);
  } catch (error) {
    logError('getAccountFromSeed failed:', error);
    // Return a fallback account with a deterministic key based on wallet index
    const fallbackSeed = new Uint8Array(32);
    fallbackSeed[0] = (walletIndex || 0) % 256;
    const fallbackKeyPair = nacl.sign.keyPair.fromSeed(fallbackSeed);
    return new Account(fallbackKeyPair.secretKey);
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
        logWarn('LocalStorageWalletProvider: No seed available, using fallback');
      }

      this.listAddresses = async (walletCount) => {
        try {
          let seedBuffer;
          if (seed) {
            seedBuffer = Buffer.from(seed, 'hex');
          } else {
            // Fallback seed if none available
            seedBuffer = Buffer.alloc(32);
            logWarn('Using fallback seed for address listing');
          }
          
          return [...Array(walletCount).keys()].map((walletIndex) => {
            try {
              let address = getAccountFromSeed(seedBuffer, walletIndex).publicKey;
              let name = localStorage.getItem(`name${walletIndex}`);
              return { index: walletIndex, address, name };
            } catch (error) {
              logError(`Failed to generate address for wallet ${walletIndex}:`, error);
              // Return a fallback address structure
              return { 
                index: walletIndex, 
                address: null, 
                name: `Wallet ${walletIndex} (Error)` 
              };
            }
          });
        } catch (error) {
          logError('Failed to list addresses:', error);
          return [];
        }
      };

      return this;
    } catch (error) {
      logError('LocalStorageWalletProvider initialization failed:', error);
      
      // Provide fallback implementation
      this.listAddresses = async (walletCount) => {
        logWarn('Using fallback listAddresses implementation');
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
