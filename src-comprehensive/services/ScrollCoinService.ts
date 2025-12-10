/**
 * ScrollGold Economy Service
 * "Let divine currency flow where righteousness abounds"
 * 
 * Core service for managing ScrollGold wallet functionality, minting, transactions,
 * and reward mechanisms for the ScrollUniversity ecosystem.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ScrollGoldWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastActivity: Date;
}

export interface ScrollGoldTransaction {
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

export class ScrollGoldService {
  private static instance: ScrollGoldService;
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

  public static getInstance(): ScrollGoldService {
    if (!ScrollGoldService.instance) {
      ScrollGoldService.instance = new ScrollGoldService();
    }
    return ScrollGoldService.instance;
  }

  /**
   * Get user's ScrollGold wallet information
   */
  async getWallet(userId: string): Promise<ScrollGoldWallet> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          ScrollGoldBalance: true,
          ScrollGoldTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const transactions = await prisma.ScrollGoldTransaction.findMany({
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
        balance: user.ScrollGoldBalance,
        totalEarned,
        totalSpent,
        lastActivity: user.ScrollGoldTransactions[0]?.createdAt || new Date()
      };
    } catch (error) {
      logger.error('Error getting ScrollGold wallet:', error);
      throw error;
    }
  }

  /**
   * Mint ScrollGold for user activities
   */
  async mintScrollGold(
    userId: string,
    activityType: keyof RewardConfiguration,
    description: string,
    relatedEntityId?: string
  ): Promise<ScrollGoldTransaction> {
    try {
      const amount = this.rewardConfig[activityType];
      
      // Create transaction record
      const transaction = await prisma.ScrollGoldTransaction.create({
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
          ScrollGoldBalance: {
            increment: amount
          }
        }
      });

      logger.info(`Minted ${amount} ScrollGold for user ${userId} - ${description}`);

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
      logger.error('Error minting ScrollGold:', error);
      throw error;
    }
  }

  /**
   * Transfer ScrollGold between users
   */
  async transferScrollGold(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string
  ): Promise<{ fromTransaction: ScrollGoldTransaction; toTransaction: ScrollGoldTransaction }> {
    try {
      // Check sender balance
      const senderWallet = await this.getWallet(fromUserId);
      if (senderWallet.balance < amount) {
        throw new Error('Insufficient ScrollGold balance');
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
        const fromTransaction = await tx.ScrollGoldTransaction.create({
          data: {
            userId: fromUserId,
            amount: -amount,
            type: 'TRANSFERRED',
            description: `Transfer to ${recipient.username}: ${description}`,
            blockchainTxId
          }
        });

        // Credit recipient
        const toTransaction = await tx.ScrollGoldTransaction.create({
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
            ScrollGoldBalance: {
              decrement: amount
            }
          }
        });

        await tx.user.update({
          where: { id: toUserId },
          data: {
            ScrollGoldBalance: {
              increment: amount
            }
          }
        });

        return { fromTransaction, toTransaction };
      });

      logger.info(`Transferred ${amount} ScrollGold from ${fromUserId} to ${toUserId}`);

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
      logger.error('Error transferring ScrollGold:', error);
      throw error;
    }
  }

  /**
   * Spend ScrollGold for premium features or services
   */
  async spendScrollGold(
    userId: string,
    amount: number,
    description: string,
    relatedEntityId?: string
  ): Promise<ScrollGoldTransaction> {
    try {
      const wallet = await this.getWallet(userId);
      if (wallet.balance < amount) {
        throw new Error('Insufficient ScrollGold balance');
      }

      const transaction = await prisma.ScrollGoldTransaction.create({
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
          ScrollGoldBalance: {
            decrement: amount
          }
        }
      });

      logger.info(`User ${userId} spent ${amount} ScrollGold - ${description}`);

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
      logger.error('Error spending ScrollGold:', error);
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
  ): Promise<ScrollGoldTransaction[]> {
    try {
      const transactions = await prisma.ScrollGoldTransaction.findMany({
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
   * Award ScrollGold for course completion
   */
  async awardCourseCompletion(userId: string, courseId: string, courseName: string): Promise<ScrollGoldTransaction> {
    return this.mintScrollGold(
      userId,
      'courseCompletion',
      `Course completion: ${courseName}`,
      courseId
    );
  }

  /**
   * Award ScrollGold for peer assistance
   */
  async awardPeerAssistance(userId: string, assistedUserId: string): Promise<ScrollGoldTransaction> {
    return this.mintScrollGold(
      userId,
      'peerAssistance',
      `Peer assistance provided`,
      assistedUserId
    );
  }

  /**
   * Award ScrollGold for daily learning streak
   */
  async awardDailyStreak(userId: string, streakDays: number): Promise<ScrollGoldTransaction> {
    const bonusMultiplier = Math.floor(streakDays / 7); // Bonus every week
    const amount = this.rewardConfig.dailyStreak + (bonusMultiplier * 5);
    
    const transaction = await prisma.ScrollGoldTransaction.create({
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
        ScrollGoldBalance: {
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
   * Get ScrollGold leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<Array<{
    userId: string;
    username: string;
    balance: number;
    totalEarned: number;
  }>> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { ScrollGoldBalance: 'desc' },
        take: limit,
        select: {
          id: true,
          username: true,
          ScrollGoldBalance: true,
          ScrollGoldTransactions: {
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
        balance: user.ScrollGoldBalance,
        totalEarned: user.ScrollGoldTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      }));
    } catch (error) {
      logger.error('Error getting ScrollGold leaderboard:', error);
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
    logger.info('ScrollGold reward configuration updated:', config);
  }

  /**
   * Get current reward configuration
   */
  getRewardConfiguration(): RewardConfiguration {
    return { ...this.rewardConfig };
  }
}

export default ScrollGoldService;