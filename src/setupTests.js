// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Global test cleanup to prevent memory leaks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset VaultService singleton if it exists
  try {
    const VaultService = require('./pages/SurpriseVault/services/VaultService').default;
    if (VaultService && VaultService.reset) {
      VaultService.reset();
    }
  } catch (e) {
    // VaultService might not be available in all tests
  }
});

afterEach(() => {
  // Clear any remaining timers after each test
  jest.clearAllTimers();
  
  // Clear localStorage to prevent test pollution
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
  
  // Reset VaultService singleton after each test
  try {
    const VaultService = require('./pages/SurpriseVault/services/VaultService').default;
    if (VaultService && VaultService.reset) {
      VaultService.reset();
    }
  } catch (e) {
    // VaultService might not be available in all tests
  }
});

afterAll(() => {
  // Final cleanup to prevent memory leaks
  jest.clearAllTimers();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  // Final VaultService cleanup
  try {
    const VaultService = require('./pages/SurpriseVault/services/VaultService').default;
    if (VaultService && VaultService.reset) {
      VaultService.reset();
    }
  } catch (e) {
    // VaultService might not be available in all tests
  }
});

// Safe test environment initialization
function initializeTestGlobals() {
  // Polyfill for TextEncoder/TextDecoder in Jest
  if (typeof global !== 'undefined' && !global.TextEncoder) {
    global.TextEncoder = require('util').TextEncoder;
  }
  if (typeof global !== 'undefined' && !global.TextDecoder) {
    global.TextDecoder = require('util').TextDecoder;
  }

  // Mock crypto for tests if not already present
  if (typeof global !== 'undefined' && !global.crypto) {
    Object.defineProperty(global, 'crypto', {
      value: {
        getRandomValues: jest.fn((arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }),
        subtle: {
          digest: jest.fn(),
          encrypt: jest.fn(),
          decrypt: jest.fn(),
        },
      },
    });
  }

  // Mock clipboard API if not configured
  if (typeof navigator !== 'undefined' && !navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: jest.fn(() => Promise.resolve()),
        readText: jest.fn(() => Promise.resolve('')),
      },
      configurable: true, // Allow reconfiguration for tests
    });
  }

  // Mock ResizeObserver if not present
  if (typeof global !== 'undefined' && !global.ResizeObserver) {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }
  
  // Also add to window for browser environment
  if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }

  // Mock matchMedia if not present
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  // Mock URL methods if not present
  if (typeof global !== 'undefined' && global.URL) {
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = jest.fn();
    }
  }

  // Mock browser storage APIs if not present
  const mockStorage = {
    getItem: jest.fn((key) => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
  };

  if (typeof window !== 'undefined') {
    if (!window.localStorage) {
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
      });
    }
    if (!window.sessionStorage) {
      Object.defineProperty(window, 'sessionStorage', {
        value: mockStorage,
      });
    }
    if (!window.opener) {
      Object.defineProperty(window, 'opener', {
        value: null,
        writable: true,
      });
    }
  }

  // Mock fetch for network requests if not present
  if (typeof global !== 'undefined' && !global.fetch) {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      })
    );
  }

  // Mock Intersection Observer if not present
  if (typeof global !== 'undefined' && !global.IntersectionObserver) {
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }

  // Mock BeforeInstallPrompt event if not present
  if (typeof global !== 'undefined' && !global.BeforeInstallPromptEvent) {
    global.BeforeInstallPromptEvent = class {
      constructor() {
        this.platforms = ['web'];
        this.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' });
      }
      
      prompt() {
        return Promise.resolve();
      }
      
      preventDefault() {}
    };
  }
}

// Mock crypto libraries to avoid flakiness
jest.mock('tweetnacl', () => {
  const mockSecretbox = jest.fn((plaintext, nonce, key) => new Uint8Array(plaintext.length + 16));
  mockSecretbox.open = jest.fn((ciphertext, nonce, key) => new Uint8Array(ciphertext.length - 16));
  mockSecretbox.nonceLength = 24;
  
  return {
    secretbox: mockSecretbox,
    randomBytes: jest.fn((length) => {
      const array = new Uint8Array(length);
      // Use deterministic values for consistent testing
      for (let i = 0; i < length; i++) {
        array[i] = i % 256;
      }
      return array;
    }),
  };
});

jest.mock('argon2-browser', () => ({
  hash: jest.fn(() => Promise.resolve({
    hash: new Uint8Array(32),
    encoded: 'mock-encoded-hash'
  })),
  ArgonType: {
    Argon2id: 2,
  },
}));

jest.mock('scrypt-js', () => jest.fn((password, salt, N, r, p, keylen, callback) => {
  callback(null, new Uint8Array(keylen));
}));

// Mock crypto-browserify PBKDF2 for proper async handling
jest.mock('crypto-browserify', () => ({
  pbkdf2: jest.fn((password, salt, iterations, keyLength, digest, callback) => {
    // Simulate async operation and always call callback with valid data
    setImmediate(() => {
      const mockKey = Buffer.alloc(keyLength);
      // Fill with deterministic pattern for testing
      for (let i = 0; i < keyLength; i++) {
        mockKey[i] = i % 256;
      }
      callback(null, mockKey);
    });
  }),
}));
jest.mock('@solana/web3.js', () => {
  const { Buffer } = require('buffer'); // Move Buffer import inside mock factory
  
  const mockPublicKey = {
    toBase58: jest.fn(() => 'mock-public-key'),
    toString: jest.fn(() => 'mock-public-key'),
    equals: jest.fn(() => false),
    toJSON: jest.fn(() => 'mock-public-key'),
    toBytes: jest.fn(() => new Uint8Array(32)),
    toBuffer: jest.fn(() => Buffer.alloc(32)),
    isOnCurve: jest.fn(() => true),
  };

  return {
    PublicKey: jest.fn().mockImplementation(() => mockPublicKey),
    Connection: jest.fn().mockImplementation(() => ({
      getAccountInfo: jest.fn(() => Promise.resolve(null)),
      getBalance: jest.fn(() => Promise.resolve(0)),
      getBlockHeight: jest.fn(() => Promise.resolve(100000)),
      getSlot: jest.fn(() => Promise.resolve(100000)),
      getEpochInfo: jest.fn(() => Promise.resolve({
        epoch: 500,
        slotIndex: 1000,
        slotsInEpoch: 432000,
      })),
      getRecentPerformanceSamples: jest.fn(() => Promise.resolve([])),
    })),
    Transaction: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      sign: jest.fn(),
      serialize: jest.fn(() => Buffer.alloc(10)),
    })),
    SystemProgram: {
      transfer: jest.fn(() => ({})),
    },
    clusterApiUrl: jest.fn((cluster) => `https://api.${cluster}.solana.com`),
    LAMPORTS_PER_SOL: 1000000000,
  };
});

// Mock Ledger hardware wallet libraries to avoid hardware-specific dependencies
jest.mock('@ledgerhq/hw-transport-webhid', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getPublicKey: jest.fn(() => Promise.resolve('mock-ledger-public-key')),
    signTransaction: jest.fn(() => Promise.resolve('mock-signature')),
    close: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@ledgerhq/hw-transport-webusb', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getPublicKey: jest.fn(() => Promise.resolve('mock-ledger-public-key')),
    signTransaction: jest.fn(() => Promise.resolve('mock-signature')),
    close: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock @project-serum/serum to avoid initialization issues
jest.mock('@project-serum/serum', () => ({
  TokenInstructions: {
    initializeMint: jest.fn(),
    initializeAccount: jest.fn(),
    transfer: jest.fn(),
  },
  Market: {
    load: jest.fn(() => Promise.resolve({
      address: 'mock-market-address',
      baseMintAddress: 'mock-base-mint',
      quoteMintAddress: 'mock-quote-mint',
    })),
  },
}));

// Mock SVM-Pay to avoid network calls in tests
jest.mock('svm-pay', () => ({
  SVMPay: jest.fn().mockImplementation(() => ({
    generatePaymentURL: jest.fn(() => 'mock-payment-url'),
    validatePaymentURL: jest.fn(() => Promise.resolve(true)),
    processPayment: jest.fn(() => Promise.resolve({ signature: 'mock-signature' })),
    getSupportedNetworks: jest.fn(() => ['solana', 'sonic', 'eclipse']),
  })),
}));

// Mock QR Code generation to avoid rendering issues
jest.mock('qrcode.react', () => ({
  QRCodeSVG: jest.fn(({ value }) => {
    return `<svg data-testid="qr-code" data-value="${value}">Mock QR Code</svg>`;
  }),
}));

// Fix JSDOM window.close issue for iframe tests
if (typeof window !== 'undefined') {
  // Mock window.close to prevent JSDOM errors
  const originalClose = window.close;
  window.close = jest.fn();
  
  // Mock iframe handling for JSDOM
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    
    if (tagName.toLowerCase() === 'iframe') {
      // Add proper iframe mocking to prevent JSDOM errors
      Object.defineProperty(element, 'contentWindow', {
        value: {
          postMessage: jest.fn(),
          location: { href: 'about:blank' },
          document: {
            readyState: 'complete',
            createElement: jest.fn(() => ({
              src: '',
              onload: null,
              onerror: null
            })),
            head: { appendChild: jest.fn() }
          },
          close: jest.fn() // Add close method to prevent errors
        },
        writable: true,
        configurable: true
      });
      
      Object.defineProperty(element, 'contentDocument', {
        value: {
          readyState: 'complete',
          createElement: jest.fn(() => ({
            src: '',
            onload: null,
            onerror: null
          })),
          head: { appendChild: jest.fn() }
        },
        writable: true,
        configurable: true
      });
    }
    
    return element;
  };
}

// Initialize test globals safely
initializeTestGlobals();
