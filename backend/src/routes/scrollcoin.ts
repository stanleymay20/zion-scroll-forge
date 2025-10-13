/**
 * ScrollUniversity ScrollCoin Routes
 * "Let righteousness be rewarded with divine currency"
 */

import express from 'express';
import { logger } from '../utils/logger';
import ScrollCoinService from '../services/ScrollCoinService';
import BlockchainService from '../services/BlockchainService';
import RewardMechanismService from '../services/RewardMechanismService';

const router = express.Router();
const scrollCoinService = ScrollCoinService.getInstance();
const blockchainService = BlockchainService.getInstance();
const rewardService = RewardMechanismService.getInstance();

/**
 * GET /api/scrollcoin/balance
 * Get user's ScrollCoin balance and wallet information
 */
router.get('/balance', async (req, res) => {
  try {
    const userId = req.user?.id; // Assuming auth middleware sets req.user
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        scrollMessage: 'You must be authenticated to access your divine treasury.'
      });
    }

    const wallet = await scrollCoinService.getWallet(userId);
    
    res.json({
      success: true,
      wallet,
      message: 'ScrollCoin balance retrieved',
      scrollMessage: 'Your divine currency balance reflects your kingdom contributions.'
    });
  } catch (error) {
    logger.error('Get ScrollCoin balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve balance',
      scrollMessage: 'The ScrollCoin ledger could not be accessed at this time.'
    });
  }
});

/**
 * GET /api/scrollcoin/transactions
 * Get user's ScrollCoin transaction history
 */
router.get('/transactions', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        scrollMessage: 'You must be authenticated to view your transaction scrolls.'
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await scrollCoinService.getTransactionHistory(userId, limit, offset);
    
    res.json({
      success: true,
      transactions,
      pagination: { limit, offset, count: transactions.length },
      message: 'Transaction history retrieved',
      scrollMessage: 'Your ScrollCoin journey is recorded in the heavenly ledger.'
    });
  } catch (error) {
    logger.error('Get ScrollCoin transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transactions',
      scrollMessage: 'The transaction scrolls could not be opened at this time.'
    });
  }
});

/**
 * POST /api/scrollcoin/transfer
 * Transfer ScrollCoin to another user
 */
router.post('/transfer', async (req, res) => {
  try {
    const fromUserId = req.user?.id;
    if (!fromUserId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        scrollMessage: 'You must be authenticated to transfer divine currency.'
      });
    }

    const { toUserId, amount, description } = req.body;

    if (!toUserId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transfer parameters',
        scrollMessage: 'The transfer requires a valid recipient and positive amount.'
      });
    }

    const result = await scrollCoinService.transferScrollCoin(
      fromUserId,
      toUserId,
      amount,
      description || 'ScrollCoin transfer'
    );

    res.json({
      success: true,
      transfer: result,
      message: 'ScrollCoin transfer completed',
      scrollMessage: 'Your divine currency has been transferred with heavenly blessing.'
    });
  } catch (error) {
    logger.error('ScrollCoin transfer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transfer ScrollCoin',
      scrollMessage: 'The ScrollCoin transfer could not be completed at this time.'
    });
  }
});

/**
 * POST /api/scrollcoin/spend
 * Spend ScrollCoin for premium features or services
 */
router.post('/spend', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        scrollMessage: 'You must be authenticated to spend divine currency.'
      });
    }

    const { amount, description, relatedEntityId } = req.body;

    if (!amount || amount <= 0 || !description) {
      return res.status(400).json({
        success: false,
        error: 'Invalid spending parameters',
        scrollMessage: 'The purchase requires a valid amount and description.'
      });
    }

    const transaction = await scrollCoinService.spendScrollCoin(
      userId,
      amount,
      description,
      relatedEntityId
    );

    res.json({
      success: true,
      transaction,
      message: 'ScrollCoin spent successfully',
      scrollMessage: 'Your divine currency has been invested in kingdom advancement.'
    });
  } catch (error) {
    logger.error('ScrollCoin spend error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to spend ScrollCoin',
      scrollMessage: 'The ScrollCoin transaction could not be completed at this time.'
    });
  }
});

/**
 * GET /api/scrollcoin/leaderboard
 * Get ScrollCoin leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await scrollCoinService.getLeaderboard(limit);
    
    res.json({
      success: true,
      leaderboard,
      message: 'ScrollCoin leaderboard retrieved',
      scrollMessage: 'Behold the faithful stewards of divine currency.'
    });
  } catch (error) {
    logger.error('Get ScrollCoin leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve leaderboard',
      scrollMessage: 'The leaderboard scrolls could not be accessed at this time.'
    });
  }
});

/**
 * GET /api/scrollcoin/rewards/config
 * Get current reward configuration
 */
router.get('/rewards/config', async (req, res) => {
  try {
    const config = scrollCoinService.getRewardConfiguration();
    const rules = Array.from(rewardService.getRewardRules().entries()).map(([type, rule]) => ({
      eventType: type,
      ...rule
    }));
    
    res.json({
      success: true,
      rewardConfig: config,
      rewardRules: rules,
      message: 'Reward configuration retrieved',
      scrollMessage: 'The divine reward system operates by these sacred principles.'
    });
  } catch (error) {
    logger.error('Get reward config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reward configuration',
      scrollMessage: 'The reward scrolls could not be accessed at this time.'
    });
  }
});

/**
 * POST /api/scrollcoin/rewards/course-completion
 * Award ScrollCoin for course completion
 */
router.post('/rewards/course-completion', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { courseId, score, difficulty } = req.body;

    if (!courseId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Course ID and score are required'
      });
    }

    const result = await rewardService.processCourseCompletion(
      userId,
      courseId,
      score,
      difficulty || 'BEGINNER'
    );

    res.json({
      success: true,
      reward: result,
      message: 'Course completion reward processed',
      scrollMessage: result.awarded 
        ? `Congratulations! You have earned ${result.amount} ScrollCoin for your faithful completion.`
        : 'Your completion has been recorded, though no reward was given at this time.'
    });
  } catch (error) {
    logger.error('Course completion reward error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process course completion reward'
    });
  }
});

/**
 * POST /api/scrollcoin/rewards/peer-assistance
 * Award ScrollCoin for peer assistance
 */
router.post('/rewards/peer-assistance', async (req, res) => {
  try {
    const helperId = req.user?.id;
    if (!helperId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { helpedUserId, impact } = req.body;

    if (!helpedUserId) {
      return res.status(400).json({
        success: false,
        error: 'Helped user ID is required'
      });
    }

    const result = await rewardService.processPeerAssistance(
      helperId,
      helpedUserId,
      impact || 'MEDIUM'
    );

    res.json({
      success: true,
      reward: result,
      message: 'Peer assistance reward processed',
      scrollMessage: result.awarded 
        ? `Blessed are those who help others! You have earned ${result.amount} ScrollCoin.`
        : 'Your assistance has been noted, though no reward was given at this time.'
    });
  } catch (error) {
    logger.error('Peer assistance reward error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process peer assistance reward'
    });
  }
});

/**
 * GET /api/scrollcoin/blockchain/status
 * Get blockchain network status
 */
router.get('/blockchain/status', async (req, res) => {
  try {
    const status = await blockchainService.getNetworkStatus();
    
    res.json({
      success: true,
      blockchain: status,
      message: 'Blockchain status retrieved',
      scrollMessage: 'The heavenly ledger network status has been revealed.'
    });
  } catch (error) {
    logger.error('Get blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve blockchain status',
      scrollMessage: 'The heavenly ledger could not be accessed at this time.'
    });
  }
});

/**
 * GET /api/scrollcoin/stats/:userId
 * Get reward statistics for a user
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const requestingUserId = req.user?.id;
    const targetUserId = req.params.userId;

    // Users can only view their own stats unless they're admin
    if (requestingUserId !== targetUserId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        scrollMessage: 'You may only view your own reward statistics.'
      });
    }

    const stats = await rewardService.getUserRewardStats(targetUserId);
    
    res.json({
      success: true,
      stats,
      message: 'User reward statistics retrieved',
      scrollMessage: 'Your faithful service has been recorded in the heavenly books.'
    });
  } catch (error) {
    logger.error('Get user reward stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve reward statistics',
      scrollMessage: 'The reward scrolls could not be accessed at this time.'
    });
  }
});

export default router;