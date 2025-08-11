import { logError } from '../utils/logger';
/**
 * Real Solana RPC service for fetching live blockchain data
 */
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';

export interface NetworkStats {
  blocksProcessed: number;
  activeValidators: number;
  tps: number;
  epoch: number;
  networkLoad: number;
  blockHeight: number;
  avgBlockTime: number;
  totalTransactions: number;
}

export interface BlockInfo {
  slot: number;
  blockHeight: number;
  timestamp: Date;
  transactions: number;
  leader: string;
  hash: string;
}

export interface TransactionInfo {
  signature: string;
  slot: number;
  timestamp: Date;
  status: 'Success' | 'Failed';
  fee: number;
  accounts: string[];
  instructions: number;
}

export interface AccountInfo {
  address: string;
  balance: number;
  owner: string;
  executable: boolean;
  tokens?: Array<{
    mint: string;
    amount: number;
    decimals: number;
  }>;
}

export class SolanaRPCService {
  private connection: Connection;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  private getCacheKey(method: string, params: any[] = []): string {
    return `${method}:${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get current network statistics
   */
  async getNetworkStats(): Promise<NetworkStats> {
    const cacheKey = this.getCacheKey('networkStats');
    const cached = this.getFromCache<NetworkStats>(cacheKey);
    if (cached) return cached;

    try {
      const [
        blockHeight,
        epochInfo,
        recentPerformanceSamples,
        voteAccounts,
        supply,
      ] = await Promise.all([
        this.connection.getBlockHeight(),
        this.connection.getEpochInfo(),
        this.connection.getRecentPerformanceSamples(10),
        this.connection.getVoteAccounts(),
        this.connection.getSupply(),
      ]);

      // Calculate TPS from recent performance samples
      const tps = recentPerformanceSamples.length > 0 && recentPerformanceSamples[0].samplePeriodSecs > 0
        ? Math.round(recentPerformanceSamples[0].numTransactions / recentPerformanceSamples[0].samplePeriodSecs)
        : 0;

      // Calculate average block time
      const avgBlockTime = recentPerformanceSamples.length > 0 && 
        recentPerformanceSamples[0].numSlots > 0 && 
        recentPerformanceSamples[0].samplePeriodSecs > 0
        ? recentPerformanceSamples[0].samplePeriodSecs / recentPerformanceSamples[0].numSlots
        : 0.4;

      // Network load estimation based on slot utilization
      const networkLoad = Math.min(tps / 5000, 1); // Assume 5000 TPS is high load

      const stats: NetworkStats = {
        blocksProcessed: blockHeight,
        activeValidators: voteAccounts.current.length,
        tps,
        epoch: epochInfo.epoch,
        networkLoad,
        blockHeight,
        avgBlockTime,
        totalTransactions: supply.value.circulating, // Use circulating supply as approximation
      };

      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      logError('Failed to fetch network stats:', error);
      // Return fallback mock data
      return {
        blocksProcessed: 0,
        activeValidators: 0,
        tps: 0,
        epoch: 0,
        networkLoad: 0,
        blockHeight: 0,
        avgBlockTime: 0,
        totalTransactions: 0,
      };
    }
  }

  /**
   * Get recent blocks
   */
  async getRecentBlocks(limit: number = 10): Promise<BlockInfo[]> {
    const cacheKey = this.getCacheKey('recentBlocks', [limit]);
    const cached = this.getFromCache<BlockInfo[]>(cacheKey);
    if (cached) return cached;

    try {
      const blockHeight = await this.connection.getBlockHeight();
      const blocks: BlockInfo[] = [];

      for (let i = 0; i < limit; i++) {
        const slot = blockHeight - i;
        try {
          const block = await this.connection.getBlock(slot, {
            maxSupportedTransactionVersion: 0,
          });

          if (block) {
            blocks.push({
              slot,
              blockHeight: slot,
              timestamp: new Date(block.blockTime! * 1000),
              transactions: block.transactions.length,
              leader: 'Unknown', // Block leader not easily accessible in this format
              hash: block.blockhash,
            });
          }
        } catch (error) {
          // Block might not exist, skip
          continue;
        }
      }

      this.setCache(cacheKey, blocks);
      return blocks;
    } catch (error) {
      logError('Failed to fetch recent blocks:', error);
      return [];
    }
  }

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit: number = 20): Promise<TransactionInfo[]> {
    const cacheKey = this.getCacheKey('recentTransactions', [limit]);
    const cached = this.getFromCache<TransactionInfo[]>(cacheKey);
    if (cached) return cached;

    try {
      const blockHeight = await this.connection.getBlockHeight();
      const transactions: TransactionInfo[] = [];

      // Get transactions from recent blocks
      for (let i = 0; i < 3 && transactions.length < limit; i++) {
        const slot = blockHeight - i;
        try {
          const block = await this.connection.getBlock(slot, {
            maxSupportedTransactionVersion: 0,
          });

          if (block) {
            for (const tx of block.transactions.slice(0, limit - transactions.length)) {
              transactions.push({
                signature: tx.transaction.signatures[0],
                slot,
                timestamp: new Date(block.blockTime! * 1000),
                status: tx.meta?.err ? 'Failed' : 'Success',
                fee: tx.meta?.fee || 0,
                accounts: [], // Account details require more complex parsing
                instructions: 1, // Default to 1 for simplicity
              });
            }
          }
        } catch (error) {
          continue;
        }
      }

      this.setCache(cacheKey, transactions);
      return transactions;
    } catch (error) {
      logError('Failed to fetch recent transactions:', error);
      return [];
    }
  }

  /**
   * Search for account, transaction, or block
   */
  async search(query: string): Promise<{
    type: 'account' | 'transaction' | 'block' | 'unknown';
    data: any;
  }> {
    const trimmedQuery = query.trim();

    // Check if it's a valid public key (account)
    if (trimmedQuery.length === 44) {
      try {
        const pubkey = new PublicKey(trimmedQuery);
        const accountInfo = await this.connection.getAccountInfo(pubkey);

        if (accountInfo) {
          return {
            type: 'account',
            data: {
              address: trimmedQuery,
              balance: accountInfo.lamports / 1e9, // Convert to SOL
              owner: accountInfo.owner.toString(),
              executable: accountInfo.executable,
            },
          };
        }
      } catch (error) {
        // Not a valid public key
      }
    }

    // Check if it's a transaction signature
    if (trimmedQuery.length === 88) {
      try {
        const transaction = await this.connection.getTransaction(trimmedQuery, {
          maxSupportedTransactionVersion: 0,
        });

        if (transaction) {
          return {
            type: 'transaction',
            data: {
              signature: trimmedQuery,
              slot: transaction.slot,
              timestamp: new Date(transaction.blockTime! * 1000),
              status: transaction.meta?.err ? 'Failed' : 'Success',
              fee: transaction.meta?.fee || 0,
            },
          };
        }
      } catch (error) {
        // Not a valid transaction
      }
    }

    // Check if it's a block number
    if (/^\d+$/.test(trimmedQuery)) {
      try {
        const slot = parseInt(trimmedQuery);
        const block = await this.connection.getBlock(slot);

        if (block) {
          return {
            type: 'block',
            data: {
              slot,
              timestamp: new Date(block.blockTime! * 1000),
              transactions: block.transactions.length,
              hash: block.blockhash,
            },
          };
        }
      } catch (error) {
        // Not a valid block
      }
    }

    return {
      type: 'unknown',
      data: null,
    };
  }

  /**
   * Get account details with token balances
   */
  async getAccountDetails(address: string): Promise<AccountInfo | null> {
    try {
      const pubkey = new PublicKey(address);
      const [accountInfo, tokenAccounts] = await Promise.all([
        this.connection.getAccountInfo(pubkey),
        this.connection.getParsedTokenAccountsByOwner(pubkey, {
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        }),
      ]);

      if (!accountInfo) return null;

      const tokens = tokenAccounts.value.map(tokenAccount => {
        const data = tokenAccount.account.data as ParsedAccountData;
        const info = data.parsed.info;
        return {
          mint: info.mint,
          amount: parseFloat(info.tokenAmount.uiAmountString || '0'),
          decimals: info.tokenAmount.decimals,
        };
      });

      return {
        address,
        balance: accountInfo.lamports / 1e9,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        tokens: tokens.filter(token => token.amount > 0),
      };
    } catch (error) {
      logError('Failed to fetch account details:', error);
      return null;
    }
  }

  /**
   * Switch to different RPC endpoint
   */
  switchEndpoint(rpcUrl: string): void {
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.cache.clear(); // Clear cache when switching endpoints
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    latency: number;
    endpoint: string;
  }> {
    const startTime = Date.now();
    try {
      await this.connection.getVersion();
      const latency = Date.now() - startTime;
      return {
        connected: true,
        latency,
        endpoint: this.connection.rpcEndpoint,
      };
    } catch (error) {
      return {
        connected: false,
        latency: -1,
        endpoint: this.connection.rpcEndpoint,
      };
    }
  }
}

// Singleton instance
export const solanaRPCService = new SolanaRPCService();
