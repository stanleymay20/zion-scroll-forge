/**
 * ScrollCoin Wallet Frontend Types
 * "By the Spirit of Wisdom, we establish a kingdom economy"
 */

export interface ScrollCoinWallet {
  address: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  netRewards: number;
  statistics?: WalletStatistics;
}

export interface WalletStatistics {
  weeklyEarnings: number;
  monthlyEarnings: number;
  weeklySpending: number;
  monthlySpending: number;
  averageTransactionAmount: number;
  totalTransactions: number;
  largestTransaction: number;
  mostCommonTransactionType: string;
}

export interface ScrollCoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  blockchainTxHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  reason: string;
  referenceId?: string;
  rewardId?: string;
  fromAddress?: string;
  toAddress?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
}

export enum TransactionType {
  MINT = 'MINT',
  BURN = 'BURN',
  TRANSFER = 'TRANSFER',
  REWARD = 'REWARD',
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface TransactionHistoryResponse {
  transactions: ScrollCoinTransaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionFilter {
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ExchangeRate {
  id: string;
  rateToUSD: number;
  rateFromUSD: number;
  source: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface ExchangeConversion {
  scrollCoinAmount: number;
  usdAmount: number;
  rate: number;
  timestamp: string;
}

export interface TransferRequest {
  toUserId: string;
  amount: number;
  reason?: string;
}

export interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: 'COURSE' | 'ASSESSMENT' | 'COMMUNITY' | 'SPIRITUAL' | 'REFERRAL';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  estimatedTime: string;
  requirements: string[];
  icon: string;
  actionUrl: string;
}

export interface SpendingOption {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: 'COURSE' | 'RESOURCE' | 'CERTIFICATION' | 'PREMIUM' | 'DONATION';
  imageUrl: string;
  available: boolean;
  discount?: number;
  actionUrl: string;
}

export interface WalletSecuritySettings {
  dailyTransferLimit: number;
  maxTransactionAmount: number;
  isWhitelisted: boolean;
  isBlacklisted: boolean;
  twoFactorEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface BlockchainVerification {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  status: 'success' | 'failed';
  explorerUrl: string;
}
