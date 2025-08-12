import { pbkdf2 } from 'crypto-browserify';
import { randomBytes, secretbox } from 'tweetnacl';
import bs58 from 'bs58';
import { EventEmitter } from 'events';
import { isExtension } from './utils';
import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import { safeCreateImportsEncryptionKey } from './crypto-browser-compatible';
import { logError } from './logger';

export async function generateMnemonicAndSeed() {
  const bip39 = await import('bip39');
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString('hex') };
}

export async function mnemonicToSeed(mnemonic) {
  const bip39 = await import('bip39');
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString('hex');
}

async function getExtensionUnlockedMnemonic() {
  if (!isExtension) {
    return null;
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        channel: 'ccai_extension_mnemonic_channel',
        method: 'get',
      },
      resolve,
    );
  });
}

const EMPTY_MNEMONIC = {
  mnemonic: null,
  seed: null,
  importsEncryptionKey: null,
  derivationPath: null,
};

let unlockedMnemonicAndSeed = (async () => {
  const mnemonic = await getExtensionUnlockedMnemonic();

  let stored = null;

  // SECURITY: Safe JSON parsing with comprehensive validation for mnemonic storage data
  try {
    const rawData = mnemonic ||
      sessionStorage.getItem('unlocked') ||
      localStorage.getItem('unlocked') ||
      'null';
    
    if (!rawData || typeof rawData !== 'string') {
      return EMPTY_MNEMONIC;
    }
    
    stored = JSON.parse(rawData);
    
    // Validate stored data structure for security
    if (stored && typeof stored === 'object' && stored !== null) {
      // Validate required fields if not null/empty
      if (stored.seed !== undefined && (typeof stored.seed !== 'string' || stored.seed.length === 0)) {
        logError('Invalid stored seed format detected');
        return EMPTY_MNEMONIC;
      }
      if (stored.mnemonic !== undefined && (typeof stored.mnemonic !== 'string' || stored.mnemonic.length === 0)) {
        logError('Invalid stored mnemonic format detected');
        return EMPTY_MNEMONIC;
      }
    }
  } catch (e) {
    logError('Failed to parse stored mnemonic data - corrupted storage:', e);
    return EMPTY_MNEMONIC;
  }

  if (stored === null) {
    return EMPTY_MNEMONIC;
  }

  return {
    importsEncryptionKey: deriveImportsEncryptionKey(stored.seed),
    ...stored,
  };
})();

export const walletSeedChanged = new EventEmitter();

export function getUnlockedMnemonicAndSeed() {
  return unlockedMnemonicAndSeed;
}

export function useUnlockedMnemonicAndSeed() {
  const [currentUnlockedMnemonic, setCurrentUnlockedMnemonic] = useState(null);

  useEffect(() => {
    walletSeedChanged.addListener('change', setCurrentUnlockedMnemonic);
    unlockedMnemonicAndSeed.then(setCurrentUnlockedMnemonic);
    return () => {
      walletSeedChanged.removeListener('change', setCurrentUnlockedMnemonic);
    };
  }, []);

  return !currentUnlockedMnemonic
    ? [EMPTY_MNEMONIC, true]
    : [currentUnlockedMnemonic, false];
}

export function useHasLockedMnemonicAndSeed() {
  const [unlockedMnemonic, loading] = useUnlockedMnemonicAndSeed();

  return [!unlockedMnemonic.seed && !!localStorage.getItem('locked'), loading];
}

function setUnlockedMnemonicAndSeed(
  mnemonic,
  seed,
  importsEncryptionKey,
  derivationPath,
) {
  const data = {
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath,
  };
  unlockedMnemonicAndSeed = Promise.resolve(data);
  walletSeedChanged.emit('change', data);
}

export async function storeMnemonicAndSeed(
  mnemonic,
  seed,
  password,
  derivationPath,
) {
  const plaintext = JSON.stringify({ mnemonic, seed, derivationPath });
  if (password) {
    const salt = randomBytes(16);
    const kdf = 'pbkdf2';
    const iterations = 100000;
    const digest = 'sha256';
    const key = await deriveEncryptionKey(password, salt, iterations, digest);
    const nonce = randomBytes(secretbox.nonceLength);
    const encrypted = secretbox(Buffer.from(plaintext), nonce, key);
    localStorage.setItem(
      'locked',
      JSON.stringify({
        encrypted: bs58.encode(encrypted),
        nonce: bs58.encode(nonce),
        kdf,
        salt: bs58.encode(salt),
        iterations,
        digest,
      }),
    );
    localStorage.removeItem('unlocked');
    sessionStorage.removeItem('unlocked');
  } else {
    localStorage.setItem('unlocked', plaintext);
    localStorage.removeItem('locked');
  }
  sessionStorage.removeItem('unlocked');
  if (isExtension) {
    chrome.runtime.sendMessage({
      channel: 'ccai_extension_mnemonic_channel',
      method: 'set',
      data: '',
    });
  }

  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath,
  );
}

export const checkIsCorrectPassword = async (password) => {
  // SECURITY: Safe JSON parsing with validation for locked storage data
  let lockedData;
  try {
    const lockedRaw = localStorage.getItem('locked');
    if (!lockedRaw) {
      throw new Error('No locked wallet found');
    }
    lockedData = JSON.parse(lockedRaw);
    
    // Validate required fields exist
    if (!lockedData.encrypted || !lockedData.nonce || !lockedData.salt) {
      throw new Error('Invalid locked wallet data structure');
    }
  } catch (error) {
    logError('Failed to parse locked wallet data:', error);
    throw new Error('Corrupted wallet data. Please restore from backup.');
  }

  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = lockedData;

  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error('Incorrect password');
  }

  const decodedPlaintext = Buffer.from(plaintext).toString();
  
  // SECURITY: Safe JSON parsing with validation for decrypted wallet data
  let walletData;
  try {
    walletData = JSON.parse(decodedPlaintext);
    
    // Validate required wallet fields exist
    if (!walletData.mnemonic || !walletData.seed) {
      throw new Error('Invalid wallet data structure');
    }
  } catch (error) {
    logError('Failed to parse decrypted wallet data:', error);
    throw new Error('Corrupted wallet data. Please restore from backup.');
  }
  
  const { mnemonic, seed, derivationPath } = walletData;

  return { mnemonic, seed, derivationPath };
};

export async function loadMnemonicAndSeed(password, stayLoggedIn) {
  // SECURITY: Safe JSON parsing with validation for locked storage data
  let lockedData;
  try {
    const lockedRaw = localStorage.getItem('locked');
    if (!lockedRaw) {
      throw new Error('No locked wallet found');
    }
    lockedData = JSON.parse(lockedRaw);
    
    // Validate required fields exist
    if (!lockedData.encrypted || !lockedData.nonce || !lockedData.salt) {
      throw new Error('Invalid locked wallet data structure');
    }
  } catch (error) {
    logError('Failed to parse locked wallet data:', error);
    throw new Error('Corrupted wallet data. Please restore from backup.');
  }

  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = lockedData;
  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error('Incorrect password');
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  
  // SECURITY: Safe JSON parsing with validation for decrypted wallet data
  let walletData;
  try {
    walletData = JSON.parse(decodedPlaintext);
    
    // Validate required wallet fields exist
    if (!walletData.mnemonic || !walletData.seed) {
      throw new Error('Invalid wallet data structure');
    }
  } catch (error) {
    logError('Failed to parse decrypted wallet data:', error);
    throw new Error('Corrupted wallet data. Please restore from backup.');
  }
  
  const { mnemonic, seed, derivationPath } = walletData;
  if (stayLoggedIn) {
    if (isExtension) {
      chrome.runtime.sendMessage({
        channel: 'ccai_extension_mnemonic_channel',
        method: 'set',
        data: decodedPlaintext,
      });
    }
  } else {
    sessionStorage.setItem('unlocked', decodedPlaintext);
  }
  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath,
  );
  return { mnemonic, seed, derivationPath };
}

async function deriveEncryptionKey(password, salt, iterations, digest) {
  return new Promise((resolve, reject) =>
    pbkdf2(
      password,
      salt,
      iterations,
      secretbox.keyLength,
      digest,
      (err, key) => (err ? reject(err) : resolve(key)),
    ),
  );
}

export function lockWallet() {
  setUnlockedMnemonicAndSeed(null, null, null, null);
}

// Returns the 32 byte key used to encrypt imported private keys.
function deriveImportsEncryptionKey(seed) {
  try {
    return safeCreateImportsEncryptionKey(seed);
  } catch (error) {
    logError('deriveImportsEncryptionKey failed:', error);
    throw new Error(
      'Unable to create encryption key: import key derivation failed. Please check your wallet configuration.',
    );
  }
}

export function reloadWallet() {
  if (isExtension) {
    chrome.runtime.sendMessage({
      channel: 'ccai_extension_mnemonic_channel',
      method: 'set',
      data: '',
    });
    sessionStorage.removeItem('unlocked');
    chrome.runtime.reload();
  } else {
    window.location.reload();
  }
}

export function forgetWallet() {
  localStorage.clear();
  sessionStorage.removeItem('unlocked');
  unlockedMnemonicAndSeed = {
    mnemonic: null,
    seed: null,
    importsEncryptionKey: null,
  };
  walletSeedChanged.emit('change', unlockedMnemonicAndSeed);
  reloadWallet();
}
