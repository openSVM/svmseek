import { WalletGroup, EnhancedWallet, walletGroupService } from './WalletGroupService';
import { TransactionRecord, TransactionHistoryService } from './TransactionHistoryService';

export interface ExportData {
  wallets: EnhancedWallet[];
  groups: WalletGroup[];
  transactions: TransactionRecord[];
  metadata: {
    exportDate: Date;
    exportType: 'wallet' | 'group' | 'all';
    version: string;
    totalWallets: number;
    totalGroups: number;
    totalTransactions: number;
  };
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeTransactions: boolean;
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  walletIds?: string[];
  groupIds?: string[];
  transactionTypes?: string[];
  columns?: string[];
}

class ExportService {
  private historyService: TransactionHistoryService | null = null;

  constructor(historyService?: TransactionHistoryService) {
    this.historyService = historyService || null;
  }

  // Main Export Functions
  async exportWallet(walletId: string, options: ExportOptions): Promise<string> {
    const wallet = walletGroupService.getWallet(walletId);
    if (!wallet) {
      throw new Error(`Wallet with ID ${walletId} not found`);
    }

    const exportData = await this.prepareExportData('wallet', {
      ...options,
      walletIds: [walletId],
    });

    return this.formatExportData(exportData, options);
  }

  async exportGroup(groupId: string, options: ExportOptions): Promise<string> {
    const group = walletGroupService.getGroup(groupId);
    if (!group) {
      throw new Error(`Group with ID ${groupId} not found`);
    }

    const exportData = await this.prepareExportData('group', {
      ...options,
      groupIds: [groupId],
    });

    return this.formatExportData(exportData, options);
  }

  async exportMultipleGroups(groupIds: string[], options: ExportOptions): Promise<string> {
    const exportData = await this.prepareExportData('all', {
      ...options,
      groupIds,
    });

    return this.formatExportData(exportData, options);
  }

  async exportAll(options: ExportOptions): Promise<string> {
    const exportData = await this.prepareExportData('all', options);
    return this.formatExportData(exportData, options);
  }

  // Data Preparation
  private async prepareExportData(
    type: 'wallet' | 'group' | 'all',
    options: ExportOptions
  ): Promise<ExportData> {
    let wallets: EnhancedWallet[] = [];
    let groups: WalletGroup[] = [];
    let transactions: TransactionRecord[] = [];

    // Get wallets based on export type
    if (type === 'wallet' && options.walletIds) {
      wallets = options.walletIds
        .map(id => walletGroupService.getWallet(id))
        .filter(Boolean) as EnhancedWallet[];
    } else if (type === 'group' && options.groupIds) {
      groups = options.groupIds
        .map(id => walletGroupService.getGroup(id))
        .filter(Boolean) as WalletGroup[];

      // Get wallets from groups
      const walletIds = new Set<string>();
      groups.forEach(group => {
        group.walletIds.forEach(id => walletIds.add(id));
      });

      wallets = Array.from(walletIds)
        .map(id => walletGroupService.getWallet(id))
        .filter(Boolean) as EnhancedWallet[];
    } else if (type === 'all') {
      wallets = walletGroupService.getAllWallets();
      groups = walletGroupService.getAllGroups();

      // Filter by specified groups if provided
      if (options.groupIds) {
        groups = groups.filter(group => options.groupIds!.includes(group.id));
        const groupWalletIds = new Set<string>();
        groups.forEach(group => {
          group.walletIds.forEach(id => groupWalletIds.add(id));
        });
        wallets = wallets.filter(wallet => groupWalletIds.has(wallet.id));
      }
    }

    // Get transactions if needed
    if (options.includeTransactions && this.historyService) {
      const walletIds = wallets.map(w => w.id);
      transactions = this.historyService.getTransactionsByWallets(walletIds);

      // Apply filters
      if (options.dateRange) {
        transactions = transactions.filter(tx => {
          const txDate = new Date(tx.blockTime * 1000);
          return txDate >= options.dateRange!.start && txDate <= options.dateRange!.end;
        });
      }

      if (options.transactionTypes) {
        transactions = transactions.filter(tx =>
          options.transactionTypes!.includes(tx.type)
        );
      }
    }

    return {
      wallets,
      groups,
      transactions,
      metadata: {
        exportDate: new Date(),
        exportType: type,
        version: '1.0.0',
        totalWallets: wallets.length,
        totalGroups: groups.length,
        totalTransactions: transactions.length,
      },
    };
  }

  // Format Handlers
  private formatExportData(data: ExportData, options: ExportOptions): string {
    switch (options.format) {
      case 'csv':
        return this.formatAsCSV(data, options);
      case 'json':
        return this.formatAsJSON(data, options);
      case 'xlsx':
        return this.formatAsXLSX(data, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private formatAsCSV(data: ExportData, options: ExportOptions): string {
    const sections: string[] = [];

    // Metadata section
    if (options.includeMetadata) {
      sections.push('=== EXPORT METADATA ===');
      sections.push(
        ['Field', 'Value'].join(','),
        ['Export Date', data.metadata.exportDate.toISOString()].join(','),
        ['Export Type', data.metadata.exportType].join(','),
        ['Version', data.metadata.version].join(','),
        ['Total Wallets', data.metadata.totalWallets.toString()].join(','),
        ['Total Groups', data.metadata.totalGroups.toString()].join(','),
        ['Total Transactions', data.metadata.totalTransactions.toString()].join(','),
        ''
      );
    }

    // Wallets section
    if (data.wallets.length > 0) {
      sections.push('=== WALLETS ===');
      const walletHeaders = this.getWalletCSVHeaders(options.columns);
      sections.push(walletHeaders.join(','));

      data.wallets.forEach(wallet => {
        const row = this.walletToCSVRow(wallet, walletHeaders);
        sections.push(row.join(','));
      });
      sections.push('');
    }

    // Groups section
    if (data.groups.length > 0) {
      sections.push('=== GROUPS ===');
      const groupHeaders = this.getGroupCSVHeaders(options.columns);
      sections.push(groupHeaders.join(','));

      data.groups.forEach(group => {
        const row = this.groupToCSVRow(group, groupHeaders);
        sections.push(row.join(','));
      });
      sections.push('');
    }

    // Transactions section
    if (options.includeTransactions && data.transactions.length > 0) {
      sections.push('=== TRANSACTIONS ===');
      const txHeaders = this.getTransactionCSVHeaders(options.columns);
      sections.push(txHeaders.join(','));

      data.transactions.forEach(tx => {
        const row = this.transactionToCSVRow(tx, txHeaders);
        sections.push(row.join(','));
      });
    }

    return sections.join('\n');
  }

  private formatAsJSON(data: ExportData, options: ExportOptions): string {
    const exportObject: any = {
      metadata: data.metadata,
      wallets: data.wallets.map(wallet => ({
        ...wallet,
        publicKey: wallet.publicKey.toBase58(),
      })),
      groups: data.groups,
    };

    if (options.includeTransactions) {
      exportObject.transactions = data.transactions;
    }

    return JSON.stringify(exportObject, null, 2);
  }

  private formatAsXLSX(data: ExportData, options: ExportOptions): string {
    // For now, return CSV format with XLSX headers
    // In a real implementation, you would use a library like xlsx-js-style
    const csvData = this.formatAsCSV(data, options);
    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${btoa(csvData)}`;
  }

  // CSV Helper Methods
  private getWalletCSVHeaders(customColumns?: string[]): string[] {
    const defaultHeaders = [
      'ID', 'Name', 'PublicKey', 'Type', 'Groups', 'Balance',
      'TransactionCount', 'LastActivity', 'IsArchived', 'Tags',
      'CreatedAt', 'UpdatedAt'
    ];
    return customColumns || defaultHeaders;
  }

  private getGroupCSVHeaders(customColumns?: string[]): string[] {
    const defaultHeaders = [
      'ID', 'Name', 'Description', 'Color', 'Icon', 'WalletCount',
      'TotalBalance', 'TransactionCount', 'LastActivity', 'CreatedAt', 'UpdatedAt'
    ];
    return customColumns || defaultHeaders;
  }

  private getTransactionCSVHeaders(customColumns?: string[]): string[] {
    const defaultHeaders = [
      'ID', 'Signature', 'WalletID', 'WalletPublicKey', 'Date', 'Type',
      'Status', 'Amount', 'Fee', 'Token', 'CounterpartyAddress',
      'CounterpartyName', 'Memo', 'Tags'
    ];
    return customColumns || defaultHeaders;
  }

  private walletToCSVRow(wallet: EnhancedWallet, headers: string[]): string[] {
    const data: Record<string, string> = {
      'ID': wallet.id,
      'Name': this.escapeCSV(wallet.name),
      'PublicKey': wallet.publicKey.toBase58(),
      'Type': wallet.type,
      'Groups': wallet.groupIds.join(';'),
      'Balance': wallet.metadata.balance.toString(),
      'TransactionCount': wallet.metadata.transactionCount.toString(),
      'LastActivity': wallet.metadata.lastActivity?.toISOString() || '',
      'IsArchived': wallet.metadata.isArchived.toString(),
      'Tags': wallet.metadata.tags.join(';'),
      'CreatedAt': wallet.createdAt.toISOString(),
      'UpdatedAt': wallet.updatedAt.toISOString(),
    };

    return headers.map(header => data[header] || '');
  }

  private groupToCSVRow(group: WalletGroup, headers: string[]): string[] {
    const stats = walletGroupService.getGroupStatistics(group.id);

    const data: Record<string, string> = {
      'ID': group.id,
      'Name': this.escapeCSV(group.name),
      'Description': this.escapeCSV(group.description || ''),
      'Color': group.color,
      'Icon': group.icon,
      'WalletCount': group.walletIds.length.toString(),
      'TotalBalance': stats?.totalBalance?.toString() || '0',
      'TransactionCount': stats?.totalTransactions?.toString() || '0',
      'LastActivity': stats?.lastActivity?.toISOString() || '',
      'CreatedAt': group.createdAt.toISOString(),
      'UpdatedAt': group.updatedAt.toISOString(),
    };

    return headers.map(header => data[header] || '');
  }

  private transactionToCSVRow(tx: TransactionRecord, headers: string[]): string[] {
    const data: Record<string, string> = {
      'ID': tx.id,
      'Signature': tx.signature,
      'WalletID': tx.walletId,
      'WalletPublicKey': tx.walletPublicKey,
      'Date': new Date(tx.blockTime * 1000).toISOString(),
      'Type': tx.type,
      'Status': tx.status,
      'Amount': tx.amount.toString(),
      'Fee': tx.fee.toString(),
      'Token': tx.token ? `${tx.token.symbol} (${tx.token.mint})` : 'SOL',
      'CounterpartyAddress': tx.counterparty?.address || '',
      'CounterpartyName': tx.counterparty?.name || '',
      'Memo': this.escapeCSV(tx.metadata.memo || ''),
      'Tags': tx.metadata.tags.join(';'),
    };

    return headers.map(header => data[header] || '');
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Bulk Export Templates
  async createWalletSummaryReport(): Promise<string> {
    const wallets = walletGroupService.getAllWallets();
    const groups = walletGroupService.getAllGroups();

    const summary = {
      overview: {
        totalWallets: wallets.length,
        totalGroups: groups.length,
        totalBalance: wallets.reduce((sum, w) => sum + w.metadata.balance, 0),
        archivedWallets: wallets.filter(w => w.metadata.isArchived).length,
      },
      walletsByType: wallets.reduce((acc, wallet) => {
        acc[wallet.type] = (acc[wallet.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      groupStatistics: groups.map(group => ({
        name: group.name,
        walletCount: group.walletIds.length,
        ...walletGroupService.getGroupStatistics(group.id),
      })),
    };

    return JSON.stringify(summary, null, 2);
  }

  async createTransactionReport(
    walletIds: string[],
    dateRange: { start: Date; end: Date }
  ): Promise<string> {
    if (!this.historyService) {
      throw new Error('Transaction history service not available');
    }

    const transactions = this.historyService.getTransactionsByWallets(walletIds);
    const filteredTx = transactions.filter(tx => {
      const txDate = new Date(tx.blockTime * 1000);
      return txDate >= dateRange.start && txDate <= dateRange.end;
    });

    const report = {
      summary: {
        totalTransactions: filteredTx.length,
        dateRange,
        totalVolume: filteredTx.reduce((sum, tx) => sum + tx.amount, 0),
        totalFees: filteredTx.reduce((sum, tx) => sum + tx.fee, 0),
      },
      transactionsByType: filteredTx.reduce((acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      dailyActivity: this.generateDailyActivity(filteredTx),
      transactions: filteredTx,
    };

    return JSON.stringify(report, null, 2);
  }

  private generateDailyActivity(transactions: TransactionRecord[]): Array<{
    date: string;
    count: number;
    volume: number;
    fees: number;
  }> {
    const dailyMap = new Map<string, { count: number; volume: number; fees: number }>();

    transactions.forEach(tx => {
      const date = new Date(tx.blockTime * 1000).toISOString().split('T')[0] || 'unknown-date';
      const daily = dailyMap.get(date) || { count: 0, volume: 0, fees: 0 };
      daily.count++;
      daily.volume += tx.amount;
      daily.fees += tx.fee;
      dailyMap.set(date, daily);
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // File Download Helpers
  downloadAsFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  generateFilename(type: string, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0] || 'unknown-date';
    return `svmseek_${type}_${timestamp}.${format}`;
  }
}

export { ExportService };
