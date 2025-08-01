import { 
  VaultStats, 
  Winner, 
  LeaderboardEntry, 
  Guild, 
  UserVaultData, 
  VaultConfig
} from '../types';
import { VaultStorage, generateStableRandom, generateStableAddress } from '../utils';

const nftNames = [
  'RareDragon', 'GoldenCoin', 'DiamondSword', 'MysticOrb', 'CrystalWand',
  'PhoenixFeather', 'StarGem', 'LunarStone', 'SolarFlare', 'NebulaRing'
];

const tokenAmounts = [50, 100, 250, 500, 1000];

class VaultService {
  private static instance: VaultService;
  private sessionId: string;
  private mockConfig: VaultConfig = {
    entryFeePercentage: 0.002, // 0.2%
    minTradeSize: 10,
    maxTicketsPerDay: 50,
    cooldownPeriod: 300, // 5 minutes
    referralBonus: 0.1, // 10%
    guildBonusMultiplier: 1.5,
    kycRequiredForLargeRewards: true,
    largeRewardThreshold: 1000,
  };

  private eventSubscribers: Array<(event: any) => void> = [];
  private updateInterval: NodeJS.Timeout | null = null;

  public static getInstance(): VaultService {
    if (!VaultService.instance) {
      VaultService.instance = new VaultService();
    }
    return VaultService.instance;
  }

  private constructor() {
    // Create or retrieve session ID for stable mock data
    this.sessionId = VaultStorage.get('sessionId', `session_${Date.now()}`);
    VaultStorage.set('sessionId', this.sessionId);
    
    // Initialize persistent state
    this.initializePersistentState();
    
    // Start periodic updates
    this.startPeriodicUpdates();
  }

  private initializePersistentState() {
    // Initialize base stats if not exist
    const defaultStats = {
      jackpot: this.getStableValue('jackpot', 50000, 200000),
      tradesToday: this.getStableValue('tradesToday', 500, 2000),
      totalParticipants: this.getStableValue('totalParticipants', 1000, 5000),
      nextDrawTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      lastUpdate: Date.now(),
    };
    
    const savedStats = VaultStorage.get('vaultStats', defaultStats);
    
    // Update next draw time if expired
    if (new Date(savedStats.nextDrawTime) <= new Date()) {
      savedStats.nextDrawTime = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    }
    
    VaultStorage.set('vaultStats', savedStats);
  }

  private getStableValue(key: string, min: number, max: number): number {
    return Math.floor(generateStableRandom(this.sessionId + key, min, max));
  }

  private generateStableAddress(seed: string): string {
    return generateStableAddress(this.sessionId + seed);
  }

  private startPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = setInterval(() => {
      // Gradually update jackpot and other stats
      const savedStats = VaultStorage.get('vaultStats', {}) as Partial<VaultStats & { lastUpdate?: number }>;
      const updateSeed = `update_${this.sessionId}_${Math.floor(Date.now() / 60000)}`;
      const incrementChance = 0.3; // 30% chance to increment each period
      
      if (generateStableRandom(updateSeed + '_chance') < incrementChance) {
        const increment = this.getStableValue('increment' + Date.now(), 10, 100);
        savedStats.jackpot = (savedStats.jackpot || 0) + increment;
        savedStats.tradesToday = (savedStats.tradesToday || 0) + Math.floor(generateStableRandom(updateSeed + '_trades') * 3);
        savedStats.lastUpdate = Date.now();
        
        VaultStorage.set('vaultStats', savedStats);
        
        // Notify subscribers
        this.notifySubscribers({
          type: 'jackpot_update',
          data: savedStats,
          timestamp: new Date(),
        });
      }
    }, 10000); // Every 10 seconds
  }

  private notifySubscribers(event: any) {
    this.eventSubscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.warn('Error in event subscriber:', error);
      }
    });
  }

  // Get current vault statistics
  async getVaultStats(): Promise<VaultStats> {
    // Simulate API delay but reduce flicker
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const savedStats = VaultStorage.get('vaultStats', {}) as Partial<VaultStats & { lastUpdate?: number }>;
    const userStats = VaultStorage.get('userStats', {
      userTickets: this.getStableValue('userTickets', 1, 20),
    });
    
    return {
      jackpot: savedStats.jackpot || this.getStableValue('jackpot', 50000, 200000),
      tradesToday: savedStats.tradesToday || this.getStableValue('tradesToday', 500, 2000),
      userTickets: userStats.userTickets,
      totalParticipants: savedStats.totalParticipants || this.getStableValue('totalParticipants', 1000, 5000),
      nextDrawTime: new Date(savedStats.nextDrawTime || new Date(Date.now() + 4 * 60 * 60 * 1000)),
    };
  }

  // Get recent winners
  async getRecentWinners(limit: number = 10): Promise<Winner[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Use cached winners if available and recent
    const cacheKey = `recentWinners_${limit}`;
    const cached = VaultStorage.get(cacheKey, null) as { winners: Winner[]; timestamp: number } | null;
    
    if (cached && cached.timestamp && (Date.now() - cached.timestamp) < 300000) { // 5 minutes cache
      return cached.winners;
    }
    
    const winners: Winner[] = [];
    for (let i = 0; i < limit; i++) {
      const seed = `winner_${i}_${this.sessionId}`;
      const isNFT = generateStableRandom(seed + '_type') > 0.5;
      winners.push({
        id: `winner_${i}`,
        address: this.generateStableAddress(seed),
        reward: {
          type: isNFT ? 'nft' : 'token',
          name: isNFT 
            ? nftNames[Math.floor(generateStableRandom(seed + '_nft') * nftNames.length)]
            : `${tokenAmounts[Math.floor(generateStableRandom(seed + '_token') * tokenAmounts.length)]} $SVM`,
          value: isNFT 
            ? Math.floor(generateStableRandom(seed + '_value_nft', 100, 1000))
            : tokenAmounts[Math.floor(generateStableRandom(seed + '_value_token') * tokenAmounts.length)],
        },
        timestamp: new Date(Date.now() - generateStableRandom(seed + '_time', 0, 24 * 60 * 60 * 1000)),
        transactionSignature: `tx_${seed.slice(-7)}`,
      });
    }
    
    const sorted = winners.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Cache the results
    VaultStorage.set(cacheKey, {
      winners: sorted,
      timestamp: Date.now(),
    });
    
    return sorted;
  }

  // Get leaderboard data
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Use cached leaderboard if available and recent
    const cacheKey = `leaderboard_${limit}`;
    const cached = VaultStorage.get(cacheKey, null) as { leaders: LeaderboardEntry[]; timestamp: number } | null;
    
    if (cached && cached.timestamp && (Date.now() - cached.timestamp) < 600000) { // 10 minutes cache
      return cached.leaders;
    }
    
    const rewardTypes: Array<'nft' | 'rebate' | 'odds'> = ['nft', 'rebate', 'odds'];
    const rewardDescriptions = {
      nft: 'NFT Badge',
      rebate: 'Fee Rebate',
      odds: 'Higher Odds',
    };

    const leaders: LeaderboardEntry[] = [];
    for (let i = 0; i < limit; i++) {
      const seed = `leader_${i}_${this.sessionId}`;
      const rewardType = rewardTypes[Math.floor(generateStableRandom(seed + '_reward') * rewardTypes.length)];
      leaders.push({
        id: `leader_${i}`,
        address: this.generateStableAddress(seed),
        invites: Math.floor(generateStableRandom(seed + '_invites', 5, 50)),
        totalEarnings: Math.floor(generateStableRandom(seed + '_earnings', 100, 5000)),
        reward: {
          type: rewardType,
          description: rewardDescriptions[rewardType],
          value: Math.floor(generateStableRandom(seed + '_reward_value', 50, 1000)),
        },
        joinDate: new Date(Date.now() - generateStableRandom(seed + '_join', 0, 30 * 24 * 60 * 60 * 1000)),
        lastActivity: new Date(Date.now() - generateStableRandom(seed + '_activity', 0, 24 * 60 * 60 * 1000)),
      });
    }
    
    const sorted = leaders.sort((a, b) => b.invites - a.invites);
    
    // Cache the results
    VaultStorage.set(cacheKey, {
      leaders: sorted,
      timestamp: Date.now(),
    });
    
    return sorted;
  }

  // Get available guilds
  async getGuilds(): Promise<Guild[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Use cached guilds if available and recent
    const cacheKey = 'guilds';
    const cached = VaultStorage.get(cacheKey, null) as { guilds: Guild[]; timestamp: number } | null;
    
    if (cached && cached.timestamp && (Date.now() - cached.timestamp) < 300000) { // 5 minutes cache
      return cached.guilds;
    }
    
    const guildNames = [
      'Diamond Traders', 'DeFi Warriors', 'Solana Seekers', 'Crypto Legends',
      'Vault Masters', 'Trading Titans', 'Block Builders', 'Chain Champions'
    ];

    const milestoneRewards = [
      'Exclusive Diamond NFT', 'Team Jackpot Bonus', 'Premium Guild Status',
      'Legendary Badge', 'VIP Access', 'Double Rewards Week'
    ];

    const guilds: Guild[] = [];
    for (let i = 0; i < 6; i++) {
      const seed = `guild_${i}_${this.sessionId}`;
      const memberCount = Math.floor(generateStableRandom(seed + '_members', 10, 40));
      const maxMembers = Math.floor(memberCount * 1.5) + 10;
      const totalReferrals = Math.floor(generateStableRandom(seed + '_referrals', 50, 300));
      
      guilds.push({
        id: `guild_${i}`,
        name: guildNames[i % guildNames.length],
        description: `${guildNames[i % guildNames.length]} guild focused on maximizing rewards and community growth`,
        creator: this.generateStableAddress(seed + '_creator'),
        members: [], // Simplified for demo
        maxMembers,
        totalReferrals,
        totalEarnings: Math.floor(generateStableRandom(seed + '_earnings', 5000, 50000)),
        milestone: {
          current: totalReferrals,
          target: Math.floor(totalReferrals * 1.3) + 50,
          reward: milestoneRewards[Math.floor(generateStableRandom(seed + '_milestone') * milestoneRewards.length)],
          type: 'referrals',
        },
        createdAt: new Date(Date.now() - generateStableRandom(seed + '_created', 0, 90 * 24 * 60 * 60 * 1000)),
        isActive: true,
      });
    }
    
    // Cache the results
    VaultStorage.set(cacheKey, {
      guilds,
      timestamp: Date.now(),
    });
    
    return guilds;
  }

  // Join lottery (mock trade)
  async joinLottery(tradeAmount: number): Promise<{ success: boolean; tickets: number; transactionSignature: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (tradeAmount < this.mockConfig.minTradeSize) {
      throw new Error(`Minimum trade size is $${this.mockConfig.minTradeSize}`);
    }

    const entryFee = tradeAmount * this.mockConfig.entryFeePercentage;
    const tickets = Math.floor(entryFee / 10) + 1; // Simplified ticket calculation
    
    // Update persistent data
    const savedStats = VaultStorage.get('vaultStats', {}) as Partial<VaultStats & { lastUpdate?: number }>;
    const userStats = VaultStorage.get('userStats', { userTickets: 0 });
    
    savedStats.jackpot = (savedStats.jackpot || 0) + entryFee;
    savedStats.tradesToday = (savedStats.tradesToday || 0) + 1;
    userStats.userTickets = (userStats.userTickets || 0) + tickets;
    
    VaultStorage.set('vaultStats', savedStats);
    VaultStorage.set('userStats', userStats);
    
    // Notify subscribers of the update
    this.notifySubscribers({
      type: 'new_entry',
      data: { entryFee, tickets, newJackpot: savedStats.jackpot },
      timestamp: new Date(),
    });
    
    return {
      success: true,
      tickets,
      transactionSignature: `tx_${this.sessionId.slice(-7)}_${Date.now()}`,
    };
  }

  // Generate referral link
  generateReferralLink(userAddress: string): string {
    const referralCode = userAddress.slice(-8);
    return `https://svmseek.com/vault?ref=${referralCode}`;
  }

  // Get user vault data
  async getUserData(address: string): Promise<UserVaultData> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userSeed = `user_${address}`;
    return {
      address,
      totalTickets: Math.floor(generateStableRandom(userSeed + '_tickets') * 100) + 10,
      ticketsToday: Math.floor(generateStableRandom(userSeed + '_today') * 20) + 1,
      totalWinnings: Math.floor(generateStableRandom(userSeed + '_winnings') * 5000),
      referralCode: address.slice(-8),
      referrals: [], // Simplified for demo
      guild: generateStableRandom(userSeed + '_guild') > 0.7 ? `guild_${Math.floor(generateStableRandom(userSeed + '_guildId') * 3)}` : undefined,
      lastTradeTime: new Date(Date.now() - generateStableRandom(userSeed + '_lastTrade') * 24 * 60 * 60 * 1000),
      isEligible: true,
      kycVerified: generateStableRandom(userSeed + '_kyc') > 0.3,
    };
  }

  // Simulate random draw
  async simulateDraw(): Promise<Winner[]> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const drawSeed = `draw_${this.sessionId}_${Date.now()}`;
    const winnerCount = Math.floor(generateStableRandom(drawSeed + '_count') * 5) + 1;
    const winners: Winner[] = [];
    
    for (let i = 0; i < winnerCount; i++) {
      const seed = `${drawSeed}_${i}`;
      const isNFT = generateStableRandom(seed + '_type') > 0.6;
      winners.push({
        id: `draw_winner_${i}`,
        address: this.generateStableAddress(seed + '_winner'),
        reward: {
          type: isNFT ? 'nft' : 'token',
          name: isNFT 
            ? nftNames[Math.floor(generateStableRandom(seed + '_nft') * nftNames.length)]
            : `${tokenAmounts[Math.floor(generateStableRandom(seed + '_token') * tokenAmounts.length)]} $SVM`,
          value: isNFT 
            ? Math.floor(generateStableRandom(seed + '_value') * 1000) + 100
            : tokenAmounts[Math.floor(generateStableRandom(seed + '_amount') * tokenAmounts.length)],
        },
        timestamp: new Date(),
        transactionSignature: `tx_${generateStableRandom(seed + '_tx').toString().substring(2, 9)}`,
      });
    }
    
    return winners;
  }

  // Real-time event simulation
  subscribeToEvents(callback: (event: any) => void): () => void {
    this.eventSubscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.eventSubscribers.indexOf(callback);
      if (index > -1) {
        this.eventSubscribers.splice(index, 1);
      }
    };
  }

  // Guild management methods with proper API integration points
  async createGuild(name: string, description: string, userAddress: string): Promise<{ success: boolean; guildId: string; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // TODO: Replace with actual on-chain guild creation
      const guildId = `guild_${Date.now()}_${userAddress.slice(-4)}`;
      const guilds = VaultStorage.get('userGuilds', []) as any[];
      
      guilds.push({
        id: guildId,
        name,
        description,
        creator: userAddress,
        createdAt: new Date().toISOString(),
        members: [userAddress],
        isCreator: true,
      });
      
      VaultStorage.set('userGuilds', guilds);
      
      return {
        success: true,
        guildId,
        message: `Guild "${name}" created successfully!`,
      };
    } catch (error) {
      return {
        success: false,
        guildId: '',
        message: 'Failed to create guild. Please try again.',
      };
    }
  }

  async joinGuild(guildId: string, userAddress: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // TODO: Replace with actual on-chain guild joining
      const userGuilds = VaultStorage.get('userGuilds', []) as any[];
      const existingGuild = userGuilds.find(g => g.id === guildId);
      
      if (existingGuild && existingGuild.members.includes(userAddress)) {
        return {
          success: false,
          message: 'You are already a member of this guild.',
        };
      }
      
      // Simulate guild capacity check
      const guildData = await this.getGuildById(guildId);
      if (guildData && guildData.members.length >= guildData.maxMembers) {
        return {
          success: false,
          message: 'Guild is at maximum capacity.',
        };
      }
      
      userGuilds.push({
        id: guildId,
        name: guildData?.name || 'Unknown Guild',
        description: guildData?.description || '',
        creator: guildData?.creator || '',
        joinedAt: new Date().toISOString(),
        members: [userAddress],
        isCreator: false,
      });
      
      VaultStorage.set('userGuilds', userGuilds);
      
      return {
        success: true,
        message: 'Successfully joined the guild!',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to join guild. Please try again.',
      };
    }
  }

  private async getGuildById(guildId: string) {
    const guilds = await this.getGuilds();
    return guilds.find(g => g.id === guildId);
  }

  // Check if user has joined a specific guild
  isUserInGuild(guildId: string, userAddress: string): boolean {
    const userGuilds = VaultStorage.get('userGuilds', []) as any[];
    return userGuilds.some(g => g.id === guildId && g.userAddress === userAddress);
  }

  // Get all guilds user has joined
  getUserGuilds(userAddress: string): any[] {
    const userGuilds = VaultStorage.get('userGuilds', []) as any[];
    return userGuilds.filter(g => g.userAddress === userAddress);
  }

  // Add cleanup method
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.eventSubscribers = [];
  }
}

export default VaultService;