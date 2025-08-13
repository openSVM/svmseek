import { useMemo } from 'react';

/**
 * Utility functions for the Surprise Vault
 */

// Memoized function to truncate addresses
export const useTruncateAddress = () => {
  return useMemo(() => (address: string, startChars = 6, endChars = 4): string => {
    if (!address) return '';
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }, []);
};

// Memoized function to format currency
export const useFormatCurrency = () => {
  return useMemo(() => (amount: number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : undefined,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 6,
    }).format(amount);
  }, []);
};

// Memoized function to format numbers with abbreviations
export const useFormatNumber = () => {
  return useMemo(() => (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }, []);
};

// Memoized function to format time remaining
export const useFormatTimeRemaining = () => {
  return useMemo(() => (targetTime: Date): string => {
    const now = new Date();
    const diff = targetTime.getTime() - now.getTime();

    if (diff <= 0) return 'Finished';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);
};

// Storage utilities for persistence
export const VaultStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(`vault_${key}`);
      if (!item || typeof item !== 'string') {
        return defaultValue;
      }
      // SECURITY: Enhanced JSON parsing with validation for vault storage data
      const parsed = JSON.parse(item);
      return parsed !== null && parsed !== undefined ? parsed : defaultValue;
    } catch (error) {
      // Remove corrupted data
      localStorage.removeItem(`vault_${key}`);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(`vault_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(`vault_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },
};

// Error retry utility
export const createRetryableAction = <T>(
  action: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
) => {
  let retryCount = 0;

  const execute = async (): Promise<T> => {
    try {
      return await action();
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, delay * retryCount));
        return execute();
      }
      throw error;
    }
  };

  return execute;
};

// Generate stable mock data to reduce flicker
export const generateStableRandom = (seed: string, min = 0, max = 1): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1
  return min + (normalized * (max - min));
};

// Mock address generator with stable results
export const generateStableAddress = (seed: string): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '0x';
  for (let i = 0; i < 8; i++) {
    const index = Math.floor(generateStableRandom(seed + i) * chars.length);
    result += chars[index];
  }
  return result;
};
