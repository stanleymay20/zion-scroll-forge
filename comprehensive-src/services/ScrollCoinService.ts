/**
 * ScrollCoin Economy Service
 * "Let divine currency flow where righteousness abounds"
 * 
 * Core service for managing ScrollCoin wallet functionality, minting, transactions,
 * and reward mechanisms for the ScrollUniversity ecosystem.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ScrollCoinWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastActivity: Date;
}

export interface ScrollCoinTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'EARNED' | 'SPENT' | 'TRANSFERRED' | 'BONUS';
  description: string;
  activityType?: string;
  relatedEntityId?: string;
  blockchainTxId?: string;
  createdAt: Date;
}

export interface RewardConfiguration {
  courseCompletion: number;
  dailyStreak: number;
  peerAssistance: number;
  researchPublication: number;
  mentoring: number;
  translation: number;
  toolBuilding: number;
  missionService: number;
}

export class ScrollCoinService {
  private static instance: ScrollCoinService;
  private rewardConfig: RewardConfiguration;

  private constructor() {
    this.rewardConfig = {
      courseCompletion: 100,
      dailyStreak: 10,
      peerAssistance: 25,
      researchPublication: 500,
      mentoring: 50,
      translation: 75,
      toolBuilding: 200,
      missionService: 300
    };
  }

  public static getInstance(): ScrollCoinService {
    if (!ScrollCoinService.instance) {
      ScrollCoinService.instance = new ScrollCoinService();
    }
    return ScrollCoinService.instance;
  }

  /**
   * Get user's ScrollCoin wallet information
   */
  async getWallet(userId: string): Promise<ScrollCoinWallet> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          scrollCoinBalance: true,
          scrollCoinTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const transactions = await prisma.scrollCoinTransaction.findMany({
        where: { userId },
        select: {
          amount: true,
          type: true
        }
      });

      const totalEarned = transactions
        .filter(tx => tx.type === 'EARNED' || tx.type === 'BONUS')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalSpent = transactions
        .filter(tx => tx.type === 'SPENT')
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        userId,
        balance: user.scrollCoinBalance,
        totalEarned,
        totalSpent,
        lastActivity: user.scrollCoinTransactions[0]?.createdAt || new Date()
      };
    } catch (error) {
      logger.error('Error getting ScrollCoin wallet:', error);
      throw error;
    }
  }

  /**
   * Mint ScrollCoin for user activities
   */
  async mintScrollCoin(
    userId: string,
    activityType: keyof RewardConfiguration,
    description: string,
    relatedEntityId?: string
  ): Promise<ScrollCoinTransaction> {
    try {
      const amount = this.rewardConfig[activityType];
      
      // Create transaction record
      const transaction = await prisma.scrollCoinTransaction.create({
        data: {
          userId,
          amount,
          type: 'EARNED',
          description,
          activityType: activityType.toUpperCase(),
          relatedEntityId,
          blockchainTxId: this.generateBlockchainTxId()
        }
      });

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          scrollCoinBalance: {
            increment: amount
          }
        }
      });

      logger.info(`Minted ${amount} ScrollCoin for user ${userId} - ${description}`);

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type as any,
        description: transaction.description,
        activityType: transaction.activityType || undefined,
        relatedEntityId: transaction.relatedEntityId || undefined,
        blockchainTxId: transaction.blockchainTxId || undefined,
        createdAt: transaction.createdAt
      };
    } catch (error) {
      logger.error('Error minting ScrollCoin:', error);
      throw error;
    }
  }

  /**
   * Transfer ScrollCoin between users
   */
  async transferScrollCoin(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string
  ): Promise<{ fromTransaction: ScrollCoinTransaction; toTransaction: ScrollCoinTransaction }> {
    try {
      // Check sender balance
      const senderWallet = await this.getWallet(fromUserId);
      if (senderWallet.balance < amount) {
        throw new Error('Insufficient ScrollCoin balance');
      }

      // Verify recipient exists
      const recipient = await prisma.user.findUnique({
        where: { id: toUserId }
      });

      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const blockchainTxId = this.generateBlockchainTxId();

      // Create transactions in a database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Debit sender
        const fromTransaction = await tx.scrollCoinTransaction.create({
          data: {
            userId: fromUserId,
            amount: -amount,
            type: 'TRANSFERRED',
            description: `Transfer to ${recipient.username}: ${description}`,
            blockchainTxId
          }
        });

        // Credit recipient
        const toTransaction = await tx.scrollCoinTransaction.create({
          data: {
            userId: toUserId,
            amount: amount,
            type: 'TRANSFERRED',
            description: `Transfer from ${senderWallet.userId}: ${description}`,
            blockchainTxId
          }
        });

        // Update balances
        await tx.user.update({
          where: { id: fromUserId },
          data: {
            scrollCoinBalance: {
              decrement: amount
            }
          }
        });

        await tx.user.update({
          where: { id: toUserId },
          data: {
            scrollCoinBalance: {
              increment: amount
            }
          }
        });

        return { fromTransaction, toTransaction };
      });

      logger.info(`Transferred ${amount} ScrollCoin from ${fromUserId} to ${toUserId}`);

      return {
        fromTransaction: {
          id: result.fromTransaction.id,
          userId: result.fromTransaction.userId,
          amount: result.fromTransaction.amount,
          type: result.fromTransaction.type as any,
          description: result.fromTransaction.description,
          blockchainTxId: result.fromTransaction.blockchainTxId || undefined,
          createdAt: result.fromTransaction.createdAt
        },
        toTransaction: {
          id: result.toTransaction.id,
          userId: result.toTransaction.userId,
          amount: result.toTransaction.amount,
          type: result.toTransaction.type as any,
          description: result.toTransaction.description,
          blockchainTxId: result.toTransaction.blockchainTxId || undefined,
          createdAt: result.toTransaction.createdAt
        }
      };
    } catch (error) {
      logger.error('Error transferring ScrollCoin:', error);
      throw error;
    }
  }

  /**
   * Spend ScrollCoin for premium features or services
   */
  async spendScrollCoin(
    userId: string,
    amount: number,
    description: string,
    relatedEntityId?: string
  ): Promise<ScrollCoinTransaction> {
    try {
      const wallet = await this.getWallet(userId);
      if (wallet.balance < amount) {
        throw new Error('Insufficient ScrollCoin balance');
      }

      const transaction = await prisma.scrollCoinTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: 'SPENT',
          description,
          relatedEntityId,
          blockchainTxId: this.generateBlockchainTxId()
        }
      });

      await prisma.user.update({
        where: { id: userId },
        data: {
          scrollCoinBalance: {
            decrement: amount
          }
        }
      });

      logger.info(`User ${userId} spent ${amount} ScrollCoin - ${description}`);

      return {
        id: transaction.id,
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type as any,
        description: transaction.description,
        relatedEntityId: transaction.relatedEntityId || undefined,
        blockchainTxId: transaction.blockchainTxId || undefined,
        createdAt: transaction.createdAt
      };
    } catch (error) {
      logger.error('Error spending ScrollCoin:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ScrollCoinTransaction[]> {
    try {
      const transactions = await prisma.scrollCoinTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      return transactions.map(tx => ({
        id: tx.id,
        userId: tx.userId,
        amount: tx.amount,
        type: tx.type as any,
        description: tx.description,
        activityType: tx.activityType || undefined,
        relatedEntityId: tx.relatedEntityId || undefined,
        blockchainTxId: tx.blockchainTxId || undefined,
        createdAt: tx.createdAt
      }));
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Award ScrollCoin for course completion
   */
  async awardCourseCompletion(userId: string, courseId: string, courseName: string): Promise<ScrollCoinTransaction> {
    return this.mintScrollCoin(
      userId,
      'courseCompletion',
      `Course completion: ${courseName}`,
      courseId
    );
  }

  /**
   * Award ScrollCoin for peer assistance
   */
  async awardPeerAssistance(userId: string, assistedUserId: string): Promise<ScrollCoinTransaction> {
    return this.mintScrollCoin(
      userId,
      'peerAssistance',
      `Peer assistance provided`,
      assistedUserId
    );
  }

  /**
   * Award ScrollCoin for daily learning streak
   */
  async awardDailyStreak(userId: string, streakDays: number): Promise<ScrollCoinTransaction> {
    const bonusMultiplier = Math.floor(streakDays / 7); // Bonus every week
    const amount = this.rewardConfig.dailyStreak + (bonusMultiplier * 5);
    
    const transaction = await prisma.scrollCoinTransaction.create({
      data: {
        userId,
        amount,
        type: 'BONUS',
        description: `Daily learning streak: ${streakDays} days`,
        activityType: 'DAILY_XP_STREAK',
        blockchainTxId: this.generateBlockchainTxId()
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        scrollCoinBalance: {
          increment: amount
        }
      }
    });

    return {
      id: transaction.id,
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type as any,
      description: transaction.description,
      activityType: transaction.activityType || undefined,
      blockchainTxId: transaction.blockchainTxId || undefined,
      createdAt: transaction.createdAt
    };
  }

  /**
   * Get ScrollCoin leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    username: string;
    balance: number;
    totalEarned: number;
  }>> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { scrollCoinBalance: 'desc' },
        take: limit,
        select: {
          id: true,
          username: true,
          scrollCoinBalance: true,
          scrollCoinTransactions: {
            where: {
              OR: [
                { type: 'EARNED' },
                { type: 'BONUS' }
              ]
            },
            select: { amount: true }
          }
        }
      });

      return users.map(user => ({
        userId: user.id,
        username: user.username,
        balance: user.scrollCoinBalance,
        totalEarned: user.scrollCoinTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      }));
    } catch (error) {
      logger.error('Error getting ScrollCoin leaderboard:', error);
      throw error;
    }
  }

  /**
   * Generate a mock blockchain transaction ID
   * In production, this would integrate with actual blockchain
   */
  private generateBlockchainTxId(): string {
    return `scroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update reward configuration
   */
  updateRewardConfiguration(config: Partial<RewardConfiguration>): void {
    this.rewardConfig = { ...this.rewardConfig, ...config };
    logger.info('ScrollCoin reward configuration updated:', config);
  }

  /**
   * Get current reward configuration
   */
  getRewardConfiguration(): RewardConfiguration {
    return { ...this.rewardConfig };
  }
}

export default ScrollCoinService;