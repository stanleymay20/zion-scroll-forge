/**
 * ScrollGold Service
 * "By the Spirit of Wisdom, we establish a kingdom economy on Earth"
 * 
 * Main service for ScrollGold blockchain integration, handling token minting,
 * transfers, burning, and wallet management with fraud prevention.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import ScrollGoldConfig from '../config/ScrollGold.config';
import {
  ScrollGoldTransactionData,
  ScrollGoldTransactionType,
  TransactionStatus,
  MintRewardRequest,
  TransferRequest,
  BurnRequest,
  WalletBalanceResponse,
  TransactionHistoryQuery,
  TransactionHistoryResponse,
  BlockchainTransactionReceipt
} from '../types/ScrollGold.types';

const prisma = new PrismaClient();

export class ScrollGoldService {
  private static instance: ScrollGoldService;

  private constructor() {}

  public static getInstance(): ScrollGoldService {
    if (!ScrollGoldService.instance) {
      ScrollGoldService.instance = new ScrollGoldService();
    }
    return ScrollGoldService.instance;
  }

  /**
   * Mint ScrollGold tokens as rewards for educational achievements
   */
  async mintReward(request: MintRewardRequest): Promise<ScrollGoldTransactionData> {
    try {
      logger.info('Minting ScrollGold reward', { request });

      // Validate request
      if (request.amount <= 0) {
        throw new Error('Reward amount must be greater than zero');
      }

      // Check for duplicate reward
      const existingReward = await prisma.ScrollGoldTransaction.findUnique({
        where: { rewardId: request.rewardId }
      });

      if (existingReward) {
        throw new Error('Reward has already been processed');
      }

      // Get user's wallet
      const wallet = await this.getOrCreateWallet(request.userId);

      if (wallet.isBlacklisted) {
        throw new Error('User wallet is blacklisted');
      }

      // Create transaction record
      const transaction = await prisma.ScrollGoldTransaction.create({
        data: {
          userId: request.userId,
          amount: request.amount,
          type: ScrollGoldTransactionType.MINT,
          status: TransactionStatus.PENDING,
          reason: request.reason,
          referenceId: request.referenceId,
          rewardId: request.rewardId,
          toAddress: wallet.address
        }
      });

      // If blockchain is enabled, mint on-chain
      if (ScrollGoldConfig.blockchainEnabled) {
        try {
          const receipt = await this.mintOnBlockchain(
            wallet.address,
            request.amount,
            request.reason,
            request.rewardId
          );

          // Update transaction with blockchain details
          const updatedTransaction = await prisma.ScrollGoldTransaction.update({
            where: { id: transaction.id },
            data: {
              status: TransactionStatus.CONFIRMED,
              blockchainTxHash: receipt.txHash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed,
              confirmedAt: new Date()
            }
          });

          // Update wallet balance
          await prisma.ScrollGoldWallet.update({
            where: { id: wallet.id },
            data: {
              balance: { increment: request.amount },
              totalEarned: { increment: request.amount },
              lastSyncedAt: new Date()
            }
          });

          logger.info('ScrollGold reward minted successfully', {
            transactionId: updatedTransaction.id,
            txHash: receipt.txHash
          });

          return updatedTransaction as ScrollGoldTransactionData;
        } catch (blockchainError) {
          // Mark transaction as failed
          await prisma.ScrollGoldTransaction.update({
            where: { id: transaction.id },
            data: { status: TransactionStatus.FAILED }
          });

          throw blockchainError;
        }
      } else {
        // Mock blockchain transaction for development
        const updatedTransaction = await prisma.ScrollGoldTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.CONFIRMED,
            blockchainTxHash: this.generateMockTxHash(),
            blockNumber: Math.floor(Date.now() / 1000),
            gasUsed: 21000,
            confirmedAt: new Date()
          }
        });

        // Update wallet balance
        await prisma.ScrollGoldWallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: request.amount },
            totalEarned: { increment: request.amount },
            lastSyncedAt: new Date()
          }
        });

        logger.info('ScrollGold reward minted (mock mode)', {
          transactionId: updatedTransaction.id
        });

        return updatedTransaction as ScrollGoldTransactionData;
      }
    } catch (error) {
      logger.error('Error minting ScrollGold reward:', error);
      throw error;
    }
  }

  /**
   * Transfer ScrollGold tokens between users
   */
  async transferTokens(request: TransferRequest): Promise<ScrollGoldTransactionData> {
    try {
      logger.info('Transferring ScrollGold tokens', { request });

      // Validate request
      if (request.amount <= 0) {
        throw new Error('Transfer amount must be greater than zero');
      }

      // Get wallets
      const fromWallet = await this.getOrCreateWallet(request.fromUserId);
      const toWallet = await this.getOrCreateWallet(request.toUserId);

      // Validate wallets
      if (fromWallet.isBlacklisted) {
        throw new Error('Sender wallet is blacklisted');
      }

      if (toWallet.isBlacklisted) {
        throw new Error('Recipient wallet is blacklisted');
      }

      // Check balance
      if (fromWallet.balance < request.amount) {
        throw new Error('Insufficient balance');
      }

      // Check transaction limits
      if (!fromWallet.isWhitelisted) {
        if (request.amount > fromWallet.maxTransactionAmount) {
          throw new Error('Amount exceeds maximum transaction limit');
        }

        // Check daily limit (simplified - should track daily amounts)
        const dailyTotal = await this.getDailyTransferTotal(request.fromUserId);
        if (dailyTotal + request.amount > fromWallet.dailyTransferLimit) {
          throw new Error('Amount exceeds daily transfer limit');
        }
      }

      // Create transaction record
      const transaction = await prisma.ScrollGoldTransaction.create({
        data: {
          userId: request.fromUserId,
          amount: request.amount,
          type: ScrollGoldTransactionType.TRANSFER,
          status: TransactionStatus.PENDING,
          reason: request.reason || 'Peer-to-peer transfer',
          fromAddress: fromWallet.address,
          toAddress: toWallet.address
        }
      });

      // If blockchain is enabled, transfer on-chain
      if (ScrollGoldConfig.blockchainEnabled) {
        try {
          const receipt = await this.transferOnBlockchain(
            fromWallet.address,
            toWallet.address,
            request.amount
          );

          // Update transaction with blockchain details
          const updatedTransaction = await prisma.ScrollGoldTransaction.update({
            where: { id: transaction.id },
            data: {
              status: TransactionStatus.CONFIRMED,
              blockchainTxHash: receipt.txHash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed,
              confirmedAt: new Date()
            }
          });

          // Update wallet balances
          await prisma.$transaction([
            prisma.ScrollGoldWallet.update({
              where: { id: fromWallet.id },
              data: {
                balance: { decrement: request.amount },
                lastSyncedAt: new Date()
              }
            }),
            prisma.ScrollGoldWallet.update({
              where: { id: toWallet.id },
              data: {
                balance: { increment: request.amount },
                lastSyncedAt: new Date()
              }
            })
          ]);

          logger.info('ScrollGold transfer completed successfully', {
            transactionId: updatedTransaction.id,
            txHash: receipt.txHash
          });

          return updatedTransaction as ScrollGoldTransactionData;
        } catch (blockchainError) {
          // Mark transaction as failed
          await prisma.ScrollGoldTransaction.update({
            where: { id: transaction.id },
            data: { status: TransactionStatus.FAILED }
          });

          throw blockchainError;
        }
      } else {
        // Mock blockchain transaction for development
        const updatedTransaction = await prisma.ScrollGoldTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.CONFIRMED,
            blockchainTxHash: this.generateMockTxHash(),
            blockNumber: Math.floor(Date.now() / 1000),
            gasUsed: 21000,
            confirmedAt: new Date()
          }
        });

        // Update wallet balances
        await prisma.$transaction([
          prisma.ScrollGoldWallet.update({
            where: { id: fromWallet.id },
            data: {
              balance: { decrement: request.amount },
              lastSyncedAt: new Date()
            }
          }),
          prisma.ScrollGoldWallet.update({
            where: { id: toWallet.id },
            data: {
              balance: { increment: request.amount },
              lastSyncedAt: new Date()
            }
          })
        ]);

        logger.info('ScrollGold transfer completed (mock mode)', {
          transactionId: updatedTransaction.id
        });

        return updatedTransaction as ScrollGoldTransactionData;
      }
    } catch (error) {
      logger.error('Error transferring ScrollGold tokens:', error);
      throw error;
    }
  }

  /**
   * Burn ScrollGold tokens when spending on courses or resources
   */
  async burnTokens(request: BurnRequest): Promise<ScrollGoldTransactionData> {
    try {
      logger.info('Burning ScrollGold tokens', { request });

      // Validate request
      if (request.amount <= 0) {
        throw new Error('Burn amount must be greater than zero');
      }

      // Get user's wallet
      const wallet = await this.getOrCreateWallet(request.userId);

      if (wallet.isBlacklisted) {
        throw new Error('User wallet is blacklisted');
      }

      // Check balance
      if (wallet.balance < request.amount) {
        throw new Error('Insufficient balance');
      }

      // Create transaction record
      const transaction = await prisma.ScrollGoldTransaction.create({
        data: {
          userId: request.userId,
          amount: request.amount,
          type: ScrollGoldTransactionType.BURN,
          status: TransactionStatus.PENDING,
          reason: request.reason,
          referenceId: request.referenceId,
          fromAddress: wallet.address
        }
      });

      // If blockchain is enabled, burn on-chain
      if (ScrollGoldConfig.blockchainEnabled) {
        try {
          const receipt = await this.burnOnBlockchain(
            wallet.address,
            request.amount,
            request.reason
          );

          // Update transaction with blockchain details
          const updatedTransaction = await prisma.ScrollGoldTransaction.update({
            where: { id: transaction.id },
            data: {
              status: TransactionStatus.CONFIRMED,
              blockchainTxHash: receipt.txHash,
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed,
              confirmedAt: new Date()
            }
          });

          // Update wallet balance
          await prisma.ScrollGoldWallet.update({
            where: { id: wallet.id },
            data: {
              balance: { decrement: request.amount },
              totalSpent: { increment: request.amount },
              lastSyncedAt: new Date()
            }
          });

          logger.info('ScrollGold tokens burned successfully', {
            transactionId: updatedTransaction.id,
            txHash: receipt.txHash
          });

          return updatedTransaction as ScrollGoldTransactionData;
        } catch (blockchainError) {
          // Mark transaction as failed
          await prisma.ScrollGoldTransaction.update({
            where: { id: transaction.id },
            data: { status: TransactionStatus.FAILED }
          });

          throw blockchainError;
        }
      } else {
        // Mock blockchain transaction for development
        const updatedTransaction = await prisma.ScrollGoldTransaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.CONFIRMED,
            blockchainTxHash: this.generateMockTxHash(),
            blockNumber: Math.floor(Date.now() / 1000),
            gasUsed: 21000,
            confirmedAt: new Date()
          }
        });

        // Update wallet balance
        await prisma.ScrollGoldWallet.update({
          where: { id: wallet.id },
          data: {
            balance: { decrement: request.amount },
            totalSpent: { increment: request.amount },
            lastSyncedAt: new Date()
          }
        });

        logger.info('ScrollGold tokens burned (mock mode)', {
          transactionId: updatedTransaction.id
        });

        return updatedTransaction as ScrollGoldTransactionData;
      }
    } catch (error) {
      logger.error('Error burning ScrollGold tokens:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance and statistics
   */
  async getWalletBalance(userId: string): Promise<WalletBalanceResponse> {
    try {
      const wallet = await this.getOrCreateWallet(userId);

      return {
        address: wallet.address,
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
        netRewards: wallet.totalEarned - wallet.totalSpent
      };
    } catch (error) {
      logger.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    query: TransactionHistoryQuery
  ): Promise<TransactionHistoryResponse> {
    try {
      const { userId, type, status, startDate, endDate, limit = 50, offset = 0 } = query;

      const where: any = {};

      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (status) where.status = status;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [transactions, total] = await Promise.all([
        prisma.ScrollGoldTransaction.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.ScrollGoldTransaction.count({ where })
      ]);

      return {
        transactions: transactions as ScrollGoldTransactionData[],
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      };
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw error;
    }
  }

  /**
   * Get or create wallet for user
   */
  private async getOrCreateWallet(userId: string): Promise<any> {
    let wallet = await prisma.ScrollGoldWallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      // Generate wallet address and keys
      const { address, publicKey, privateKeyHash } = this.generateWalletKeys();

      wallet = await prisma.ScrollGoldWallet.create({
        data: {
          userId,
          address,
          publicKey,
          privateKeyHash
        }
      });

      logger.info('Created new ScrollGold wallet', { userId, address });
    }

    return wallet;
  }

  /**
   * Generate wallet keys (simplified for development)
   */
  private generateWalletKeys(): {
    address: string;
    publicKey: string;
    privateKeyHash: string;
  } {
    // In production, use proper cryptographic key generation
    const random = Math.random().toString(36).substring(2);
    const timestamp = Date.now().toString(36);
    
    return {
      address: `0x${Buffer.from(random + timestamp).toString('hex').padStart(40, '0').substring(0, 40)}`,
      publicKey: `0x${Buffer.from(random + timestamp + 'public').toString('hex')}`,
      privateKeyHash: `0x${Buffer.from(random + timestamp + 'private').toString('hex')}`
    };
  }

  /**
   * Generate mock transaction hash
   */
  private generateMockTxHash(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `0x${Buffer.from(timestamp + random).toString('hex').padStart(64, '0')}`;
  }

  /**
   * Get daily transfer total for user
   */
  private async getDailyTransferTotal(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.ScrollGoldTransaction.aggregate({
      where: {
        userId,
        type: ScrollGoldTransactionType.TRANSFER,
        status: TransactionStatus.CONFIRMED,
        createdAt: { gte: today }
      },
      _sum: { amount: true }
    });

    return result._sum.amount || 0;
  }

  /**
   * Mint tokens on blockchain (placeholder for actual implementation)
   */
  private async mintOnBlockchain(
    address: string,
    amount: number,
    reason: string,
    rewardId: string
  ): Promise<BlockchainTransactionReceipt> {
    // In production, this would interact with the actual smart contract
    // For now, return mock receipt
    return {
      txHash: this.generateMockTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      gasUsed: 50000,
      status: 'success',
      timestamp: new Date()
    };
  }

  /**
   * Transfer tokens on blockchain (placeholder for actual implementation)
   */
  private async transferOnBlockchain(
    from: string,
    to: string,
    amount: number
  ): Promise<BlockchainTransactionReceipt> {
    // In production, this would interact with the actual smart contract
    return {
      txHash: this.generateMockTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      gasUsed: 21000,
      status: 'success',
      timestamp: new Date()
    };
  }

  /**
   * Burn tokens on blockchain (placeholder for actual implementation)
   */
  private async burnOnBlockchain(
    address: string,
    amount: number,
    reason: string
  ): Promise<BlockchainTransactionReceipt> {
    // In production, this would interact with the actual smart contract
    return {
      txHash: this.generateMockTxHash(),
      blockNumber: Math.floor(Date.now() / 1000),
      gasUsed: 30000,
      status: 'success',
      timestamp: new Date()
    };
  }
}

export default ScrollGoldService.getInstance();
