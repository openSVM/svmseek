import { useEffect, useState } from 'react';

// Hook to provide wallet integration for Surprise Vault
export const useVaultWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Try to get wallet from various sources
    const checkWalletConnection = () => {
      try {
        // Check for window.solana (Phantom, Solflare, etc.)
        if (window.solana && window.solana.isConnected) {
          const address = window.solana.publicKey?.toString();
          if (address) {
            setWalletAddress(address);
            setIsConnected(true);
            return;
          }
        }

        // Check localStorage for persisted wallet
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedAddress) {
          setWalletAddress(savedAddress);
          setIsConnected(true);
          return;
        }

        // Check for other wallet adapters
        if (window.walletAdapter && window.walletAdapter.publicKey) {
          const address = window.walletAdapter.publicKey.toString();
          setWalletAddress(address);
          setIsConnected(true);
          return;
        }

        // Fallback: use stable mock address for development
        const mockAddress = generateDevelopmentAddress();
        setWalletAddress(mockAddress);
        setIsConnected(false); // Not a real connection
      } catch (error) {
        console.warn('Error checking wallet connection:', error);
        // Fallback to mock address
        const mockAddress = generateDevelopmentAddress();
        setWalletAddress(mockAddress);
        setIsConnected(false);
      }
    };

    checkWalletConnection();

    // Listen for wallet connection changes
    const handleWalletChange = () => {
      checkWalletConnection();
    };

    // Set up event listeners for wallet changes
    if (window.solana) {
      window.solana.on('connect', handleWalletChange);
      window.solana.on('disconnect', () => {
        setWalletAddress(null);
        setIsConnected(false);
      });
    }

    // Also listen for storage changes (if wallet state is managed elsewhere)
    const handleStorageChange = (e) => {
      if (e.key === 'walletAddress') {
        checkWalletConnection();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      // PERFORMANCE: Clean up all event listeners to prevent memory leaks
      if (window.solana) {
        window.solana.removeListener('connect', handleWalletChange);
        window.solana.removeListener('disconnect', handleWalletChange);
      }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const connectWallet = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      if (window.solana) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        setWalletAddress(address);
        setIsConnected(true);
        localStorage.setItem('walletAddress', address);
      } else {
        throw new Error('No wallet found');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Keep using mock address for development
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
      }
      setWalletAddress(null);
      setIsConnected(false);
      localStorage.removeItem('walletAddress');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return {
    walletAddress,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };
};

// Generate a stable development address for testing
const generateDevelopmentAddress = (): string => {
  const stored = localStorage.getItem('vault_dev_address');
  if (stored) return stored;

  // Create a stable mock address for development
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
  let address = '';
  const seed = 'vault_dev_' + (localStorage.getItem('vault_sessionId') || 'default');

  // Generate deterministic address from seed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }

  for (let i = 0; i < 44; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i % seed.length);
    hash = hash & hash;
    address += chars[Math.abs(hash) % chars.length];
  }

  localStorage.setItem('vault_dev_address', address);
  return address;
};

// Declare global types for wallet adapters
declare global {
  interface Window {
    solana?: {
      isConnected: boolean;
      publicKey?: { toString(): string };
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      on(event: string, callback: () => void): void;
      removeListener(event: string, callback: () => void): void;
    };
    walletAdapter?: {
      publicKey?: { toString(): string };
    };
  }
}
