/**
 * Application Constants
 * Centralized configuration for timeouts, intervals, and magic numbers
 * to improve maintainability and consistency across the application
 */

// ===== TIMEOUT CONSTANTS =====

/** Network and connection timeouts (in milliseconds) */
export const TIMEOUT_CONSTANTS = {
  /** Standard network request timeout */
  NETWORK_REQUEST: 10000,
  
  /** Iframe load timeout for security */
  IFRAME_LOAD: 10000,
  
  /** Wallet connection timeout */
  WALLET_CONNECTION: 10000,
  
  /** Message response timeout for iframe communication */
  MESSAGE_RESPONSE: 30000,
  
  /** Component loading timeout */
  COMPONENT_LOAD: 3000,
  
  /** Animation delay timeout */
  ANIMATION_DELAY: 200,
  
  /** Search input debounce delay */
  SEARCH_DEBOUNCE: 200,
  
  /** Focus blur delay for UI interactions */
  FOCUS_BLUR_DELAY: 200,
  
  /** Typing simulation delay range */
  TYPING_DELAY_MIN: 1000,
  TYPING_DELAY_MAX: 2000,
  
  /** Async test mock delay */
  ASYNC_MOCK_DELAY: 0,
} as const;

// ===== INTERVAL CONSTANTS =====

/** Polling and update intervals (in milliseconds) */
export const INTERVAL_CONSTANTS = {
  /** Network statistics polling interval */
  NETWORK_STATS_POLL: 30000,
  
  /** Wallet balance update interval */
  WALLET_BALANCE_UPDATE: 15000,
  
  /** Health check interval */
  HEALTH_CHECK: 60000,
  
  /** Cache cleanup interval */
  CACHE_CLEANUP: 300000, // 5 minutes
} as const;

// ===== UI CONSTANTS =====

/** UI measurements and limits */
export const UI_CONSTANTS = {
  /** Minimum mobile viewport width */
  MOBILE_WIDTH: 375,
  
  /** Desktop breakpoint */
  DESKTOP_BREAKPOINT: 1024,
  
  /** Tablet breakpoint */
  TABLET_BREAKPOINT: 768,
  
  /** Maximum items per page */
  MAX_ITEMS_PER_PAGE: 100,
  
  /** Default items per page */
  DEFAULT_ITEMS_PER_PAGE: 30,
  
  /** Search results limit */
  SEARCH_RESULTS_LIMIT: 50,
  
  /** Maximum upload file size (bytes) */
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;

// ===== SECURITY CONSTANTS =====

/** Security-related configuration */
export const SECURITY_CONSTANTS = {
  /** Maximum password strength retries */
  MAX_PASSWORD_RETRIES: 3,
  
  /** Session timeout (in milliseconds) */
  SESSION_TIMEOUT: 3600000, // 1 hour
  
  /** CSRF token expiry */
  CSRF_TOKEN_EXPIRY: 1800000, // 30 minutes
  
  /** Rate limiting window */
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  
  /** Maximum rate limit requests */
  MAX_RATE_LIMIT_REQUESTS: 100,
} as const;

// ===== WALLET CONSTANTS =====

/** Wallet and blockchain related constants */
export const WALLET_CONSTANTS = {
  /** Transaction confirmation blocks */
  CONFIRMATION_BLOCKS: 12,
  
  /** Maximum gas price (in gwei) */
  MAX_GAS_PRICE: 1000,
  
  /** Default gas limit */
  DEFAULT_GAS_LIMIT: 21000,
  
  /** Key derivation iterations */
  KEY_DERIVATION_ITERATIONS: 100000,
  
  /** Wallet encryption salt length */
  SALT_LENGTH: 16,
  
  /** Encryption key length */
  KEY_LENGTH: 32,
  
  /** Nonce length for encryption */
  NONCE_LENGTH: 24,
} as const;

// ===== ANIMATION CONSTANTS =====

/** Animation timing and easing */
export const ANIMATION_CONSTANTS = {
  /** Fast animation duration (ms) */
  DURATION_FAST: 150,
  
  /** Normal animation duration (ms) */
  DURATION_NORMAL: 250,
  
  /** Slow animation duration (ms) */
  DURATION_SLOW: 350,
  
  /** Slower animation duration (ms) */
  DURATION_SLOWER: 600,
  
  /** Easing functions */
  EASING: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    SMOOTH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    OUT_CUBIC: 'cubic-bezier(0.33, 1, 0.68, 1)',
    IN_CUBIC: 'cubic-bezier(0.32, 0, 0.67, 0)',
    SPRING: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// ===== ERROR HANDLING CONSTANTS =====

/** Error handling and retry configuration */
export const ERROR_CONSTANTS = {
  /** Maximum retry attempts */
  MAX_RETRIES: 3,
  
  /** Retry delay base (ms) */
  RETRY_DELAY_BASE: 1000,
  
  /** Retry delay multiplier for exponential backoff */
  RETRY_DELAY_MULTIPLIER: 2,
  
  /** Error toast display duration */
  ERROR_TOAST_DURATION: 5000,
  
  /** Warning toast display duration */
  WARNING_TOAST_DURATION: 3000,
  
  /** Success toast display duration */
  SUCCESS_TOAST_DURATION: 2000,
} as const;

// ===== API CONSTANTS =====

/** API configuration and limits */
export const API_CONSTANTS = {
  /** API version */
  VERSION: 'v1',
  
  /** Request timeout */
  REQUEST_TIMEOUT: 30000,
  
  /** Maximum concurrent requests */
  MAX_CONCURRENT_REQUESTS: 10,
  
  /** Cache TTL (time to live) */
  CACHE_TTL: 300000, // 5 minutes
  
  /** Pagination default limit */
  PAGINATION_LIMIT: 20,
  
  /** Maximum pagination limit */
  MAX_PAGINATION_LIMIT: 100,
} as const;

// ===== DEVELOPMENT CONSTANTS =====

/** Development and testing configuration */
export const DEV_CONSTANTS = {
  /** Console log levels */
  LOG_LEVELS: ['error', 'warn', 'info', 'debug'] as const,
  
  /** Test timeout for long operations */
  TEST_TIMEOUT_LONG: 15000,
  
  /** Test timeout for standard operations */
  TEST_TIMEOUT_STANDARD: 5000,
  
  /** Mock data generation limits */
  MOCK_DATA_LIMIT: 1000,
  
  /** Debug mode flags */
  DEBUG_FLAGS: {
    VERBOSE_LOGGING: false,
    PERFORMANCE_MONITORING: false,
    SECURITY_WARNINGS: true,
  },
} as const;

// ===== ENVIRONMENT VARIABLES =====

/** Environment-specific configuration */
export const ENV_CONSTANTS = {
  /** Production environment name */
  PRODUCTION: 'production',
  
  /** Development environment name */
  DEVELOPMENT: 'development',
  
  /** Testing environment name */
  TEST: 'test',
  
  /** Staging environment name */
  STAGING: 'staging',
} as const;

// ===== TYPE EXPORTS =====

/** Type definitions for constants */
export type TimeoutConstant = keyof typeof TIMEOUT_CONSTANTS;
export type IntervalConstant = keyof typeof INTERVAL_CONSTANTS;
export type UIConstant = keyof typeof UI_CONSTANTS;
export type SecurityConstant = keyof typeof SECURITY_CONSTANTS;
export type WalletConstant = keyof typeof WALLET_CONSTANTS;
export type AnimationConstant = keyof typeof ANIMATION_CONSTANTS;
export type ErrorConstant = keyof typeof ERROR_CONSTANTS;
export type APIConstant = keyof typeof API_CONSTANTS;
export type DevConstant = keyof typeof DEV_CONSTANTS;
export type EnvConstant = keyof typeof ENV_CONSTANTS;

// ===== UTILITY FUNCTIONS =====

/**
 * Get timeout value safely with fallback
 * @param key - Timeout constant key
 * @param fallback - Fallback value if key not found
 * @returns Timeout value in milliseconds
 */
export function getTimeout(key: TimeoutConstant, fallback?: number): number {
  return TIMEOUT_CONSTANTS[key] ?? fallback ?? 5000;
}

/**
 * Get interval value safely with fallback
 * @param key - Interval constant key  
 * @param fallback - Fallback value if key not found
 * @returns Interval value in milliseconds
 */
export function getInterval(key: IntervalConstant, fallback?: number): number {
  return INTERVAL_CONSTANTS[key] ?? fallback ?? 30000;
}

/**
 * Get animation duration with easing
 * @param duration - Duration key
 * @param easing - Easing function key
 * @returns CSS animation string
 */
export function getAnimationCSS(
  duration: keyof typeof ANIMATION_CONSTANTS,
  easing: keyof typeof ANIMATION_CONSTANTS.EASING = 'DEFAULT'
): string {
  if (duration === 'EASING') {
    throw new Error('Invalid duration key: EASING is not a duration');
  }
  
  const durationValue = ANIMATION_CONSTANTS[duration];
  const easingValue = ANIMATION_CONSTANTS.EASING[easing];
  
  return `${durationValue}ms ${easingValue}`;
}

/**
 * Check if current environment matches
 * @param env - Environment to check
 * @returns True if environment matches
 */
export function isEnvironment(env: keyof typeof ENV_CONSTANTS): boolean {
  return process.env.NODE_ENV === ENV_CONSTANTS[env];
}

/**
 * Get retry delay with exponential backoff
 * @param attempt - Current attempt number (0-based)
 * @returns Delay in milliseconds
 */
export function getRetryDelay(attempt: number): number {
  return ERROR_CONSTANTS.RETRY_DELAY_BASE * 
    Math.pow(ERROR_CONSTANTS.RETRY_DELAY_MULTIPLIER, attempt);
}
