// vitest-dom adds custom vitest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// CRITICAL: Mock ResizeObserver FIRST, before any imports
const mockResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.ResizeObserver = mockResizeObserver;
if (typeof window !== 'undefined') {
  window.ResizeObserver = mockResizeObserver;
}
if (typeof globalThis !== 'undefined') {
  globalThis.ResizeObserver = mockResizeObserver;
}

// Global test cleanup to prevent memory leaks
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();

  // Reset VaultService singleton if it exists
  try {
    const VaultService =
      require('./pages/SurpriseVault/services/VaultService').default;
    if (VaultService && VaultService.reset) {
      VaultService.reset();
    }
  } catch (e) {
    // VaultService might not be available in all tests
  }
});

afterEach(() => {
  // Clear any remaining timers after each test
  vi.clearAllTimers();

  // Clear localStorage to prevent test pollution
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }

  // Reset VaultService singleton after each test
  try {
    const VaultService =
      require('./pages/SurpriseVault/services/VaultService').default;
    if (VaultService && VaultService.reset) {
      VaultService.reset();
    }
  } catch (e) {
    // VaultService might not be available in all tests
  }
});

afterAll(() => {
  // Final cleanup to prevent memory leaks
  vi.clearAllTimers();

  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  // Final VaultService cleanup
  try {
    const VaultService =
      require('./pages/SurpriseVault/services/VaultService').default;
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
        getRandomValues: vi.fn((arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        }),
        subtle: {
          digest: vi.fn(),
          encrypt: vi.fn(),
          decrypt: vi.fn(),
        },
      },
    });
  }

  // Mock clipboard API if not configured
  if (typeof navigator !== 'undefined' && !navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn(() => Promise.resolve()),
        readText: vi.fn(() => Promise.resolve('')),
      },
      configurable: true, // Allow reconfiguration for tests
    });
  }

  // Mock ResizeObserver globally - must be before any component imports
  const mockResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  if (typeof global !== 'undefined') {
    global.ResizeObserver = mockResizeObserver;
  }

  if (typeof window !== 'undefined') {
    window.ResizeObserver = mockResizeObserver;
  }

  // Additional ResizeObserver polyfill for older environments
  if (typeof globalThis !== 'undefined' && !globalThis.ResizeObserver) {
    globalThis.ResizeObserver = mockResizeObserver;
  }

  // Mock matchMedia if not present
  if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  }

  // Mock URL methods if not present
  if (typeof global !== 'undefined' && global.URL) {
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    }
  }

  // Mock browser storage APIs if not present
  const mockStorage = {
    getItem: vi.fn((key) => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
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
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
      }),
    );
  }

  // Mock Intersection Observer if not present
  if (typeof global !== 'undefined' && !global.IntersectionObserver) {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  }

  // Mock BeforeInstallPrompt event if not present
  if (typeof global !== 'undefined' && !global.BeforeInstallPromptEvent) {
    global.BeforeInstallPromptEvent = class {
      constructor() {
        this.platforms = ['web'];
        this.userChoice = Promise.resolve({
          outcome: 'dismissed',
          platform: 'web',
        });
      }

      prompt() {
        return Promise.resolve();
      }

      preventDefault() {}
    };
  }
}

// Mock crypto libraries to avoid flakiness
vi.mock('tweetnacl', () => {
  const mockSecretbox = vi.fn(
    (plaintext, nonce, key) => new Uint8Array(plaintext.length + 16),
  );
  mockSecretbox.open = vi.fn(
    (ciphertext, nonce, key) => new Uint8Array(ciphertext.length - 16),
  );
  mockSecretbox.nonceLength = 24;

  return {
    secretbox: mockSecretbox,
    randomBytes: vi.fn((length) => {
      const array = new Uint8Array(length);
      // Use deterministic values for consistent testing
      for (let i = 0; i < length; i++) {
        array[i] = i % 256;
      }
      return array;
    }),
  };
});

vi.mock('argon2-browser', () => ({
  hash: vi.fn(() =>
    Promise.resolve({
      hash: new Uint8Array(32),
      encoded: 'mock-encoded-hash',
    }),
  ),
  ArgonType: {
    Argon2id: 2,
  },
}));

vi.mock('scrypt-js', () =>
  vi.fn((password, salt, N, r, p, keylen, callback) => {
    callback(null, new Uint8Array(keylen));
  }),
);

// Mock crypto-browserify PBKDF2 for proper async handling
vi.mock('crypto-browserify', () => ({
  pbkdf2: vi.fn((password, salt, iterations, keyLength, digest, callback) => {
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
vi.mock('@solana/web3.js', () => {
  const { Buffer } = require('buffer'); // Move Buffer import inside mock factory

  const mockPublicKey = {
    toBase58: vi.fn(() => 'mock-public-key'),
    toString: vi.fn(() => 'mock-public-key'),
    equals: vi.fn(() => false),
    toJSON: vi.fn(() => 'mock-public-key'),
    toBytes: vi.fn(() => new Uint8Array(32)),
    toBuffer: vi.fn(() => Buffer.alloc(32)),
    isOnCurve: vi.fn(() => true),
  };

  return {
    PublicKey: vi.fn().mockImplementation(() => mockPublicKey),
    Connection: vi.fn().mockImplementation(() => ({
      getAccountInfo: vi.fn(() => Promise.resolve(null)),
      getBalance: vi.fn(() => Promise.resolve(0)),
      getBlockHeight: vi.fn(() => Promise.resolve(100000)),
      getSlot: vi.fn(() => Promise.resolve(100000)),
      getEpochInfo: vi.fn(() =>
        Promise.resolve({
          epoch: 500,
          slotIndex: 1000,
          slotsInEpoch: 432000,
        }),
      ),
      getRecentPerformanceSamples: vi.fn(() => Promise.resolve([])),
    })),
    Transaction: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      sign: vi.fn(),
      serialize: vi.fn(() => Buffer.alloc(10)),
    })),
    SystemProgram: {
      transfer: vi.fn(() => ({})),
    },
    clusterApiUrl: vi.fn((cluster) => `https://api.${cluster}.solana.com`),
    LAMPORTS_PER_SOL: 1000000000,
  };
});

// Mock Ledger hardware wallet libraries to avoid hardware-specific dependencies
vi.mock('@ledgerhq/hw-transport-webhid', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    getPublicKey: vi.fn(() => Promise.resolve('mock-ledger-public-key')),
    signTransaction: vi.fn(() => Promise.resolve('mock-signature')),
    close: vi.fn(() => Promise.resolve()),
  })),
}));

vi.mock('@ledgerhq/hw-transport-webusb', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    getPublicKey: vi.fn(() => Promise.resolve('mock-ledger-public-key')),
    signTransaction: vi.fn(() => Promise.resolve('mock-signature')),
    close: vi.fn(() => Promise.resolve()),
  })),
}));

// Mock @project-serum/serum to avoid initialization issues
vi.mock('@project-serum/serum', () => ({
  TokenInstructions: {
    initializeMint: vi.fn(),
    initializeAccount: vi.fn(),
    transfer: vi.fn(),
  },
  Market: {
    load: vi.fn(() =>
      Promise.resolve({
        address: 'mock-market-address',
        baseMintAddress: 'mock-base-mint',
        quoteMintAddress: 'mock-quote-mint',
      }),
    ),
  },
}));

// Mock SVM-Pay to avoid network calls in tests
vi.mock('svm-pay', () => ({
  SVMPay: vi.fn().mockImplementation(() => ({
    createTransferUrl: vi.fn(
      () => 'https://svmpay.mock/transfer?recipient=mock&amount=1',
    ),
    parseUrl: vi.fn((url) => ({
      recipient: 'MockRecipientPublicKey123456789',
      amount: '1.0',
      network: 'solana',
      memo: 'Test memo',
      label: 'Test Payment',
      message: 'Test message',
    })),
    generatePaymentURL: vi.fn(() => 'mock-payment-url'),
    validatePaymentURL: vi.fn(() => Promise.resolve(true)),
    processPayment: vi.fn(() =>
      Promise.resolve({ signature: 'mock-signature' }),
    ),
    getSupportedNetworks: vi.fn(() => ['solana', 'sonic', 'eclipse']),
  })),
}));

// Mock QR Code generation to avoid rendering issues
vi.mock('qrcode.react', () => ({
  QRCodeSVG: vi.fn(({ value }) => {
    return `<svg data-testid="qr-code" data-value="${value}">Mock QR Code</svg>`;
  }),
}));

// Fix JSDOM window.close issue for iframe tests
if (typeof window !== 'undefined') {
  // Mock window.close to prevent JSDOM errors
  const originalClose = window.close;
  window.close = vi.fn();

  // Mock iframe handling for JSDOM
  const originalCreateElement = document.createElement;
  document.createElement = function (tagName) {
    const element = originalCreateElement.call(this, tagName);

    if (tagName.toLowerCase() === 'iframe') {
      // Add proper iframe mocking to prevent JSDOM errors
      Object.defineProperty(element, 'contentWindow', {
        value: {
          postMessage: vi.fn(),
          location: { href: 'about:blank' },
          document: {
            readyState: 'complete',
            createElement: vi.fn(() => ({
              src: '',
              onload: null,
              onerror: null,
            })),
            head: { appendChild: vi.fn() },
          },
          close: vi.fn(), // Add close method to prevent errors
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(element, 'contentDocument', {
        value: {
          readyState: 'complete',
          createElement: vi.fn(() => ({
            src: '',
            onload: null,
            onerror: null,
          })),
          head: { appendChild: vi.fn() },
        },
        writable: true,
        configurable: true,
      });
    }

    return element;
  };
}

// Mock console methods to prevent test failures from logging
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Initialize test globals safely - call this FIRST
initializeTestGlobals();
