// Types for Surprise Vault system

/**
 * Current statistics and state of the vault system
 */
export interface VaultStats {
  /** Current jackpot amount in USD */
  jackpot: number;
  /** Number of trades executed today */
  tradesToday: number;
  /** Number of lottery tickets the current user has */
  userTickets: number;
  /** Total number of users participating in current draw */
  totalParticipants: number;
  /** Date and time of the next lottery draw */
  nextDrawTime: Date;
}

/**
 * Represents a lottery draw winner
 */
export interface Winner {
  /** Unique identifier for this win */
  id: string;
  /** Wallet address of the winner */
  address: string;
  /** Details of the reward won */
  reward: {
    /** Type of reward: NFT or fungible token */
    type: 'nft' | 'token';
    /** Display name of the reward */
    name: string;
    /** Monetary value of the reward in USD */
    value: number;
    /** Token contract address for fungible tokens */
    tokenAddress?: string;
    /** NFT mint address for NFT rewards */
    nftMint?: string;
  };
  /** When the win occurred */
  timestamp: Date;
  /** Blockchain transaction signature for the reward transfer */
  transactionSignature?: string;
}

/**
 * Entry in the referral leaderboard
 */
export interface LeaderboardEntry {
  /** Unique identifier for this entry */
  id: string;
  /** Wallet address of the referrer */
  address: string;
  /** Number of successful referrals */
  invites: number;
  /** Total USD value earned from referrals */
  totalEarnings: number;
  /** Current tier reward for this referrer */
  reward: {
    /** Type of reward tier */
    type: 'nft' | 'rebate' | 'odds';
    /** Human-readable description of the reward */
    description: string;
    /** Numerical value if applicable */
    value?: number;
  };
  /** When this user first made a referral */
  joinDate: Date;
  /** Most recent referral activity */
  lastActivity: Date;
}

/**
 * Guild/team system for collaborative participation
 */
/**
 * Guild/team system for collaborative participation
 */
export interface Guild {
  /** Unique guild identifier */
  id: string;
  /** Human-readable guild name */
  name: string;
  /** Guild description and purpose */
  description: string;
  /** Wallet address of guild creator */
  creator: string;
  /** List of all guild members */
  members: GuildMember[];
  /** Maximum allowed members in this guild */
  maxMembers: number;
  /** Total successful referrals by all members */
  totalReferrals: number;
  /** Total USD earnings by all members */
  totalEarnings: number;
  /** Current milestone being worked toward */
  milestone: {
    /** Current progress value */
    current: number;
    /** Target value to reach */
    target: number;
    /** Description of milestone reward */
    reward: string;
    /** Type of milestone metric */
    type: 'referrals' | 'volume' | 'members';
  };
  /** When the guild was created */
  createdAt: Date;
  /** Whether the guild is accepting new members */
  isActive: boolean;
}

/**
 * Individual member of a guild
 */
export interface GuildMember {
  /** Member's wallet address */
  address: string;
  /** When they joined the guild */
  joinDate: Date;
  /** Number of referrals this member has made */
  referrals: number;
  /** Total earnings this member has generated */
  earnings: number;
  /** Permission level within the guild */
  role: 'owner' | 'admin' | 'member';
}

/**
 * Referral relationship and performance data
 */
export interface ReferralData {
  /** Wallet address of the person who made the referral */
  referrer: string;
  /** Wallet address of the person who was referred */
  invitee: string;
  /** Unique referral code used */
  referralCode: string;
  /** When the referral was completed */
  dateJoined: Date;
  /** Number of trades the invitee has completed */
  tradesCompleted: number;
  /** USD bonus earned from this referral */
  bonusEarned: number;
  /** Whether the referral streak is still active */
  streakActive: boolean;
  /** Number of consecutive days with referral activity */
  streakDays: number;
}

/**
 * Single entry into the lottery vault
 */
export interface VaultEntry {
  /** Wallet address of participant */
  user: string;
  /** USD amount of the trade that generated this entry */
  amount: number;
  /** When the entry was created */
  timestamp: Date;
  /** Blockchain transaction that created this entry */
  transactionSignature: string;
  /** Number of lottery tickets earned from this entry */
  tickets: number;
}

/**
 * Completed lottery draw with results
 */
export interface LotteryDraw {
  /** Unique identifier for this draw */
  id: string;
  /** When the draw was executed */
  drawTime: Date;
  /** Total number of tickets in this draw */
  totalTickets: number;
  /** Total jackpot amount distributed */
  totalJackpot: number;
  /** List of all winners from this draw */
  winners: Winner[];
  /** Number of unique participants */
  participants: number;
  /** Cryptographic hash for draw verification */
  drawHash: string;
}

/**
 * Complete vault participation data for a user
 */
export interface UserVaultData {
  /** User's wallet address */
  address: string;
  /** Total lottery tickets across all time */
  totalTickets: number;
  /** Tickets earned today only */
  ticketsToday: number;
  /** Total USD value won from draws */
  totalWinnings: number;
  /** User's unique referral code */
  referralCode: string;
  /** List of users this person has referred */
  referrals: ReferralData[];
  /** ID of guild this user belongs to, if any */
  guild?: string;
  /** Most recent trade timestamp */
  lastTradeTime?: Date;
  /** Whether user meets eligibility requirements */
  isEligible: boolean;
  /** Whether user has completed KYC verification */
  kycVerified: boolean;
}

/**
 * System configuration parameters for the vault
 */
export interface VaultConfig {
  /** Percentage of trade value taken as entry fee (0.1-0.3%) */
  entryFeePercentage: number;
  /** Minimum trade size to earn tickets (USD) */
  minTradeSize: number;
  /** Maximum tickets a user can earn per day */
  maxTicketsPerDay: number;
  /** Cooldown period between trades (seconds) */
  cooldownPeriod: number;
  /** Bonus percentage for successful referrals */
  referralBonus: number;
  /** Multiplier applied to guild member rewards */
  guildBonusMultiplier: number;
  /** Whether large rewards require KYC verification */
  kycRequiredForLargeRewards: boolean;
  /** Threshold value that triggers KYC requirement (USD) */
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