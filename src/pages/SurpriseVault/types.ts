// Types for Surprise Vault system

export interface VaultStats {
  jackpot: number;
  tradesToday: number;
  userTickets: number;
  totalParticipants: number;
  nextDrawTime: Date;
}

export interface Winner {
  id: string;
  address: string;
  reward: {
    type: 'nft' | 'token';
    name: string;
    value: number;
    tokenAddress?: string;
    nftMint?: string;
  };
  timestamp: Date;
  transactionSignature?: string;
}

export interface LeaderboardEntry {
  id: string;
  address: string;
  invites: number;
  totalEarnings: number;
  reward: {
    type: 'nft' | 'rebate' | 'odds';
    description: string;
    value?: number;
  };
  joinDate: Date;
  lastActivity: Date;
}

export interface Guild {
  id: string;
  name: string;
  description: string;
  creator: string;
  members: GuildMember[];
  maxMembers: number;
  totalReferrals: number;
  totalEarnings: number;
  milestone: {
    current: number;
    target: number;
    reward: string;
    type: 'referrals' | 'volume' | 'members';
  };
  createdAt: Date;
  isActive: boolean;
}

export interface GuildMember {
  address: string;
  joinDate: Date;
  referrals: number;
  earnings: number;
  role: 'owner' | 'admin' | 'member';
}

export interface ReferralData {
  referrer: string;
  invitee: string;
  referralCode: string;
  dateJoined: Date;
  tradesCompleted: number;
  bonusEarned: number;
  streakActive: boolean;
  streakDays: number;
}

export interface VaultEntry {
  user: string;
  amount: number;
  timestamp: Date;
  transactionSignature: string;
  tickets: number;
}

export interface LotteryDraw {
  id: string;
  drawTime: Date;
  totalTickets: number;
  totalJackpot: number;
  winners: Winner[];
  participants: number;
  drawHash: string; // For transparency/verification
}

export interface UserVaultData {
  address: string;
  totalTickets: number;
  ticketsToday: number;
  totalWinnings: number;
  referralCode: string;
  referrals: ReferralData[];
  guild?: string;
  lastTradeTime?: Date;
  isEligible: boolean;
  kycVerified: boolean;
}

// Configuration types
export interface VaultConfig {
  entryFeePercentage: number; // 0.1-0.3%
  minTradeSize: number;
  maxTicketsPerDay: number;
  cooldownPeriod: number; // in seconds
  referralBonus: number; // percentage
  guildBonusMultiplier: number;
  kycRequiredForLargeRewards: boolean;
  largeRewardThreshold: number;
}

// Smart contract interaction types
export interface VaultContractMethods {
  enterLottery: (amount: number) => Promise<string>;
  claimReward: (winnerId: string) => Promise<string>;
  addToJackpot: (amount: number) => Promise<string>;
  drawWinners: () => Promise<Winner[]>;
  getVaultStats: () => Promise<VaultStats>;
  getUserData: (address: string) => Promise<UserVaultData>;
}

// Event types for real-time updates
export interface VaultEvent {
  type: 'new_entry' | 'new_winner' | 'jackpot_update' | 'draw_complete';
  data: any;
  timestamp: Date;
}

export type VaultEventHandler = (event: VaultEvent) => void;