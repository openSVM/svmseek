/**
 * Centralized Test Mocks
 *
 * This file consolidates all commonly used test mocks to avoid duplication
 * across test files and ensure consistency in mock implementations.
 */

// ===== CRYPTO MOCKS =====

/**
 * TweetNaCl Mock - Centralized cryptographic function mocking
 * Provides consistent, deterministic mock implementations for encryption testing
 */
const mockCreateTweetNaCl = () => {
  const mockSecretbox = jest.fn((message: Uint8Array, nonce: Uint8Array, key: Uint8Array) => {
    // Return deterministic mock encrypted result
    return new Uint8Array(message.length + 16); // Add overhead for box
  }) as jest.MockedFunction<any> & {
    open: jest.MockedFunction<any>;
    keyLength: number;
    nonceLength: number;
    overheadLength: number;
  };

  mockSecretbox.open = jest.fn((ciphertext: Uint8Array, nonce: Uint8Array, key: Uint8Array) => {
    if (ciphertext.length <= 16) return null;
    return ciphertext.slice(16);
  });

  mockSecretbox.keyLength = 32;
  mockSecretbox.nonceLength = 24;
  mockSecretbox.overheadLength = 16;

  return {
    randomBytes: jest.fn((length: number) => {
      // Return stable mock array for testing
      return new Uint8Array(Array.from({ length }, (_, i) => i % 256));
    }),
    secretbox: mockSecretbox
  };
};

export const createTweetNaClMock = mockCreateTweetNaCl;

/**
 * Apply TweetNaCl mock to jest
 */
export const mockTweetNaCl = () => {
  jest.mock('tweetnacl', () => mockCreateTweetNaCl());
};

/**
 * Crypto-browserify Mock - For PBKDF2 and other crypto operations
 */
const mockCreateCryptoBrowserify = () => ({
  pbkdf2: jest.fn((password, salt, iterations, keyLength, digest, callback) => {
    // Simulate async operation
    setTimeout(() => {
      // Return stable mock key based on password for deterministic testing
      const passwordBytes = Buffer.from(password, 'utf8');
      const mockKey = Buffer.from(Array.from({ length: keyLength }, (_, i) =>
        (passwordBytes[i % passwordBytes.length] + i) % 256
      ));
      callback(null, mockKey);
    }, 0);
  }),
});

export const createCryptoBrowserifyMock = mockCreateCryptoBrowserify;

/**
 * Apply crypto-browserify mock to jest
 */
export const mockCryptoBrowserify = () => {
  jest.mock('crypto-browserify', () => mockCreateCryptoBrowserify());
};

/**
 * Argon2-browser Mock - For password hashing
 */
const mockCreateArgon2Browser = () => ({
  hash: jest.fn(async (options) => {
    // Create deterministic hash based on password
    const passwordBytes = Buffer.from(options.pass, 'utf8');
    return {
      hash: new Uint8Array(Array.from({ length: 32 }, (_, i) =>
        (passwordBytes[i % passwordBytes.length] + i) % 256
      )),
      hashHex: 'abcdef123456789',
    };
  }),
  ArgonType: {
    Argon2id: 2
  }
});

export const createArgon2BrowserMock = mockCreateArgon2Browser;

/**
 * Apply argon2-browser mock to jest
 */
export const mockArgon2Browser = () => {
  jest.mock('argon2-browser', () => mockCreateArgon2Browser());
};

// ===== DOM MOCKS =====

/**
 * ResizeObserver Mock - For components that use ResizeObserver
 */
export const createResizeObserverMock = () => {
  const mockResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  return mockResizeObserver as unknown as typeof ResizeObserver;
};

/**
 * Apply ResizeObserver mock to global
 */
export const mockResizeObserver = () => {
  global.ResizeObserver = createResizeObserverMock();
};

/**
 * IntersectionObserver Mock - For components that use IntersectionObserver
 */
export const createIntersectionObserverMock = () => {
  const mockIntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: jest.fn().mockReturnValue([]),
  }));

  return mockIntersectionObserver as unknown as typeof IntersectionObserver;
};

/**
 * Apply IntersectionObserver mock to global
 */
export const mockIntersectionObserver = () => {
  global.IntersectionObserver = createIntersectionObserverMock();
};

/**
 * MediaQueryList Mock - For responsive design components
 */
export const createMediaQueryListMock = () => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

/**
 * Apply MediaQueryList mock to window.matchMedia
 */
export const mockMatchMedia = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => createMediaQueryListMock()),
  });
};

// ===== BROWSER API MOCKS =====

/**
 * LocalStorage Mock - For localStorage operations
 */
export const createLocalStorageMock = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

/**
 * Apply localStorage mock to global
 */
export const mockLocalStorage = () => {
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: createLocalStorageMock(),
  });
};

/**
 * SessionStorage Mock - For sessionStorage operations
 */
export const mockSessionStorage = () => {
  Object.defineProperty(window, 'sessionStorage', {
    writable: true,
    value: createLocalStorageMock(),
  });
};

/**
 * URL Mock - For URL.createObjectURL and related operations
 */
export const createURLMock = () => ({
  createObjectURL: jest.fn((blob) => `blob:mock-url-${Math.random()}`),
  revokeObjectURL: jest.fn(),
});

/**
 * Apply URL mock to global
 */
export const mockURL = () => {
  const mockCreateObjectURL = jest.fn((blob) => `blob:mock-url-${Math.random()}`);
  const mockRevokeObjectURL = jest.fn();

  // Store original URL constructor
  const OriginalURL = global.URL;

  // Only mock the static methods we need, not the constructor
  Object.defineProperty(global.URL, 'createObjectURL', {
    value: mockCreateObjectURL,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(global.URL, 'revokeObjectURL', {
    value: mockRevokeObjectURL,
    writable: true,
    configurable: true,
  });
};

// ===== CONSOLE MOCKS =====

/**
 * Console Methods Mock - For testing console outputs
 */
export const createConsoleMock = () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
});

/**
 * Apply console mocks - useful for testing error boundaries
 */
export const mockConsole = () => {
  const originalConsole = console;
  const mockedMethods = createConsoleMock();

  Object.keys(mockedMethods).forEach(method => {
    (console as any)[method] = mockedMethods[method as keyof typeof mockedMethods];
  });

  return {
    restore: () => {
      Object.keys(mockedMethods).forEach(method => {
        (console as any)[method] = originalConsole[method as keyof typeof originalConsole];
      });
    },
    mocks: mockedMethods,
  };
};

// ===== NETWORK MOCKS =====

/**
 * Fetch Mock - For network request testing
 */
export const createFetchMock = () => {
  return jest.fn().mockImplementation((url: string, options?: RequestInit) => {
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue({}),
      text: jest.fn().mockResolvedValue(''),
      blob: jest.fn().mockResolvedValue(new Blob()),
      headers: new Headers(),
      url,
    });
  });
};

/**
 * Apply fetch mock to global
 */
export const mockFetch = () => {
  global.fetch = createFetchMock();
};

// ===== WALLET MOCKS =====

/**
 * Mock Wallet Object - For wallet-related testing
 */
export const createMockWallet = () => ({
  publicKey: {
    toString: () => 'mock-public-key-123456789',
    toBase58: () => 'mock-base58-key',
  },
  isConnected: true,
  connect: jest.fn().mockResolvedValue({ publicKey: 'mock-public-key-123456789' }),
  disconnect: jest.fn().mockResolvedValue(undefined),
  signTransaction: jest.fn().mockResolvedValue({ signature: 'mock-signature' }),
  signAllTransactions: jest.fn().mockResolvedValue([{ signature: 'mock-signature' }]),
  signMessage: jest.fn().mockResolvedValue({ signature: new Uint8Array([1, 2, 3]) }),
});

// ===== MUI COMPONENT MOCKS =====

/**
 * Create mock for MUI components with forwardRef
 */
const mockCreateMUIComponent = (componentName: string) => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    return React.createElement('div', {
      ...props,
      ref,
      'data-testid': `mock-${componentName.toLowerCase()}`,
    });
  });
};

export const createMUIComponentMock = mockCreateMUIComponent;

/**
 * Common MUI component mocks
 */
export const mockMUIComponents = () => {
  jest.mock('@mui/material/Grid', () => mockCreateMUIComponent('Grid'));
  jest.mock('@mui/material/Box', () => mockCreateMUIComponent('Box'));
  jest.mock('@mui/material/Typography', () => mockCreateMUIComponent('Typography'));
  jest.mock('@mui/material/Button', () => mockCreateMUIComponent('Button'));
  jest.mock('@mui/material/TextField', () => mockCreateMUIComponent('TextField'));
  jest.mock('@mui/material/Card', () => mockCreateMUIComponent('Card'));
  jest.mock('@mui/material/CardContent', () => mockCreateMUIComponent('CardContent'));
};

// ===== TIMER MOCKS =====

/**
 * Timer utilities for testing
 */
export const mockTimers = () => {
  jest.useFakeTimers();
  return {
    runAllTimers: () => jest.runAllTimers(),
    runOnlyPendingTimers: () => jest.runOnlyPendingTimers(),
    advanceTimersByTime: (ms: number) => jest.advanceTimersByTime(ms),
    restore: () => jest.useRealTimers(),
  };
};

// ===== COMPOSITE MOCK SETUPS =====

/**
 * Setup all common mocks for a typical test environment
 */
export const setupCommonMocks = () => {
  mockResizeObserver();
  mockIntersectionObserver();
  mockMatchMedia();
  mockLocalStorage();
  mockSessionStorage();
  mockURL();
  mockFetch();

  return {
    resizeObserver: global.ResizeObserver,
    intersectionObserver: global.IntersectionObserver,
    matchMedia: window.matchMedia,
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
    url: global.URL,
    fetch: global.fetch,
  };
};

/**
 * Setup crypto-related mocks
 */
export const setupCryptoMocks = () => {
  mockTweetNaCl();
  mockCryptoBrowserify();
  mockArgon2Browser();
};

/**
 * Setup all mocks for comprehensive testing
 */
export const setupAllMocks = () => {
  setupCommonMocks();
  setupCryptoMocks();
  mockMUIComponents();

  return {
    common: setupCommonMocks(),
    console: mockConsole(),
    timers: mockTimers(),
  };
};

// ===== CLEANUP UTILITIES =====

/**
 * Cleanup function to restore all mocks
 */
export const cleanupAllMocks = () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();

  // Reset console if it was mocked
  if ((console as any).__mocked) {
    (console as any).__restore?.();
  }
};
