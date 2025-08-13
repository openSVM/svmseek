import assert from 'assert';
import { useEffect, useReducer } from 'react';
import tuple from 'immutable-tuple';
import { logWarn } from './logger';

const pageLoadTime = new Date();

const globalCache: Map<any, any> = new Map();
const errorCache: Map<any, any> = new Map();

class FetchLoops {
  loops = new Map();

  addListener(listener) {
    if (!this.loops.has(listener.cacheKey)) {
      this.loops.set(
        listener.cacheKey,
        new FetchLoopInternal(listener.cacheKey, listener.fn),
      );
    }
    this.loops.get(listener.cacheKey).addListener(listener);
  }

  removeListener(listener) {
    let loop = this.loops.get(listener.cacheKey);
    loop.removeListener(listener);
    if (loop.stopped) {
      this.loops.delete(listener.cacheKey);
    }
  }

  refresh(cacheKey) {
    if (this.loops.has(cacheKey)) {
      this.loops.get(cacheKey).refresh();
    }
  }

  refreshAll() {
    return Promise.all([...this.loops.values()].map((loop) => loop.refresh()));
  }
}
const globalLoops = new FetchLoops();

class FetchLoopListener<T = any> {
  cacheKey: any;
  fn: () => Promise<T>;
  refreshInterval: number;
  callback: () => void;

  constructor(
    cacheKey: any,
    fn: () => Promise<T>,
    refreshInterval: number,
    callback: () => void,
  ) {
    this.cacheKey = cacheKey;
    this.fn = fn;
    this.refreshInterval = refreshInterval;
    this.callback = callback;
  }
}

class FetchLoopInternal<T = any> {
  cacheKey: any;
  fn: () => Promise<T>;
  timeoutId: null | any;
  listeners: Set<FetchLoopListener<T>>;
  errors: number;

  constructor(cacheKey: any, fn: () => Promise<T>) {
    this.cacheKey = cacheKey;
    this.fn = fn;
    this.timeoutId = null;
    this.listeners = new Set();
    this.errors = 0;
  }

  get refreshInterval(): number {
    const intervals = [...this.listeners].map((listener) => listener.refreshInterval);
    if (intervals.length === 0) {
      return 60000; // Default fallback interval if no listeners
    }
    return Math.min(...intervals);
  }

  get stopped(): boolean {
    return this.listeners.size === 0;
  }

  addListener(listener: FetchLoopListener<T>): void {
    const previousRefreshInterval = this.refreshInterval;
    this.listeners.add(listener);
    if (this.refreshInterval < previousRefreshInterval) {
      this.refresh();
    }
  }

  removeListener(listener: FetchLoopListener<T>): void {
    assert(this.listeners.delete(listener));
    if (this.stopped) {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
      }
    }
  }

  notifyListeners(): void {
    this.listeners.forEach((listener) => listener.callback());
  }

  refresh = async () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.stopped) {
      return;
    }

    try {
      const data = await this.fn();
      globalCache.set(this.cacheKey, data);
      errorCache.delete(this.cacheKey);
      this.errors = 0;
      return data;
    } catch (error) {
      ++this.errors;
      globalCache.delete(this.cacheKey);
      errorCache.set(this.cacheKey, error);
      logWarn(error instanceof Error ? error.message : String(error));
    } finally {
      this.notifyListeners();
      if (!this.timeoutId && !this.stopped) {
        let waitTime = this.refreshInterval;

        // SECURITY: Prevent division by zero in backoff calculation
        if (this.errors > 0) {
          const safeErrors = Math.max(1, Math.min(this.errors, 10)); // Cap errors to prevent overflow
          const backoffFactor = Math.min(2 ** (safeErrors - 1), 30); // Cap backoff
          waitTime = Math.min(1000 * backoffFactor, 60000);
        }

        // Don't do any refreshing for the first five seconds, to make way for other things to load.
        const timeSincePageLoad = +new Date() - +pageLoadTime;
        if (timeSincePageLoad < 5000 && timeSincePageLoad > 0) {
          const remainingDelay = 5000 - timeSincePageLoad;
          waitTime += Math.max(0, remainingDelay / 2);
        }

        // Refresh background pages slowly.
        if (document.visibilityState === 'hidden') {
          waitTime = 60000;
        } else if (!document.hasFocus()) {
          waitTime *= 1.5;
        }

        // Add jitter so we don't send all requests at the same time.
        const jitterFactor = 0.8 + 0.4 * Math.random();
        // SECURITY: Ensure waitTime is finite and within safe bounds
        if (!isFinite(waitTime) || waitTime < 0) {
          waitTime = this.refreshInterval; // Fallback to default
        }
        waitTime = Math.max(100, Math.min(waitTime * jitterFactor, 300000)); // Cap at 5 minutes

        this.timeoutId = setTimeout(this.refresh, waitTime);
        
        // PERFORMANCE: Prevent timeout from keeping Node.js process alive in tests
        if (this.timeoutId && typeof this.timeoutId.unref === 'function') {
          this.timeoutId.unref();
        }
      }
    }
  };
}

// returns [data, loaded, error]
// loaded is false when error is present for backwards compatibility
export function useAsyncData<T = any>(
  asyncFn: () => Promise<T>,
  cacheKey: any,
  { refreshInterval = 60000 } = {},
): [null | undefined | T, boolean, any] {
  const [, rerender] = useReducer((i) => i + 1, 0);
  cacheKey = formatCacheKey(cacheKey);

  useEffect(() => {
    if (!cacheKey) {
      return;
    }
    const listener = new FetchLoopListener<T>(
      cacheKey,
      asyncFn,
      refreshInterval,
      rerender,
    );
    globalLoops.addListener(listener);
    return () => globalLoops.removeListener(listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, refreshInterval]);

  if (!cacheKey) {
    return [null, false, undefined];
  }

  const loaded = globalCache.has(cacheKey);
  const error = errorCache.has(cacheKey) ? errorCache.get(cacheKey) : undefined;
  const data = loaded ? globalCache.get(cacheKey) : undefined;
  return [data, loaded, error];
}

export function refreshCache(cacheKey, clearCache = false) {
  cacheKey = formatCacheKey(cacheKey);
  if (clearCache) {
    globalCache.delete(cacheKey);
  }
  const loop = globalLoops.loops.get(cacheKey);
  if (loop) {
    loop.refresh();
    if (clearCache) {
      loop.notifyListeners();
    }
  }
}

// PERFORMANCE: Add cache size management to prevent memory leaks
const MAX_CACHE_SIZE = 1000;
const MAX_ERROR_CACHE_SIZE = 100;

// PERFORMANCE: Periodically clean cache to prevent memory accumulation
function cleanupCaches() {
  // Clean global cache if it gets too large
  if (globalCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(globalCache.entries());
    // Keep the most recently accessed items (simple LRU approximation)
    const keepEntries = entries.slice(-Math.floor(MAX_CACHE_SIZE * 0.8));
    globalCache.clear();
    keepEntries.forEach(([key, value]) => globalCache.set(key, value));
  }
  
  // Clean error cache
  if (errorCache.size > MAX_ERROR_CACHE_SIZE) {
    const entries = Array.from(errorCache.entries());
    const keepEntries = entries.slice(-Math.floor(MAX_ERROR_CACHE_SIZE * 0.8));
    errorCache.clear();
    keepEntries.forEach(([key, value]) => errorCache.set(key, value));
  }
}

// PERFORMANCE: Clean caches every 5 minutes
const cacheCleanupInterval = setInterval(cleanupCaches, 5 * 60 * 1000);

// PERFORMANCE: Cleanup function to clear all resources  
export function cleanupFetchLoop() {
  clearInterval(cacheCleanupInterval);
  globalCache.clear();
  errorCache.clear();
  globalLoops.loops.clear();
}

// Auto-cleanup on page unload to prevent memory leaks
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanupFetchLoop);
}

export function setCache(cacheKey, value, { initializeOnly = false } = {}) {
  cacheKey = formatCacheKey(cacheKey);
  if (initializeOnly && globalCache.has(cacheKey)) {
    return;
  }
  globalCache.set(cacheKey, value);
  const loop = globalLoops.loops.get(cacheKey);
  if (loop) {
    loop.notifyListeners();
  }
}

function formatCacheKey(cacheKey) {
  if (Array.isArray(cacheKey)) {
    return tuple(...cacheKey);
  }
  return cacheKey;
}
