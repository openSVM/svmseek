import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';
import { devLog, logError } from '../utils/logger';

export interface TransactionRecord {
  id: string;
  signature: string;
  walletId: string;
  walletPublicKey: string;
  blockTime: number;
  slot: number;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'mint' | 'burn' | 'unknown';
  status: 'confirmed' | 'finalized' | 'failed';
  amount: number;
  fee: number;
  token?: {
    mint: string;
    symbol: string;
    decimals: number;
  };
  counterparty?: {
    address: string;
    name?: string;
  };
  metadata: {
    memo?: string;
    programId?: string;
    instruction?: string;
    tags: string[];
  };
  createdAt: Date;
  syncedAt: Date;
}

export interface HistorySyncStatus {
  walletId: string;
  lastSyncTime: Date;
  lastSyncSlot: number;
  totalTransactions: number;
  isSyncing: boolean;
  syncProgress: number;
  errors: string[];
}

class TransactionHistoryService {
  private transactions: Map<string, TransactionRecord> = new Map();
  private syncStatuses: Map<string, HistorySyncStatus> = new Map();
  private connection: Connection;
  private storageKey = 'svmseek_transaction_history';
  private syncStatusKey = 'svmseek_sync_status';

  constructor(connection: Connection) {
    this.connection = connection;
    this.loadFromStorage();
  }

  // Transaction Management
  addTransaction(transaction: Omit<TransactionRecord, 'id' | 'createdAt' | 'syncedAt'>): TransactionRecord {
    const record: TransactionRecord = {
      ...transaction,
      id: uuidv4(),
      createdAt: new Date(),
      syncedAt: new Date(),
    };

    this.transactions.set(record.id, record);
    this.saveToStorage();
    return record;
  }

  getTransaction(id: string): TransactionRecord | undefined {
    return this.transactions.get(id);
  }

  getTransactionsByWallet(walletId: string): TransactionRecord[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.walletId === walletId)
      .sort((a, b) => b.blockTime - a.blockTime);
  }

  getTransactionsByWallets(walletIds: string[]): TransactionRecord[] {
    return Array.from(this.transactions.values())
      .filter(tx => walletIds.includes(tx.walletId))
      .sort((a, b) => b.blockTime - a.blockTime);
  }

  getTransactionsBySignature(signature: string): TransactionRecord | undefined {
    return Array.from(this.transactions.values())
      .find(tx => tx.signature === signature);
  }

  // History Synchronization
  async syncWalletHistory(
    walletId: string,
    publicKey: PublicKey,
    options: {
      fullSync?: boolean;
      limit?: number;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<void> {
    const { fullSync = false, limit = 1000, onProgress } = options;

    // Initialize sync status
    let syncStatus = this.syncStatuses.get(walletId);
    if (!syncStatus) {
      syncStatus = {
        walletId,
        lastSyncTime: new Date(0),
        lastSyncSlot: 0,
        totalTransactions: 0,
        isSyncing: false,
        syncProgress: 0,
        errors: [],
      };
      this.syncStatuses.set(walletId, syncStatus);
    }

    if (syncStatus.isSyncing) {
      devLog(`Wallet ${walletId} is already syncing`);
      return;
    }

    syncStatus.isSyncing = true;
    syncStatus.syncProgress = 0;
    syncStatus.errors = [];
    this.saveSyncStatus();

    try {
      const signatures = await this.connection.getConfirmedSignaturesForAddress2(
        publicKey,
        {
          limit,
          before: fullSync ? undefined : this.getLastSignature(walletId),
        }
      );

      const totalSignatures = signatures.length;
      let processedSignatures = 0;

      for (const signatureInfo of signatures) {
        try {
          await this.processTransaction(walletId, publicKey, signatureInfo);
          processedSignatures++;

          syncStatus.syncProgress = (processedSignatures / totalSignatures) * 100;
          onProgress?.(syncStatus.syncProgress);

          // Add small delay to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          logError(`Failed to process transaction ${signatureInfo.signature}:`, error);
          syncStatus.errors.push(`Transaction ${signatureInfo.signature}: ${error}`);
        }
      }

      syncStatus.lastSyncTime = new Date();
      syncStatus.totalTransactions = this.getTransactionsByWallet(walletId).length;
      syncStatus.syncProgress = 100;

    } catch (error) {
      logError(`Failed to sync wallet ${walletId}:`, error);
      syncStatus.errors.push(`Sync failed: ${error}`);
    } finally {
      syncStatus.isSyncing = false;
      this.saveSyncStatus();
    }
  }

  async syncMultipleWallets(
    wallets: Array<{ id: string; publicKey: PublicKey }>,
    options: {
      onWalletProgress?: (walletId: string, progress: number) => void;
      onOverallProgress?: (progress: number) => void;
    } = {}
  ): Promise<void> {
    const { onWalletProgress, onOverallProgress } = options;
    let completedWallets = 0;

    for (const wallet of wallets) {
      await this.syncWalletHistory(wallet.id, wallet.publicKey, {
        onProgress: (progress) => onWalletProgress?.(wallet.id, progress),
      });

      completedWallets++;
      onOverallProgress?.((completedWallets / wallets.length) * 100);
    }
  }

  private async processTransaction(
    walletId: string,
    publicKey: PublicKey,
    signatureInfo: any
  ): Promise<void> {
    // Check if transaction already exists
    if (this.getTransactionsBySignature(signatureInfo.signature)) {
      return;
    }

    try {
      const transaction = await this.connection.getConfirmedTransaction(
        signatureInfo.signature,
        'confirmed'
      );

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const record = this.parseTransaction(walletId, publicKey, transaction, signatureInfo);
      this.transactions.set(record.id, record);

    } catch (error) {
      logError(`Failed to process transaction ${signatureInfo.signature}:`, error);
    }
  }

  private parseTransaction(
    walletId: string,
    walletPublicKey: PublicKey,
    transaction: any,
    signatureInfo: any
  ): TransactionRecord {
    const { blockTime, slot } = signatureInfo;
    const { meta, transaction: tx } = transaction;

    // Determine transaction type and amount
    const analysis = this.analyzeTransaction(walletPublicKey, tx, meta);

    return {
      id: uuidv4(),
      signature: signatureInfo.signature,
      walletId,
      walletPublicKey: walletPublicKey.toBase58(),
      blockTime: blockTime || Date.now() / 1000,
      slot: slot || 0,
      type: analysis.type,
      status: meta?.err ? 'failed' : 'confirmed',
      amount: analysis.amount,
      fee: meta?.fee || 0,
      token: analysis.token,
      counterparty: analysis.counterparty,
      metadata: {
        memo: analysis.memo,
        programId: analysis.programId,
        instruction: analysis.instruction,
        tags: analysis.tags,
      },
      createdAt: new Date(),
      syncedAt: new Date(),
    };
  }

  private analyzeTransaction(
    walletPublicKey: PublicKey,
    transaction: any,
    meta: any
  ): {
    type: TransactionRecord['type'];
    amount: number;
    token?: TransactionRecord['token'];
    counterparty?: { address: string; name?: string };
    memo?: string;
    programId?: string;
    instruction?: string;
    tags: string[];
  } {
    // Basic analysis - this would be enhanced with proper instruction parsing
    const instructions = transaction.message.instructions;
    let type: TransactionRecord['type'] = 'unknown';
    let amount = 0;
    let token: TransactionRecord['token'] | undefined;
    let counterparty: { address: string; name?: string } | undefined;
    let memo: string | undefined;
    let programId: string | undefined;
    let instruction: string | undefined;
    const tags: string[] = [];

    // Analyze balance changes
    if (meta?.preBalances && meta?.postBalances) {
      const walletIndex = transaction.message.accountKeys.findIndex(
        (key: PublicKey) => key.equals(walletPublicKey)
      );

      if (walletIndex !== -1) {
        const balanceChange = meta.postBalances[walletIndex] - meta.preBalances[walletIndex];
        amount = Math.abs(balanceChange);
        type = balanceChange > 0 ? 'receive' : 'send';
      }
    }

    // Analyze instructions for more specific types
    for (const instr of instructions) {
      programId = transaction.message.accountKeys[instr.programIdIndex].toBase58();

      if (programId === SystemProgram.programId.toBase58()) {
        // System program instruction
        if (instr.data && instr.data.length > 0) {
          const instructionType = instr.data[0];
          switch (instructionType) {
            case 2: // Transfer
              type = 'send';
              tags.push('system', 'transfer');
              break;
            case 0: // CreateAccount
              tags.push('system', 'create-account');
              break;
          }
        }
      } else {
        // Other programs
        tags.push('token', 'custom-program');

        // Could be token transfer, swap, stake, etc.
        if (programId && (programId.includes('swap') || programId.includes('dex'))) {
          type = 'swap';
          tags.push('swap', 'dex');
        } else if (programId && programId.includes('stake')) {
          type = 'stake';
          tags.push('stake');
        }
      }
    }

    return {
      type,
      amount,
      token,
      counterparty,
      memo,
      programId,
      instruction,
      tags,
    };
  }

  private getLastSignature(walletId: string): string | undefined {
    const transactions = this.getTransactionsByWallet(walletId);
    return transactions.length > 0 ? transactions[0].signature : undefined;
  }

  // Sync Status Management
  getSyncStatus(walletId: string): HistorySyncStatus | undefined {
    return this.syncStatuses.get(walletId);
  }

  getAllSyncStatuses(): HistorySyncStatus[] {
    return Array.from(this.syncStatuses.values());
  }

  // Filtering and Search
  filterTransactions(
    transactions: TransactionRecord[],
    filters: {
      type?: TransactionRecord['type'][];
      status?: TransactionRecord['status'][];
      minAmount?: number;
      maxAmount?: number;
      startDate?: Date;
      endDate?: Date;
      tokens?: string[];
      tags?: string[];
    }
  ): TransactionRecord[] {
    return transactions.filter(tx => {
      if (filters.type && !filters.type.includes(tx.type)) return false;
      if (filters.status && !filters.status.includes(tx.status)) return false;
      if (filters.minAmount && tx.amount < filters.minAmount) return false;
      if (filters.maxAmount && tx.amount > filters.maxAmount) return false;
      if (filters.startDate && new Date(tx.blockTime * 1000) < filters.startDate) return false;
      if (filters.endDate && new Date(tx.blockTime * 1000) > filters.endDate) return false;
      if (filters.tokens && tx.token && !filters.tokens.includes(tx.token.mint)) return false;
      if (filters.tags && !filters.tags.some(tag => tx.metadata.tags.includes(tag))) return false;

      return true;
    });
  }

  searchTransactions(query: string): TransactionRecord[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.transactions.values()).filter(tx =>
      tx.signature.toLowerCase().includes(lowercaseQuery) ||
      tx.walletPublicKey.toLowerCase().includes(lowercaseQuery) ||
      tx.counterparty?.address.toLowerCase().includes(lowercaseQuery) ||
      tx.counterparty?.name?.toLowerCase().includes(lowercaseQuery) ||
      tx.metadata.memo?.toLowerCase().includes(lowercaseQuery) ||
      tx.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Statistics
  getWalletStatistics(walletId: string): {
    totalTransactions: number;
    totalSent: number;
    totalReceived: number;
    totalFees: number;
    transactionsByType: Record<string, number>;
    dailyActivity: Array<{ date: string; count: number; volume: number }>;
  } {
    const transactions = this.getTransactionsByWallet(walletId);

    const stats = {
      totalTransactions: transactions.length,
      totalSent: 0,
      totalReceived: 0,
      totalFees: transactions.reduce((sum, tx) => sum + tx.fee, 0),
      transactionsByType: {} as Record<string, number>,
      dailyActivity: [] as Array<{ date: string; count: number; volume: number }>,
    };

    // Calculate statistics
    const dailyMap = new Map<string, { count: number; volume: number }>();

    transactions.forEach(tx => {
      // Type statistics
      stats.transactionsByType[tx.type] = (stats.transactionsByType[tx.type] || 0) + 1;

      // Amount statistics
      if (tx.type === 'send') {
        stats.totalSent += tx.amount;
      } else if (tx.type === 'receive') {
        stats.totalReceived += tx.amount;
      }

      // Daily activity
      const date = new Date(tx.blockTime * 1000).toISOString().split('T')[0] || 'unknown-date';
      const daily = dailyMap.get(date) || { count: 0, volume: 0 };
      daily.count++;
      daily.volume += tx.amount;
      dailyMap.set(date, daily);
    });

    stats.dailyActivity = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return stats;
  }

  // Storage
  private saveToStorage(): void {
    try {
      const transactionsData = JSON.stringify(Array.from(this.transactions.entries()));
      localStorage.setItem(this.storageKey, transactionsData);
    } catch (error) {
      logError('Failed to save transaction history to storage:', error);
    }
  }

  private saveSyncStatus(): void {
    try {
      const syncData = JSON.stringify(Array.from(this.syncStatuses.entries()));
      localStorage.setItem(this.syncStatusKey, syncData);
    } catch (error) {
      logError('Failed to save sync status to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const transactionsData = localStorage.getItem(this.storageKey);
      if (transactionsData) {
        const entries = JSON.parse(transactionsData);
        this.transactions = new Map(entries.map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            createdAt: new Date(value.createdAt),
            syncedAt: new Date(value.syncedAt),
          }
        ]));
      }

      const syncData = localStorage.getItem(this.syncStatusKey);
      if (syncData) {
        const entries = JSON.parse(syncData);
        this.syncStatuses = new Map(entries.map(([key, value]: [string, any]) => [
          key,
          {
            ...value,
            lastSyncTime: new Date(value.lastSyncTime),
          }
        ]));
      }
    } catch (error) {
      logError('Failed to load transaction history from storage:', error);
    }
  }

  // Cleanup
  clearWalletHistory(walletId: string): void {
    const transactions = this.getTransactionsByWallet(walletId);
    transactions.forEach(tx => this.transactions.delete(tx.id));
    this.syncStatuses.delete(walletId);
    this.saveToStorage();
    this.saveSyncStatus();
  }

  clearAllHistory(): void {
    this.transactions.clear();
    this.syncStatuses.clear();
    this.saveToStorage();
    this.saveSyncStatus();
  }
}

export { TransactionHistoryService };
