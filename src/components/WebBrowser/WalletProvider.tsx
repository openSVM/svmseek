import React, { createContext, useContext, useState, useCallback } from 'react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { useWallet } from '../../utils/wallet';
import { devLog, logDebug, logInfo, logWarn, logError } from '../../utils/logger';

interface WalletProviderState {
  isConnected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
}

interface WalletProviderMethods {
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

type WalletContextState = WalletProviderState & WalletProviderMethods;

const WalletContext = createContext<WalletContextState | null>(null);

export const useWalletProvider = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletProvider must be used within WalletProviderContext');
  }
  return context;
};

interface WalletProviderContextProps {
  children: React.ReactNode;
}

export const WalletProviderContext: React.FC<WalletProviderContextProps> = ({ children }) => {
  const wallet = useWallet();
  const [connecting, setConnecting] = useState(false);

  // Performance optimization: Memoize callback functions to prevent unnecessary re-renders
  // Dependency array [wallet] is intentionally minimal to ensure callbacks update when wallet changes
  const connect = useCallback(async () => {
    if (!wallet?.publicKey) {
      throw new Error('No wallet available');
    }
    setConnecting(true);
    try {
      // In a real implementation, this would trigger connection flow
      return { publicKey: wallet.publicKey };
    } finally {
      setConnecting(false);
    }
  }, [wallet]); // Dependency: wallet - callback updates when wallet instance changes

  const disconnect = useCallback(async () => {
    // In a real implementation, this would disconnect the wallet
    devLog('Wallet disconnect requested');
  }, []); // No dependencies - function is static

  const signTransaction = useCallback(async (transaction: Transaction) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // In a real implementation, this would:
    // 1. Show a transaction approval dialog
    // 2. Allow user to review and approve
    // 3. Sign the transaction with the wallet
    // 4. Return the signed transaction

    throw new Error('Transaction signing requires user approval - not implemented in iframe context');
  }, [wallet]); // Dependency: wallet - callback needs current wallet instance

  const signAllTransactions = useCallback(async (transactions: Transaction[]) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // Similar to signTransaction but for multiple transactions
    throw new Error('Batch transaction signing requires user approval - not implemented in iframe context');
  }, [wallet]); // Dependency: wallet - callback needs current wallet instance

  const signMessage = useCallback(async (message: Uint8Array) => {
    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    // In a real implementation, this would sign arbitrary messages
    throw new Error('Message signing requires user approval - not implemented in iframe context');
  }, [wallet]); // Dependency: wallet - callback needs current wallet instance

  const value: WalletContextState = {
    isConnected: !!wallet?.publicKey,
    publicKey: wallet?.publicKey || null,
    connecting,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signMessage,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Wallet adapter interface for dApps
export const createSolanaWalletAdapter = (walletProvider: WalletContextState) => {
  return {
    name: 'SVMSeek',
    url: 'https://svmseek.com',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9IiM5OTQ1RkYiLz4KPHR4IGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlM8L3R4Pgo8L3N2Zz4K',
    readyState: 'Installed',
    publicKey: walletProvider.publicKey,
    connecting: walletProvider.connecting,
    connected: walletProvider.isConnected,
    connect: walletProvider.connect,
    disconnect: walletProvider.disconnect,
    signTransaction: walletProvider.signTransaction,
    signAllTransactions: walletProvider.signAllTransactions,
    signMessage: walletProvider.signMessage,
  };
};
