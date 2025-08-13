import { PublicKey } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';
import { logError } from '../utils/logger';

export interface WalletGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  walletIds: string[];
  createdAt: Date;
  updatedAt: Date;
  settings: {
    autoSync: boolean;
    notifications: boolean;
    defaultGroup: boolean;
  };
  metadata: {
    totalBalance?: number;
    transactionCount?: number;
    lastActivity?: Date;
  };
}

export interface EnhancedWallet {
  id: string;
  publicKey: PublicKey;
  name: string;
  type: 'derived' | 'imported' | 'hardware';
  groupIds: string[];
  metadata: {
    balance: number;
    transactionCount: number;
    lastActivity?: Date;
    isArchived: boolean;
    tags: string[];
  };
  settings: {
    notifications: boolean;
    autoSync: boolean;
    exportHistory: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupOperationResult {
  success: boolean;
  results: Array<{
    walletId: string;
    success: boolean;
    error?: string;
    transactionId?: string;
  }>;
  summary: {
    successful: number;
    failed: number;
    totalAmount?: number;
  };
}

class WalletGroupService {
  private groups: Map<string, WalletGroup> = new Map();
  private wallets: Map<string, EnhancedWallet> = new Map();
  private storageKey = 'svmseek_wallet_groups';
  private walletsStorageKey = 'svmseek_enhanced_wallets';

  constructor() {
    this.loadFromStorage();
  }

  // Group Management
  createGroup(
    name: string,
    options: {
      description?: string;
      color?: string;
      icon?: string;
      walletIds?: string[];
    } = {}
  ): WalletGroup {
    const group: WalletGroup = {
      id: uuidv4(),
      name,
      description: options.description || '',
      color: options.color || this.generateRandomColor(),
      icon: options.icon || 'folder',
      walletIds: options.walletIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        autoSync: true,
        notifications: true,
        defaultGroup: false,
      },
      metadata: {
        totalBalance: 0,
        transactionCount: 0,
      },
    };

    this.groups.set(group.id, group);
    this.saveToStorage();
    return group;
  }

  updateGroup(groupId: string, updates: Partial<WalletGroup>): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;

    const updatedGroup = {
      ...group,
      ...updates,
      updatedAt: new Date(),
    };

    this.groups.set(groupId, updatedGroup);
    this.saveToStorage();
    return true;
  }

  deleteGroup(groupId: string): boolean {
    if (!this.groups.has(groupId)) return false;

    // Remove group reference from all wallets
    this.wallets.forEach((wallet) => {
      wallet.groupIds = wallet.groupIds.filter(id => id !== groupId);
    });

    this.groups.delete(groupId);
    this.saveToStorage();
    return true;
  }

  getGroup(groupId: string): WalletGroup | undefined {
    return this.groups.get(groupId);
  }

  getAllGroups(): WalletGroup[] {
    return Array.from(this.groups.values());
  }

  // Wallet Management
  addWallet(wallet: Omit<EnhancedWallet, 'id' | 'createdAt' | 'updatedAt'>): EnhancedWallet {
    const enhancedWallet: EnhancedWallet = {
      ...wallet,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.wallets.set(enhancedWallet.id, enhancedWallet);
    this.saveToStorage();
    return enhancedWallet;
  }

  updateWallet(walletId: string, updates: Partial<EnhancedWallet>): boolean {
    const wallet = this.wallets.get(walletId);
    if (!wallet) return false;

    const updatedWallet = {
      ...wallet,
      ...updates,
      updatedAt: new Date(),
    };

    this.wallets.set(walletId, updatedWallet);
    this.saveToStorage();
    return true;
  }

  getWallet(walletId: string): EnhancedWallet | undefined {
    return this.wallets.get(walletId);
  }

  getAllWallets(): EnhancedWallet[] {
    return Array.from(this.wallets.values());
  }

  getWalletsByGroup(groupId: string): EnhancedWallet[] {
    return Array.from(this.wallets.values()).filter(
      wallet => wallet.groupIds.includes(groupId)
    );
  }

  // Group Operations
  addWalletToGroup(walletId: string, groupId: string): boolean {
    const wallet = this.wallets.get(walletId);
    const group = this.groups.get(groupId);

    if (!wallet || !group) return false;

    if (!wallet.groupIds.includes(groupId)) {
      wallet.groupIds.push(groupId);
    }

    if (!group.walletIds.includes(walletId)) {
      group.walletIds.push(walletId);
    }

    group.updatedAt = new Date();
    wallet.updatedAt = new Date();

    this.saveToStorage();
    return true;
  }

  removeWalletFromGroup(walletId: string, groupId: string): boolean {
    const wallet = this.wallets.get(walletId);
    const group = this.groups.get(groupId);

    if (!wallet || !group) return false;

    wallet.groupIds = wallet.groupIds.filter(id => id !== groupId);
    group.walletIds = group.walletIds.filter(id => id !== walletId);

    group.updatedAt = new Date();
    wallet.updatedAt = new Date();

    this.saveToStorage();
    return true;
  }

  // Batch Operations
  async executeGroupOperation(
    groupId: string,
    operation: 'send' | 'swap' | 'stake',
    params: any
  ): Promise<GroupOperationResult> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const wallets = this.getWalletsByGroup(groupId);
    const results: GroupOperationResult['results'] = [];

    for (const wallet of wallets) {
      try {
        let transactionId: string | undefined;

        switch (operation) {
          case 'send':
            transactionId = await this.executeSendOperation(wallet, params);
            break;
          case 'swap':
            transactionId = await this.executeSwapOperation(wallet, params);
            break;
          case 'stake':
            transactionId = await this.executeStakeOperation(wallet, params);
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        results.push({
          walletId: wallet.id,
          success: true,
          transactionId,
        });
      } catch (error) {
        results.push({
          walletId: wallet.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: successful > 0,
      results,
      summary: {
        successful,
        failed,
        totalAmount: params.amount * successful,
      },
    };
  }

  // Utility Methods
  private generateRandomColor(): string {
    // Use theme-aware color palette that works across all themes
    const themeColors = [
      'var(--status-error)', 'var(--status-info)', 'var(--status-success)', 'var(--status-warning)',
      'var(--interactive-primary)', 'var(--interactive-secondary)', 'var(--text-accent)',
      'var(--border-focus)', 'var(--interactive-hover)', 'var(--interactive-active)'
    ];
    return themeColors[Math.floor(Math.random() * themeColors.length)];
  }

  private async executeSendOperation(wallet: EnhancedWallet, params: any): Promise<string> {
    // Implementation would integrate with existing wallet send functionality
    // This is a placeholder for the actual transaction logic
    return 'mock_transaction_id';
  }

  private async executeSwapOperation(wallet: EnhancedWallet, params: any): Promise<string> {
    // Implementation would integrate with existing swap functionality
    return 'mock_swap_transaction_id';
  }

  private async executeStakeOperation(wallet: EnhancedWallet, params: any): Promise<string> {
    // Implementation would integrate with existing stake functionality
    return 'mock_stake_transaction_id';
  }

  // Storage
  private saveToStorage(): void {
    try {
      const groupsData = JSON.stringify(Array.from(this.groups.entries()));
      const walletsData = JSON.stringify(Array.from(this.wallets.entries()));

      localStorage.setItem(this.storageKey, groupsData);
      localStorage.setItem(this.walletsStorageKey, walletsData);
    } catch (error) {
      logError('Failed to save wallet groups to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const groupsData = localStorage.getItem(this.storageKey);
      const walletsData = localStorage.getItem(this.walletsStorageKey);

      if (groupsData) {
        // SECURITY: Safe JSON parsing with comprehensive validation for groups data
        let entries;
        try {
          if (!groupsData || typeof groupsData !== 'string') {
            throw new Error('Invalid groups data format');
          }
          entries = JSON.parse(groupsData);
          
          // Validate data structure
          if (!Array.isArray(entries)) {
            throw new Error('Invalid groups data structure - expected array');
          }
          
          this.groups = new Map(entries.map(([key, value]: [string, any]) => [
            key,
            {
              ...value,
              createdAt: new Date(value.createdAt),
              updatedAt: new Date(value.updatedAt),
            }
          ]));
        } catch (parseError) {
          logError('Failed to parse wallet groups data:', parseError);
          localStorage.removeItem(this.storageKey);
        }
      }

      if (walletsData) {
        // SECURITY: Safe JSON parsing with comprehensive validation for wallets data  
        let entries;
        try {
          if (!walletsData || typeof walletsData !== 'string') {
            throw new Error('Invalid wallets data format');
          }
          entries = JSON.parse(walletsData);
          
          // Validate data structure
          if (!Array.isArray(entries)) {
            throw new Error('Invalid wallets data structure - expected array');
          }
          
          this.wallets = new Map(entries.map(([key, value]: [string, any]) => [
            key,
            {
              ...value,
              publicKey: new PublicKey(value.publicKey),
              createdAt: new Date(value.createdAt),
              updatedAt: new Date(value.updatedAt),
            }
          ]));
        } catch (parseError) {
          logError('Failed to parse enhanced wallets data:', parseError);
          localStorage.removeItem(this.walletsStorageKey);
        }
      }
    } catch (error) {
      logError('Failed to load wallet groups from storage:', error);
    }
  }

  // Search and Filter
  searchGroups(query: string): WalletGroup[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.groups.values()).filter(
      group =>
        group.name.toLowerCase().includes(lowercaseQuery) ||
        group.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  searchWallets(query: string): EnhancedWallet[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.wallets.values()).filter(
      wallet =>
        wallet.name.toLowerCase().includes(lowercaseQuery) ||
        wallet.publicKey.toBase58().toLowerCase().includes(lowercaseQuery) ||
        wallet.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Statistics
  getGroupStatistics(groupId: string): any {
    const group = this.groups.get(groupId);
    if (!group) return null;

    const wallets = this.getWalletsByGroup(groupId);
    const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.metadata.balance, 0);
    const totalTransactions = wallets.reduce((sum, wallet) => sum + wallet.metadata.transactionCount, 0);
    const lastActivity = wallets.reduce((latest, wallet) => {
      if (!wallet.metadata.lastActivity) return latest;
      if (!latest) return wallet.metadata.lastActivity;
      return wallet.metadata.lastActivity > latest ? wallet.metadata.lastActivity : latest;
    }, null as Date | null);

    return {
      walletCount: wallets.length,
      totalBalance,
      totalTransactions,
      lastActivity,
      averageBalance: wallets.length > 0 ? totalBalance / wallets.length : 0,
    };
  }
}

export const walletGroupService = new WalletGroupService();
