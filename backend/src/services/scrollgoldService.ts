/**
 * ScrollGold Service
 * Core service for ScrollGold token economy management
 * "Gold refined by fire" - Revelation 3:18
 */

import { PrismaClient } from '@prisma/client';
import {
  ScrollGoldWallet,
  ScrollGoldTransaction,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  ScrollGoldReward,
  StudentRewardEconomy,
  FacultyRewardSystem
} from '../types/scrollgold.types';

const prisma = new PrismaClient();

export default class ScrollGoldService {
  /**
   * Create a new ScrollGold wallet for a user
   */
  async createWallet(userId: string): Promise<ScrollGoldWallet> {
    const wallet = await prisma.scrollGoldWallet.create({
      data: {
        userId,
        balance: 0,
        lockedBalance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0
      }
    });

    return wallet as ScrollGoldWallet;
  }

  /**
   * Get wallet by user ID
   */
  async getWallet(userId: string): Promise<ScrollGoldWallet | null> {
    const wallet = await prisma.scrollGoldWallet.findUnique({
      where: { userId }
    });

    return wallet as ScrollGoldWallet | null;
  }

  /**
   * Get or create wallet
   */
  async getOrCreateWallet(userId: string): Promise<ScrollGoldWallet> {
    let wallet = await this.getWallet(userId);
    
    if (!wallet) {
      wallet = await this.createWallet(userId);
    }

    return wallet;
  }

  /**
   * Award ScrollGold to a user
   */
  async awardScrollGold(
    userId: string,
    amount: number,
    category: TransactionCategory,
    description: string,
    metadata?: Record<string, any>
  ): Promise<ScrollGoldTransaction> {
    const wallet = await this.getOrCreateWallet(userId);

    // Calculate multiplier based on student performance
    const multiplier = await this.calculateRewardMultiplier(userId, category);
    const finalAmount = Math.floor(amount * multiplier);

    // Update wallet
    const updatedWallet = await prisma.scrollGoldWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: finalAmount },
        lifetimeEarned: { increment: finalAmount }
      }
    });

    // Create transaction record
    const transaction = await prisma.scrollGoldTransaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.EARN,
        amount: finalAmount,
        balance: updatedWallet.balance,
        category,
        source: 'SYSTEM',
        description,
        metadata: {
          ...metadata,
          baseAmount: amount,
          multiplier
        },
        status: TransactionStatus.COMPLETED
      }
    });

    return transaction as ScrollGoldTransaction;
  }

  /**
   * Spend ScrollGold
   */
  async spendScrollGold(
    userId: string,
    amount: number,
    category: TransactionCategory,
    description: string,
    metadata?: Record<string, any>
  ): Promise<ScrollGoldTransaction> {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new Error('Insufficient ScrollGold balance');
    }

    // Update wallet
    const updatedWallet = await prisma.scrollGoldWallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: amount },
        lifetimeSpent: { increment: amount }
      }
    });

    // Create transaction record
    const transaction = await prisma.scrollGoldTransaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.SPEND,
        amount: -amount,
        balance: updatedWallet.balance,
        category,
        source: 'USER',
        description,
        metadata,
        status: TransactionStatus.COMPLETED
      }
    });

    return transaction as ScrollGoldTransaction;
  }

  /**
   * Transfer ScrollGold between users
   */
  async transferScrollGold(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string
  ): Promise<{ fromTx: ScrollGoldTransaction; toTx: ScrollGoldTransaction }> {
    const fromWallet = await this.getOrCreateWallet(fromUserId);
    const toWallet = await this.getOrCreateWallet(toUserId);

    if (fromWallet.balance < amount) {
      throw new Error('Insufficient ScrollGold balance for transfer');
    }

    // Deduct from sender
    const fromTx = await this.spendScrollGold(
      fromUserId,
      amount,
      TransactionCategory.MARKETPLACE_PURCHASE,
      `Transfer to user: ${description}`,
      { transferTo: toUserId }
    );

    // Add to receiver
    const toTx = await this.awardScrollGold(
      toUserId,
      amount,
      TransactionCategory.SYSTEM_REWARD,
      `Transfer from user: ${description}`,
      { transferFrom: fromUserId }
    );

    return { fromTx, toTx };
  }

  /**
   * Calculate reward multiplier based on student performance
   */
  private async calculateRewardMultiplier(
    userId: string,
    category: TransactionCategory
  ): Promise<number> {
    let multiplier = 1.0;

    // Get student economy data
    const economy = await this.getStudentEconomy(userId);

    if (!economy) return multiplier;

    // Streak bonus (up to 1.5x)
    if (economy.currentStreak >= 30) multiplier += 0.5;
    else if (economy.currentStreak >= 14) multiplier += 0.3;
    else if (economy.currentStreak >= 7) multiplier += 0.15;

    // Grade performance bonus (up to 1.3x)
    if (economy.averageGrade >= 95) multiplier += 0.3;
    else if (economy.averageGrade >= 90) multiplier += 0.2;
    else if (economy.averageGrade >= 85) multiplier += 0.1;

    // Spiritual growth bonus (up to 1.2x)
    if (economy.spiritualGrowthScore >= 90) multiplier += 0.2;
    else if (economy.spiritualGrowthScore >= 75) multiplier += 0.1;

    // Community contribution bonus (up to 1.2x)
    if (economy.communityContribution >= 100) multiplier += 0.2;
    else if (economy.communityContribution >= 50) multiplier += 0.1;

    return Math.min(multiplier, 3.0); // Cap at 3x
  }

  /**
   * Get student reward economy data
   */
  async getStudentEconomy(userId: string): Promise<StudentRewardEconomy | null> {
    const economy = await prisma.studentRewardEconomy.findUnique({
      where: { userId }
    });

    return economy as StudentRewardEconomy | null;
  }

  /**
   * Get faculty reward system data
   */
  async getFacultyRewardSystem(facultyId: string): Promise<FacultyRewardSystem | null> {
    const system = await prisma.facultyRewardSystem.findUnique({
      where: { facultyId }
    });

    return system as FacultyRewardSystem | null;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ScrollGoldTransaction[]> {
    const wallet = await this.getWallet(userId);
    
    if (!wallet) return [];

    const transactions = await prisma.scrollGoldTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return transactions as ScrollGoldTransaction[];
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet?.balance || 0;
  }

  /**
   * Award course completion reward
   */
  async awardCourseCompletion(
    userId: string,
    courseId: string,
    grade: number
  ): Promise<ScrollGoldTransaction> {
    let baseAmount = 100;

    // Grade-based bonus
    if (grade >= 95) baseAmount = 200;
    else if (grade >= 90) baseAmount = 150;
    else if (grade >= 85) baseAmount = 125;

    return this.awardScrollGold(
      userId,
      baseAmount,
      TransactionCategory.COURSE_COMPLETION,
      `Course completion reward`,
      { courseId, grade }
    );
  }

  /**
   * Award assignment excellence
   */
  async awardAssignmentExcellence(
    userId: string,
    assignmentId: string,
    score: number
  ): Promise<ScrollGoldTransaction | null> {
    if (score < 90) return null;

    const amount = score >= 95 ? 50 : 25;

    return this.awardScrollGold(
      userId,
      amount,
      TransactionCategory.ASSIGNMENT_SUBMISSION,
      `Assignment excellence reward`,
      { assignmentId, score }
    );
  }

  /**
   * Award spiritual formation participation
   */
  async awardSpiritualFormation(
    userId: string,
    activityType: string,
    points: number
  ): Promise<ScrollGoldTransaction> {
    return this.awardScrollGold(
      userId,
      points,
      TransactionCategory.SPIRITUAL_FORMATION,
      `Spiritual formation: ${activityType}`,
      { activityType }
    );
  }

  /**
   * Process tuition payment with ScrollGold
   */
  async payTuition(
    userId: string,
    courseId: string,
    amount: number
  ): Promise<ScrollGoldTransaction> {
    return this.spendScrollGold(
      userId,
      amount,
      TransactionCategory.TUITION_PAYMENT,
      `Tuition payment for course`,
      { courseId }
    );
  }
}
