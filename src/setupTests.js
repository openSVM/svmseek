// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder in Jest
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock crypto for tests
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

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
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

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock crypto libraries to avoid flakiness
jest.mock('tweetnacl', () => {
  const mockSecretbox = jest.fn((plaintext, nonce, key) => new Uint8Array(plaintext.length + 16));
  mockSecretbox.open = jest.fn((ciphertext, nonce, key) => new Uint8Array(ciphertext.length - 16));
  mockSecretbox.nonceLength = 24;
  
  return {
    secretbox: mockSecretbox,
    randomBytes: jest.fn((length) => {
      const array = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        array[i] = Math.floor(Math.random() * 256);
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
jest.mock('@solana/web3.js', () => {
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
    LAMPORTS_PER_SOL: 1000000000,
  };
});

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

// Mock browser storage APIs
const mockStorage = {
  getItem: jest.fn((key) => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockStorage,
});

// Mock fetch for network requests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock Intersection Observer for animation triggers
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.opener for popup detection
Object.defineProperty(window, 'opener', {
  value: null,
  writable: true,
});

// Mock BeforeInstallPrompt event for PWA testing
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
