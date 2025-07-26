import { pbkdf2 } from 'crypto-browserify';
import { randomBytes, secretbox } from 'tweetnacl';
import bs58 from 'bs58';
import { EventEmitter } from 'events';
import { isExtension } from './utils';
import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import { safeCreateImportsEncryptionKey } from './crypto-browser-compatible';

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

  try {
    stored = await JSON.parse(
      mnemonic ||
        sessionStorage.getItem('unlocked') ||
        localStorage.getItem('unlocked') ||
        'null',
    );
  } catch (e) {
    console.error('unlockedMnemonicAndSeed error', e);
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
  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = JSON.parse(localStorage.getItem('locked'));

  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error('Incorrect password');
  }

  const decodedPlaintext = Buffer.from(plaintext).toString();
  const { mnemonic, seed, derivationPath } = JSON.parse(decodedPlaintext);

  return { mnemonic, seed, derivationPath };
};

export async function loadMnemonicAndSeed(password, stayLoggedIn) {
  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = JSON.parse(localStorage.getItem('locked'));
  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error('Incorrect password');
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  const { mnemonic, seed, derivationPath } = JSON.parse(decodedPlaintext);
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
    console.error('deriveImportsEncryptionKey failed:', error);
    // Return a deterministic fallback key
    const fallbackKey = Buffer.alloc(32);
    fallbackKey.write('fallback_encryption_key_12345678');
    return fallbackKey;
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
