import {
  WalletEncryptionManager,
  EncryptionProviderFactory,
  PBKDF2Provider,
  CRYPTO_CONFIGS,
  CURRENT_CRYPTO_VERSION,
  generateSecurePassword,
  estimatePasswordStrength,
  walletEncryption,
} from '../encryption';

describe('PBKDF2Provider', () => {
  test('derives key from password and salt', async () => {
    const config = CRYPTO_CONFIGS[1];
    const provider = new PBKDF2Provider(config);
    
    const password = 'test-password';
    const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    
    const key = await provider.deriveKey(password, salt);
    
    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.length).toBe(32);
  });

  test('derives same key for same input', async () => {
    const config = CRYPTO_CONFIGS[1];
    const provider = new PBKDF2Provider(config);
    
    const password = 'test-password';
    const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    
    const key1 = await provider.deriveKey(password, salt);
    const key2 = await provider.deriveKey(password, salt);
    
    expect(key1).toEqual(key2);
  });

  test('derives different keys for different passwords', async () => {
    const config = CRYPTO_CONFIGS[1];
    const provider = new PBKDF2Provider(config);
    
    const salt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    
    const key1 = await provider.deriveKey('password1', salt);
    const key2 = await provider.deriveKey('password2', salt);
    
    expect(key1).not.toEqual(key2);
  });

  test('encrypts and decrypts data', async () => {
    const config = CRYPTO_CONFIGS[1];
    const provider = new PBKDF2Provider(config);
    
    const password = 'test-password';
    const salt = provider.generateSalt();
    const key = await provider.deriveKey(password, salt);
    
    const plaintext = 'Hello, World!';
    const { encrypted, nonce } = provider.encrypt(plaintext, key);
    const decrypted = provider.decrypt(encrypted, nonce, key);
    
    expect(decrypted).toBe(plaintext);
  });

  test('returns null for invalid decryption', async () => {
    const config = CRYPTO_CONFIGS[1];
    const provider = new PBKDF2Provider(config);
    
    const password = 'test-password';
    const salt = provider.generateSalt();
    const key = await provider.deriveKey(password, salt);
    
    const plaintext = 'Hello, World!';
    const { encrypted, nonce } = provider.encrypt(plaintext, key);
    
    // Use wrong key
    const wrongKey = await provider.deriveKey('wrong-password', salt);
    const decrypted = provider.decrypt(encrypted, nonce, wrongKey);
    
    expect(decrypted).toBeNull();
  });
});

describe('EncryptionProviderFactory', () => {
  test('creates PBKDF2 provider', () => {
    const config = CRYPTO_CONFIGS[1];
    const provider = EncryptionProviderFactory.create(config);
    
    expect(provider).toBeInstanceOf(PBKDF2Provider);
  });

  test('creates provider from version', () => {
    const provider = EncryptionProviderFactory.createFromVersion(1);
    
    expect(provider).toBeInstanceOf(PBKDF2Provider);
  });

  test('throws error for unsupported KDF', () => {
    const config = { ...CRYPTO_CONFIGS[1], kdf: 'unsupported' as any };
    
    expect(() => EncryptionProviderFactory.create(config)).toThrow('Unsupported KDF: unsupported');
  });

  test('throws error for unsupported version', () => {
    expect(() => EncryptionProviderFactory.createFromVersion(999)).toThrow('Unsupported crypto version: 999');
  });
});

describe('WalletEncryptionManager', () => {
  test('encrypts and decrypts wallet data', async () => {
    const manager = new WalletEncryptionManager();
    const password = 'secure-password-123!';
    const plaintext = JSON.stringify({ mnemonic: 'test mnemonic', seed: 'test seed' });
    
    const encryptedData = await manager.encrypt(plaintext, password);
    const decrypted = await manager.decrypt(encryptedData, password);
    
    expect(decrypted).toBe(plaintext);
  });

  test('fails decryption with wrong password', async () => {
    const manager = new WalletEncryptionManager();
    const password = 'secure-password-123!';
    const wrongPassword = 'wrong-password';
    const plaintext = JSON.stringify({ mnemonic: 'test mnemonic', seed: 'test seed' });
    
    const encryptedData = await manager.encrypt(plaintext, password);
    
    await expect(manager.decrypt(encryptedData, wrongPassword))
      .rejects.toThrow('Decryption failed - incorrect password');
  });

  test('verifies password correctly', async () => {
    const manager = new WalletEncryptionManager();
    const password = 'secure-password-123!';
    const plaintext = JSON.stringify({ mnemonic: 'test mnemonic', seed: 'test seed' });
    
    const encryptedData = await manager.encrypt(plaintext, password);
    
    const validPassword = await manager.verifyPassword(encryptedData, password);
    const invalidPassword = await manager.verifyPassword(encryptedData, 'wrong');
    
    expect(validPassword).toBe(true);
    expect(invalidPassword).toBe(false);
  });

  test('detects when migration is needed', async () => {
    const manager = new WalletEncryptionManager();
    
    const legacyData = {
      encrypted: 'test',
      nonce: 'test',
      kdf: 'pbkdf2',
      salt: 'test',
      iterations: 100000,
      digest: 'sha256',
      version: 1,
    };
    
    const needsMigration = manager.needsMigration(legacyData);
    expect(needsMigration).toBe(CURRENT_CRYPTO_VERSION > 1);
  });

  test('migrates data to current version', async () => {
    const oldManager = new WalletEncryptionManager(1);
    const newManager = new WalletEncryptionManager(CURRENT_CRYPTO_VERSION);
    
    const password = 'secure-password-123!';
    const plaintext = JSON.stringify({ mnemonic: 'test mnemonic', seed: 'test seed' });
    
    // Encrypt with old version
    const oldEncryptedData = await oldManager.encrypt(plaintext, password);
    
    // Migrate to new version
    const migratedData = await newManager.migrate(oldEncryptedData, password);
    
    expect(migratedData.version).toBe(CURRENT_CRYPTO_VERSION);
    
    // Should be able to decrypt with new manager
    const decrypted = await newManager.decrypt(migratedData, password);
    expect(decrypted).toBe(plaintext);
  });

  test('does not migrate if already current version', async () => {
    const manager = new WalletEncryptionManager();
    const password = 'secure-password-123!';
    const plaintext = JSON.stringify({ mnemonic: 'test mnemonic', seed: 'test seed' });
    
    const encryptedData = await manager.encrypt(plaintext, password);
    const migratedData = await manager.migrate(encryptedData, password);
    
    expect(migratedData).toEqual(encryptedData);
  });

  test('provides security information', () => {
    const manager = new WalletEncryptionManager();
    const securityInfo = manager.getSecurityInfo();
    
    expect(securityInfo).toHaveProperty('version');
    expect(securityInfo).toHaveProperty('kdf');
    expect(securityInfo).toHaveProperty('iterations');
    expect(securityInfo).toHaveProperty('digest');
    expect(securityInfo).toHaveProperty('estimatedCrackTime');
    
    expect(typeof securityInfo.version).toBe('number');
    expect(typeof securityInfo.kdf).toBe('string');
    expect(typeof securityInfo.iterations).toBe('number');
    expect(typeof securityInfo.digest).toBe('string');
    expect(typeof securityInfo.estimatedCrackTime).toBe('string');
  });

  test('handles legacy data without version', async () => {
    const manager = new WalletEncryptionManager();
    
    // Create legacy data structure (version 1 without version field)
    const legacyManager = new WalletEncryptionManager(1);
    const password = 'secure-password-123!';
    const plaintext = JSON.stringify({ mnemonic: 'test mnemonic', seed: 'test seed' });
    
    const legacyData = await legacyManager.encrypt(plaintext, password);
    delete (legacyData as any).version; // Remove version field to simulate legacy data
    
    // Should still be able to decrypt
    const decrypted = await manager.decrypt(legacyData, password);
    expect(decrypted).toBe(plaintext);
  });
});

describe('Utility Functions', () => {
  describe('generateSecurePassword', () => {
    test('generates password of specified length', () => {
      const password = generateSecurePassword(16);
      expect(password.length).toBe(16);
    });

    test('generates different passwords each time', () => {
      const password1 = generateSecurePassword();
      const password2 = generateSecurePassword();
      expect(password1).not.toBe(password2);
    });

    test('uses default length when not specified', () => {
      const password = generateSecurePassword();
      expect(password.length).toBe(32);
    });

    test('contains expected character types', () => {
      const password = generateSecurePassword(100); // Large password for better chance of all types
      
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/\d/);    // digits
      expect(password).toMatch(/[!@#$%^&*]/); // special chars
    });
  });

  describe('estimatePasswordStrength', () => {
    test('gives low score for weak passwords', () => {
      const result = estimatePasswordStrength('123');
      expect(result.score).toBeLessThan(3);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    test('gives high score for strong passwords', () => {
      const result = estimatePasswordStrength('MySecurePassword123!');
      expect(result.score).toBeGreaterThan(5);
    });

    test('provides helpful feedback', () => {
      const result = estimatePasswordStrength('password');
      
      expect(result.feedback).toContain('Add uppercase letters');
      expect(result.feedback).toContain('Add numbers');
      expect(result.feedback).toContain('Add special characters');
    });

    test('estimates crack time correctly', () => {
      const weak = estimatePasswordStrength('123');
      const strong = estimatePasswordStrength('MyVerySecurePassword123!@#');
      
      expect(strong.estimatedCrackTime).not.toBe(weak.estimatedCrackTime);
    });
  });
});

describe('Singleton Instance', () => {
  test('walletEncryption is properly configured', () => {
    expect(walletEncryption).toBeInstanceOf(WalletEncryptionManager);
  });

  test('can encrypt and decrypt with singleton', async () => {
    const password = 'test-password-123!';
    const plaintext = 'test data';
    
    const encrypted = await walletEncryption.encrypt(plaintext, password);
    const decrypted = await walletEncryption.decrypt(encrypted, password);
    
    expect(decrypted).toBe(plaintext);
  });
});

describe('Configuration Versions', () => {
  test('CRYPTO_CONFIGS contains valid configurations', () => {
    Object.values(CRYPTO_CONFIGS).forEach(config => {
      expect(config).toHaveProperty('kdf');
      expect(config).toHaveProperty('iterations');
      expect(config).toHaveProperty('digest');
      expect(config).toHaveProperty('saltLength');
      expect(config).toHaveProperty('keyLength');
      
      expect(config.iterations).toBeGreaterThan(0);
      expect(config.saltLength).toBeGreaterThan(0);
      expect(config.keyLength).toBeGreaterThan(0);
    });
  });

  test('CURRENT_CRYPTO_VERSION is valid', () => {
    expect(CRYPTO_CONFIGS[CURRENT_CRYPTO_VERSION]).toBeDefined();
  });

  test('newer versions have stronger parameters', () => {
    const v1 = CRYPTO_CONFIGS[1];
    const v2 = CRYPTO_CONFIGS[2];
    
    if (v2) {
      expect(v2.iterations).toBeGreaterThanOrEqual(v1.iterations);
      expect(v2.saltLength).toBeGreaterThanOrEqual(v1.saltLength);
    }
  });
});