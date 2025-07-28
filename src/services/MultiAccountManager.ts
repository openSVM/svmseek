import { Connection, PublicKey } from '@solana/web3.js';
import { WalletGroup, EnhancedWallet, walletGroupService, GroupOperationResult } from './WalletGroupService';
import { TransactionHistoryService, TransactionRecord, HistorySyncStatus } from './TransactionHistoryService';
import { ExportService, ExportOptions } from './ExportService';

export interface MultiAccountState {
  wallets: EnhancedWallet[];
  groups: WalletGroup[];
  selectedWallets: string[];
  selectedGroups: string[];
  activeFilters: {
    search: string;
    type: string[];
    status: string[];
    groups: string[];
  };
  syncStatus: HistorySyncStatus[];
  isLoading: boolean;
  errors: string[];
}

export interface BatchOperationOptions {
  walletIds?: string[];
  groupIds?: string[];
  skipFailures?: boolean;
  maxConcurrent?: number;
  onProgress?: (completed: number, total: number) => void;
  onWalletComplete?: (walletId: string, success: boolean, error?: string) => void;
}

class MultiAccountManager {
  private connection: Connection;
  private historyService: TransactionHistoryService;
  private exportService: ExportService;
  private state: MultiAccountState;
  private listeners: Array<(state: MultiAccountState) => void> = [];

  constructor(connection: Connection) {
    this.connection = connection;
    this.historyService = new TransactionHistoryService(connection);
    this.exportService = new ExportService(this.historyService);
    
    this.state = {
      wallets: [],
      groups: [],
      selectedWallets: [],
      selectedGroups: [],
      activeFilters: {
        search: '',
        type: [],
        status: [],
        groups: [],
      },
      syncStatus: [],
      isLoading: false,
      errors: [],
    };

    this.initialize();
  }

  // Initialization
  private async initialize(): Promise<void> {
    try {
      this.setState({ isLoading: true, errors: [] });
      
      // Load existing data
      const wallets = walletGroupService.getAllWallets();
      const groups = walletGroupService.getAllGroups();
      const syncStatus = this.historyService.getAllSyncStatuses();

      this.setState({
        wallets,
        groups,
        syncStatus,
        isLoading: false,
      });

      // Auto-sync if enabled
      this.scheduleAutoSync();
      
    } catch (error) {
      this.setState({
        isLoading: false,
        errors: [`Initialization failed: ${error}`],
      });
    }
  }

  // State Management with debounced updates
  private setState(updates: Partial<MultiAccountState>): void {
    this.state = { ...this.state, ...updates };
    this.debouncedNotifyListeners();
  }

  private debouncedNotifyListeners = this.debounce(() => {
    this.listeners.forEach(listener => listener(this.state));
  }, 100);

  private debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    }) as T;
  }

  public subscribe(listener: (state: MultiAccountState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  public getState(): MultiAccountState {
    return { ...this.state };
  }

  // Wallet Management
  async importWallet(
    publicKey: PublicKey,
    name: string,
    type: 'derived' | 'imported' | 'hardware' = 'imported',
    groupIds: string[] = []
  ): Promise<string> {
    try {
      const wallet = walletGroupService.addWallet({
        publicKey,
        name,
        type,
        groupIds,
        metadata: {
          balance: 0,
          transactionCount: 0,
          isArchived: false,
          tags: [],
        },
        settings: {
          notifications: true,
          autoSync: true,
          exportHistory: true,
        },
      });

      // Add to groups
      for (const groupId of groupIds) {
        walletGroupService.addWalletToGroup(wallet.id, groupId);
      }

      // Start history sync
      this.syncWalletHistory(wallet.id, publicKey);

      this.refreshState();
      return wallet.id;
      
    } catch (error) {
      throw new Error(`Failed to import wallet: ${error}`);
    }
  }

  async createWalletGroup(
    name: string,
    options: {
      description?: string;
      color?: string;
      icon?: string;
      walletIds?: string[];
    } = {}
  ): Promise<string> {
    try {
      const group = walletGroupService.createGroup(name, options);
      
      // Add wallets to group
      if (options.walletIds) {
        for (const walletId of options.walletIds) {
          walletGroupService.addWalletToGroup(walletId, group.id);
        }
      }

      this.refreshState();
      return group.id;
      
    } catch (error) {
      throw new Error(`Failed to create group: ${error}`);
    }
  }

  // Selection Management
  selectWallets(walletIds: string[]): void {
    this.setState({ selectedWallets: walletIds });
  }

  selectGroups(groupIds: string[]): void {
    this.setState({ selectedGroups: groupIds });
  }

  selectAll(): void {
    const walletIds = this.state.wallets.map(w => w.id);
    const groupIds = this.state.groups.map(g => g.id);
    this.setState({ 
      selectedWallets: walletIds,
      selectedGroups: groupIds,
    });
  }

  clearSelection(): void {
    this.setState({ 
      selectedWallets: [],
      selectedGroups: [],
    });
  }

  // Filtering and Search
  setFilters(filters: Partial<MultiAccountState['activeFilters']>): void {
    this.setState({ 
      activeFilters: { ...this.state.activeFilters, ...filters },
    });
  }

  getFilteredWallets(): EnhancedWallet[] {
    let wallets = [...this.state.wallets];
    const { search, type, status, groups } = this.state.activeFilters;

    // Search filter
    if (search) {
      const query = search.toLowerCase();
      wallets = wallets.filter(wallet =>
        wallet.name.toLowerCase().includes(query) ||
        wallet.publicKey.toBase58().toLowerCase().includes(query) ||
        wallet.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (type.length > 0) {
      wallets = wallets.filter(wallet => type.includes(wallet.type));
    }

    // Status filter (archived/active)
    if (status.length > 0) {
      wallets = wallets.filter(wallet => {
        if (status.includes('archived') && wallet.metadata.isArchived) return true;
        if (status.includes('active') && !wallet.metadata.isArchived) return true;
        return false;
      });
    }

    // Group filter
    if (groups.length > 0) {
      wallets = wallets.filter(wallet =>
        wallet.groupIds.some(groupId => groups.includes(groupId))
      );
    }

    return wallets;
  }

  getFilteredGroups(): WalletGroup[] {
    let groups = [...this.state.groups];
    const { search } = this.state.activeFilters;

    if (search) {
      const query = search.toLowerCase();
      groups = groups.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query)
      );
    }

    return groups;
  }

  // History Synchronization
  async syncWalletHistory(walletId: string, publicKey: PublicKey): Promise<void> {
    try {
      await this.historyService.syncWalletHistory(walletId, publicKey, {
        fullSync: false,
        limit: 1000,
        onProgress: (progress) => {
          this.updateSyncProgress(walletId, progress);
        },
      });

      // Update wallet metadata
      const transactions = this.historyService.getTransactionsByWallet(walletId);
      const balance = this.calculateWalletBalance(transactions);
      
      walletGroupService.updateWallet(walletId, {
        metadata: {
          balance,
          transactionCount: transactions.length,
          lastActivity: transactions[0]?.blockTime ? new Date(transactions[0].blockTime * 1000) : undefined,
          isArchived: false,
          tags: [],
        },
      });

      this.refreshState();
      
    } catch (error) {
      console.error(`Failed to sync wallet ${walletId}:`, error);
      this.addError(`Failed to sync wallet: ${error}`);
    }
  }

  async syncSelectedWallets(): Promise<void> {
    const { selectedWallets } = this.state;
    if (selectedWallets.length === 0) return;

    const wallets = selectedWallets
      .map(id => walletGroupService.getWallet(id))
      .filter(Boolean) as EnhancedWallet[];

    await this.historyService.syncMultipleWallets(
      wallets.map(w => ({ id: w.id, publicKey: w.publicKey })),
      {
        onWalletProgress: (walletId, progress) => {
          this.updateSyncProgress(walletId, progress);
        },
        onOverallProgress: (progress) => {
          console.log(`Overall sync progress: ${progress}%`);
        },
      }
    );

    this.refreshState();
  }

  async syncAllWallets(): Promise<void> {
    const wallets = this.state.wallets.filter(w => !w.metadata.isArchived);
    
    await this.historyService.syncMultipleWallets(
      wallets.map(w => ({ id: w.id, publicKey: w.publicKey })),
      {
        onWalletProgress: (walletId, progress) => {
          this.updateSyncProgress(walletId, progress);
        },
        onOverallProgress: (progress) => {
          console.log(`Overall sync progress: ${progress}%`);
        },
      }
    );

    this.refreshState();
  }

  private updateSyncProgress(walletId: string, progress: number): void {
    const syncStatus = [...this.state.syncStatus];
    const index = syncStatus.findIndex(s => s.walletId === walletId);
    
    if (index > -1) {
      syncStatus[index] = { ...syncStatus[index], syncProgress: progress };
    }
    
    this.setState({ syncStatus });
  }

  // Batch Operations
  async executeBatchOperation(
    operation: 'send' | 'swap' | 'stake' | 'archive' | 'unarchive',
    params: any,
    options: BatchOperationOptions = {}
  ): Promise<GroupOperationResult[]> {
    const { walletIds = [], groupIds = [] } = options;
    const allWalletIds = [...walletIds];
    
    // Add wallets from selected groups
    for (const groupId of groupIds) {
      const groupWallets = walletGroupService.getWalletsByGroup(groupId);
      allWalletIds.push(...groupWallets.map(w => w.id));
    }

    // Remove duplicates
    const uniqueWalletIds = [...new Set(allWalletIds)];
    const results: GroupOperationResult[] = [];

    for (const walletId of uniqueWalletIds) {
      try {
        let result: GroupOperationResult;

        switch (operation) {
          case 'archive':
            result = await this.archiveWallet(walletId);
            break;
          case 'unarchive':
            result = await this.unarchiveWallet(walletId);
            break;
          default:
            throw new Error(`Batch operation ${operation} not implemented`);
        }

        results.push(result);
        options.onWalletComplete?.(walletId, result.success);
        
      } catch (error) {
        const errorResult: GroupOperationResult = {
          success: false,
          results: [{
            walletId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }],
          summary: { successful: 0, failed: 1 },
        };
        
        results.push(errorResult);
        options.onWalletComplete?.(walletId, false, errorResult.results[0].error);
      }
    }

    this.refreshState();
    return results;
  }

  private async archiveWallet(walletId: string): Promise<GroupOperationResult> {
    const success = walletGroupService.updateWallet(walletId, {
      metadata: {
        ...walletGroupService.getWallet(walletId)?.metadata,
        isArchived: true,
      } as any,
    });

    return {
      success,
      results: [{ walletId, success }],
      summary: { successful: success ? 1 : 0, failed: success ? 0 : 1 },
    };
  }

  private async unarchiveWallet(walletId: string): Promise<GroupOperationResult> {
    const success = walletGroupService.updateWallet(walletId, {
      metadata: {
        ...walletGroupService.getWallet(walletId)?.metadata,
        isArchived: false,
      } as any,
    });

    return {
      success,
      results: [{ walletId, success }],
      summary: { successful: success ? 1 : 0, failed: success ? 0 : 1 },
    };
  }

  // Export Functions
  async exportSelectedWallets(options: ExportOptions): Promise<void> {
    const { selectedWallets } = this.state;
    if (selectedWallets.length === 0) return;

    try {
      let content: string;
      
      if (selectedWallets.length === 1) {
        content = await this.exportService.exportWallet(selectedWallets[0], options);
      } else {
        content = await this.exportService.exportAll({
          ...options,
          walletIds: selectedWallets,
        });
      }

      const filename = this.exportService.generateFilename('wallets', options.format);
      const mimeType = this.getMimeType(options.format);
      
      this.exportService.downloadAsFile(content, filename, mimeType);
      
    } catch (error) {
      throw new Error(`Export failed: ${error}`);
    }
  }

  async exportSelectedGroups(options: ExportOptions): Promise<void> {
    const { selectedGroups } = this.state;
    if (selectedGroups.length === 0) return;

    try {
      const content = await this.exportService.exportMultipleGroups(selectedGroups, options);
      const filename = this.exportService.generateFilename('groups', options.format);
      const mimeType = this.getMimeType(options.format);
      
      this.exportService.downloadAsFile(content, filename, mimeType);
      
    } catch (error) {
      throw new Error(`Export failed: ${error}`);
    }
  }

  async exportAll(options: ExportOptions): Promise<void> {
    try {
      const content = await this.exportService.exportAll(options);
      const filename = this.exportService.generateFilename('all', options.format);
      const mimeType = this.getMimeType(options.format);
      
      this.exportService.downloadAsFile(content, filename, mimeType);
      
    } catch (error) {
      throw new Error(`Export failed: ${error}`);
    }
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'csv': return 'text/csv';
      case 'json': return 'application/json';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default: return 'text/plain';
    }
  }

  // Transaction Analysis
  getWalletTransactions(walletId: string): TransactionRecord[] {
    return this.historyService.getTransactionsByWallet(walletId);
  }

  getGroupTransactions(groupId: string): TransactionRecord[] {
    const wallets = walletGroupService.getWalletsByGroup(groupId);
    const walletIds = wallets.map(w => w.id);
    return this.historyService.getTransactionsByWallets(walletIds);
  }

  searchTransactions(query: string): TransactionRecord[] {
    return this.historyService.searchTransactions(query);
  }

  // Statistics and Analytics
  getPortfolioSummary(): {
    totalWallets: number;
    totalGroups: number;
    totalBalance: number;
    totalTransactions: number;
    archivedWallets: number;
    recentActivity: TransactionRecord[];
  } {
    const { wallets, groups } = this.state;
    const totalBalance = wallets.reduce((sum, w) => sum + w.metadata.balance, 0);
    const totalTransactions = wallets.reduce((sum, w) => sum + w.metadata.transactionCount, 0);
    const archivedWallets = wallets.filter(w => w.metadata.isArchived).length;
    
    // Get recent transactions
    const allTransactions = this.historyService.getTransactionsByWallets(wallets.map(w => w.id));
    const recentActivity = allTransactions.slice(0, 10);

    return {
      totalWallets: wallets.length,
      totalGroups: groups.length,
      totalBalance,
      totalTransactions,
      archivedWallets,
      recentActivity,
    };
  }

  // Utility Methods
  private calculateWalletBalance(transactions: TransactionRecord[]): number {
    // This is a simplified calculation
    // In reality, you'd need to query the actual balance from the chain
    return transactions.reduce((balance, tx) => {
      if (tx.type === 'receive') return balance + tx.amount;
      if (tx.type === 'send') return balance - tx.amount - tx.fee;
      return balance;
    }, 0);
  }

  private refreshState(): void {
    const wallets = walletGroupService.getAllWallets();
    const groups = walletGroupService.getAllGroups();
    const syncStatus = this.historyService.getAllSyncStatuses();
    
    this.setState({ wallets, groups, syncStatus });
  }

  private addError(error: string): void {
    const errors = [...this.state.errors, error];
    this.setState({ errors });
  }

  private scheduleAutoSync(): void {
    // Schedule periodic sync every 5 minutes for wallets with autoSync enabled
    setInterval(() => {
      const walletsToSync = this.state.wallets.filter(
        w => w.settings.autoSync && !w.metadata.isArchived
      );

      if (walletsToSync.length > 0) {
        this.historyService.syncMultipleWallets(
          walletsToSync.map(w => ({ id: w.id, publicKey: w.publicKey }))
        );
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Cleanup
  dispose(): void {
    this.listeners.length = 0;
  }
}

export { MultiAccountManager };