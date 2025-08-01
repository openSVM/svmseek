import { 
  VaultStats, 
  Winner, 
  LeaderboardEntry, 
  Guild, 
  UserVaultData, 
  VaultConfig
} from '../types';

// Mock data generation utilities
const generateMockAddress = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '0x';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const nftNames = [
  'RareDragon', 'GoldenCoin', 'DiamondSword', 'MysticOrb', 'CrystalWand',
  'PhoenixFeather', 'StarGem', 'LunarStone', 'SolarFlare', 'NebulaRing'
];

const tokenAmounts = [50, 100, 250, 500, 1000];

class VaultService {
  private static instance: VaultService;
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

  private mockData = {
    jackpot: 123456,
    tradesToday: 987,
    totalParticipants: 2500,
    nextDrawTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
  };

  public static getInstance(): VaultService {
    if (!VaultService.instance) {
      VaultService.instance = new VaultService();
    }
    return VaultService.instance;
  }

  private constructor() {
    // Initialize with mock data
  }

  // Get current vault statistics
  async getVaultStats(): Promise<VaultStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      jackpot: this.mockData.jackpot,
      tradesToday: this.mockData.tradesToday,
      userTickets: Math.floor(Math.random() * 20) + 1,
      totalParticipants: this.mockData.totalParticipants,
      nextDrawTime: this.mockData.nextDrawTime,
    };
  }

  // Get recent winners
  async getRecentWinners(limit: number = 10): Promise<Winner[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const winners: Winner[] = [];
    for (let i = 0; i < limit; i++) {
      const isNFT = Math.random() > 0.5;
      winners.push({
        id: `winner_${i}`,
        address: generateMockAddress(),
        reward: {
          type: isNFT ? 'nft' : 'token',
          name: isNFT 
            ? nftNames[Math.floor(Math.random() * nftNames.length)]
            : `${tokenAmounts[Math.floor(Math.random() * tokenAmounts.length)]} $SVM`,
          value: isNFT 
            ? Math.floor(Math.random() * 1000) + 100
            : tokenAmounts[Math.floor(Math.random() * tokenAmounts.length)],
        },
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        transactionSignature: `tx_${Math.random().toString(36).substring(7)}`,
      });
    }
    
    return winners.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get leaderboard data
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const rewardTypes: Array<'nft' | 'rebate' | 'odds'> = ['nft', 'rebate', 'odds'];
    const rewardDescriptions = {
      nft: 'NFT Badge',
      rebate: 'Fee Rebate',
      odds: 'Higher Odds',
    };

    const leaders: LeaderboardEntry[] = [];
    for (let i = 0; i < limit; i++) {
      const rewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
      leaders.push({
        id: `leader_${i}`,
        address: generateMockAddress(),
        invites: Math.floor(Math.random() * 50) + 5,
        totalEarnings: Math.floor(Math.random() * 5000) + 100,
        reward: {
          type: rewardType,
          description: rewardDescriptions[rewardType],
          value: Math.floor(Math.random() * 1000) + 50,
        },
        joinDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      });
    }
    
    return leaders.sort((a, b) => b.invites - a.invites);
  }

  // Get available guilds
  async getGuilds(): Promise<Guild[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
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
      const memberCount = Math.floor(Math.random() * 40) + 10;
      const maxMembers = Math.floor(memberCount * 1.5) + 10;
      const totalReferrals = Math.floor(Math.random() * 300) + 50;
      
      guilds.push({
        id: `guild_${i}`,
        name: guildNames[i % guildNames.length],
        description: `${guildNames[i % guildNames.length]} guild focused on maximizing rewards and community growth`,
        creator: generateMockAddress(),
        members: [], // Simplified for demo
        maxMembers,
        totalReferrals,
        totalEarnings: Math.floor(Math.random() * 50000) + 5000,
        milestone: {
          current: totalReferrals,
          target: Math.floor(totalReferrals * 1.3) + 50,
          reward: milestoneRewards[Math.floor(Math.random() * milestoneRewards.length)],
          type: 'referrals',
        },
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      });
    }
    
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
    
    // Update mock data
    this.mockData.jackpot += entryFee;
    this.mockData.tradesToday += 1;
    
    return {
      success: true,
      tickets,
      transactionSignature: `tx_${Math.random().toString(36).substring(7)}`,
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
    
    return {
      address,
      totalTickets: Math.floor(Math.random() * 100) + 10,
      ticketsToday: Math.floor(Math.random() * 20) + 1,
      totalWinnings: Math.floor(Math.random() * 5000),
      referralCode: address.slice(-8),
      referrals: [], // Simplified for demo
      guild: Math.random() > 0.7 ? `guild_${Math.floor(Math.random() * 3)}` : undefined,
      lastTradeTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      isEligible: true,
      kycVerified: Math.random() > 0.3,
    };
  }

  // Simulate random draw
  async simulateDraw(): Promise<Winner[]> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const winnerCount = Math.floor(Math.random() * 5) + 1;
    const winners: Winner[] = [];
    
    for (let i = 0; i < winnerCount; i++) {
      const isNFT = Math.random() > 0.6;
      winners.push({
        id: `draw_winner_${i}`,
        address: generateMockAddress(),
        reward: {
          type: isNFT ? 'nft' : 'token',
          name: isNFT 
            ? nftNames[Math.floor(Math.random() * nftNames.length)]
            : `${tokenAmounts[Math.floor(Math.random() * tokenAmounts.length)]} $SVM`,
          value: isNFT 
            ? Math.floor(Math.random() * 1000) + 100
            : tokenAmounts[Math.floor(Math.random() * tokenAmounts.length)],
        },
        timestamp: new Date(),
        transactionSignature: `tx_${Math.random().toString(36).substring(7)}`,
      });
    }
    
    return winners;
  }

  // Real-time event simulation
  subscribeToEvents(callback: (event: any) => void): () => void {
    const interval = setInterval(() => {
      const eventTypes = ['new_entry', 'jackpot_update', 'new_winner'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      callback({
        type: eventType,
        data: {
          jackpot: this.mockData.jackpot + Math.floor(Math.random() * 100),
          tradesToday: this.mockData.tradesToday + 1,
        },
        timestamp: new Date(),
      });
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }
}

export default VaultService;