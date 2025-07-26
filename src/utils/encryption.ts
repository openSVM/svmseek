import { pbkdf2 } from 'crypto-browserify';
import { randomBytes, secretbox } from 'tweetnacl';
import bs58 from 'bs58';
import { scrypt } from 'scrypt-js';
import argon2 from 'argon2-browser';
import { Buffer } from 'buffer';

/**
 * Cryptographic configuration interface for KDF parameters
 */
export interface CryptoConfig {
  kdf: 'pbkdf2' | 'scrypt' | 'argon2';
  iterations: number;
  digest: 'sha256' | 'sha512';
  saltLength: number;
  keyLength: number;
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  encrypted: string;
  nonce: string;
  kdf: string;
  salt: string;
  iterations: number;
  digest: string;
  version: number;
}

/**
 * Supported KDF configurations with future-proof versioning
 */
export const CRYPTO_CONFIGS: Record<number, CryptoConfig> = {
  1: {
    kdf: 'pbkdf2',
    iterations: 100000,
    digest: 'sha256',
    saltLength: 16,
    keyLength: 32,
  },
  2: {
    kdf: 'pbkdf2',
    iterations: 200000,
    digest: 'sha512',
    saltLength: 32,
    keyLength: 32,
  },
  3: {
    kdf: 'scrypt',
    iterations: 16384, // N parameter for scrypt
    digest: 'sha256', // Not used for scrypt
    saltLength: 32,
    keyLength: 32,
  },
  4: {
    kdf: 'argon2',
    iterations: 3, // Number of passes
    digest: 'sha256', // Not used for argon2
    saltLength: 32,
    keyLength: 32,
  },
  // Future versions can add more configurations
};

// Current version (can be updated for new installations)
export const CURRENT_CRYPTO_VERSION = 4;

/**
 * Abstract base class for encryption providers
 */
export abstract class EncryptionProvider {
  public readonly config: CryptoConfig;
  
  constructor(config: CryptoConfig) {
    this.config = config;
  }

  abstract deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array>;
  
  generateSalt(): Uint8Array {
    return randomBytes(this.config.saltLength);
  }
  
  generateNonce(): Uint8Array {
    return randomBytes(secretbox.nonceLength);
  }
  
  encrypt(plaintext: string, key: Uint8Array): { encrypted: Uint8Array; nonce: Uint8Array } {
    const nonce = this.generateNonce();
    const encrypted = secretbox(Buffer.from(plaintext), nonce, key);
    return { encrypted, nonce };
  }
  
  decrypt(encrypted: Uint8Array, nonce: Uint8Array, key: Uint8Array): string | null {
    const decrypted = secretbox.open(encrypted, nonce, key);
    if (!decrypted) return null;
    return Buffer.from(decrypted).toString();
  }
}

/**
 * PBKDF2-based encryption provider
 */
export class PBKDF2Provider extends EncryptionProvider {
  async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      pbkdf2(
        password,
        salt,
        this.config.iterations,
        this.config.keyLength,
        this.config.digest,
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(new Uint8Array(derivedKey));
        }
      );
    });
  }
}

/**
 * Scrypt-based encryption provider
 */
export class ScryptProvider extends EncryptionProvider {
  async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const passwordBuffer = Buffer.from(password, 'utf8');
    const N = this.config.iterations; // Cost parameter
    const r = 8; // Block size parameter
    const p = 1; // Parallelization parameter
    
    return scrypt(passwordBuffer, salt, N, r, p, this.config.keyLength);
  }
}

/**
 * Argon2-based encryption provider
 */
export class Argon2Provider extends EncryptionProvider {
  async deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
    try {
      const result = await argon2.hash({
        pass: password,
        salt: salt,
        time: this.config.iterations, // Number of passes
        mem: 64 * 1024, // Memory usage in KB (64MB)
        hashLen: this.config.keyLength,
        parallelism: 1,
        type: argon2.ArgonType.Argon2id, // Use Argon2id (most secure variant)
      });
      
      return new Uint8Array(result.hash);
    } catch (error) {
      throw new Error(`Argon2 key derivation failed: ${error}`);
    }
  }
}

/**
 * Factory for creating encryption providers
 */
export class EncryptionProviderFactory {
  static create(config: CryptoConfig): EncryptionProvider {
    switch (config.kdf) {
      case 'pbkdf2':
        return new PBKDF2Provider(config);
      case 'scrypt':
        return new ScryptProvider(config);
      case 'argon2':
        return new Argon2Provider(config);
      default:
        throw new Error(`Unsupported KDF: ${config.kdf}`);
    }
  }
  
  static createFromVersion(version: number): EncryptionProvider {
    const config = CRYPTO_CONFIGS[version];
    if (!config) {
      throw new Error(`Unsupported crypto version: ${version}`);
    }
    return this.create(config);
  }
}

/**
 * Main encryption manager with version support and migration capabilities
 */
export class WalletEncryptionManager {
  private provider: EncryptionProvider;
  private version: number;
  
  constructor(version: number = CURRENT_CRYPTO_VERSION) {
    this.version = version;
    this.provider = EncryptionProviderFactory.createFromVersion(version);
  }
  
  /**
   * Encrypt wallet data with current encryption settings
   */
  async encrypt(plaintext: string, password: string): Promise<EncryptedData> {
    const salt = this.provider.generateSalt();
    const key = await this.provider.deriveKey(password, salt);
    const { encrypted, nonce } = this.provider.encrypt(plaintext, key);
    
    return {
      encrypted: bs58.encode(encrypted),
      nonce: bs58.encode(nonce),
      kdf: this.provider.config.kdf,
      salt: bs58.encode(salt),
      iterations: this.provider.config.iterations,
      digest: this.provider.config.digest,
      version: this.version,
    };
  }
  
  /**
   * Decrypt wallet data, automatically handling different versions
   */
  async decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
    // Use the version from the encrypted data to ensure compatibility
    const provider = EncryptionProviderFactory.createFromVersion(
      encryptedData.version || 1 // Default to v1 for legacy data
    );
    
    const encrypted = bs58.decode(encryptedData.encrypted);
    const nonce = bs58.decode(encryptedData.nonce);
    const salt = bs58.decode(encryptedData.salt);
    
    const key = await provider.deriveKey(password, salt);
    const plaintext = provider.decrypt(encrypted, nonce, key);
    
    if (!plaintext) {
      throw new Error('Decryption failed - incorrect password');
    }
    
    return plaintext;
  }
  
  /**
   * Check if encrypted data needs migration to newer version
   */
  needsMigration(encryptedData: EncryptedData): boolean {
    const dataVersion = encryptedData.version || 1;
    return dataVersion < CURRENT_CRYPTO_VERSION;
  }
  
  /**
   * Migrate encrypted data to current version
   */
  async migrate(encryptedData: EncryptedData, password: string): Promise<EncryptedData> {
    if (!this.needsMigration(encryptedData)) {
      return encryptedData;
    }
    
    // Decrypt with old version
    const plaintext = await this.decrypt(encryptedData, password);
    
    // Re-encrypt with current version
    const newManager = new WalletEncryptionManager(CURRENT_CRYPTO_VERSION);
    return await newManager.encrypt(plaintext, password);
  }
  
  /**
   * Verify password without full decryption (for quick validation)
   */
  async verifyPassword(encryptedData: EncryptedData, password: string): Promise<boolean> {
    try {
      await this.decrypt(encryptedData, password);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get security information about the encryption
   */
  getSecurityInfo(): {
    version: number;
    kdf: string;
    iterations: number;
    digest: string;
    estimatedCrackTime: string;
  } {
    const config = CRYPTO_CONFIGS[this.version];
    
    // Rough estimates for educational purposes
    const estimatedCrackTime = (() => {
      switch (config.kdf) {
        case 'argon2':
          return 'millennia (with current hardware)';
        case 'scrypt':
          return 'centuries (with current hardware)';
        case 'pbkdf2':
          return config.iterations >= 200000 
            ? 'centuries (with current hardware)' 
            : 'decades (with current hardware)';
        default:
          return 'unknown';
      }
    })();
    
    return {
      version: this.version,
      kdf: config.kdf,
      iterations: config.iterations,
      digest: config.digest,
      estimatedCrackTime,
    };
  }
}

/**
 * Singleton instance for application-wide use
 */
export const walletEncryption = new WalletEncryptionManager();

/**
 * Legacy function adapter for backward compatibility
 */
export async function deriveEncryptionKey(
  password: string, 
  salt: Uint8Array, 
  iterations: number = 100000, 
  digest: string = 'sha256'
): Promise<Uint8Array> {
  const config: CryptoConfig = {
    kdf: 'pbkdf2',
    iterations,
    digest: digest as 'sha256' | 'sha512',
    saltLength: salt.length,
    keyLength: 32,
  };
  
  const provider = new PBKDF2Provider(config);
  return provider.deriveKey(password, salt);
}

/**
 * Utility functions for key management
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const bytes = randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i] % charset.length];
  }
  
  return result;
}

export function estimatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  estimatedCrackTime: string;
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  else feedback.push('Add special characters');
  
  const estimatedCrackTime = score >= 6 ? 'centuries' : 
                            score >= 4 ? 'years' : 
                            score >= 2 ? 'days' : 'minutes';
  
  return { score, feedback, estimatedCrackTime };
}