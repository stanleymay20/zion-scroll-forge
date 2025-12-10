/**
 * ScrollGold Wallet API Routes
 * "Store up for yourselves treasures in heaven" (Matthew 6:20)
 * 
 * Provides REST API endpoints for ScrollGold wallet management including:
 * - Wallet balance and statistics
 * - Transaction history
 * - Earning opportunities
 * - Discount application
 * - Admin bestowment (admin only)
 * 
 * Validates: Requirements 11.4, 11.6
 */

import express, { Request, Response, NextFunction } from 'express';
import { ScrollGoldBillingService } from '../services/ScrollGoldBillingService';
import { authenticateToken, authorize } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();
const scrollGoldService = new ScrollGoldBillingService();

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Extract user ID from authenticated request
 */
const getUserId = (req: Request): string => {
  const user = (req as any).user;
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

/**
 * Error handler wrapper for async routes
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// ============================================================================
// PUBLIC ENDPOINTS (Authenticated Users)
// ============================================================================

/**
 * GET /api/scrollgold/wallet
 * Get user's wallet balance and comprehensive statistics
 * 
 * Validates: Requirements 11.4, 11.6
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     userId: string,
 *     currentBalance: number,
 *     lifetimeEarned: number,
 *     lifetimeSpent: number,
 *     totalModuleCompletions: number,
 *     totalStreakDays: number,
 *     totalCommunityServiceHours: number,
 *     totalFaithfulPayments: number,
 *     isFrozen: boolean
 *   }
 * }
 */
router.get(
  '/wallet',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    logger.info('Fetching wallet balance', { userId });

    const wallet = await scrollGoldService.getWalletBalance(userId);

    res.json({
      success: true,
      data: wallet
    });
  })
);

/**
 * GET /api/scrollgold/transactions
 * Get user's transaction history with pagination
 * 
 * Query Parameters:
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 * 
 * Validates: Requirements 11.4, 11.6
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     transactions: Array<{
 *       id: string,
 *       transactionType: 'EARNED' | 'SPENT',
 *       amount: number,
 *       description: string,
 *       createdAt: Date,
 *       billingRelated: boolean,
 *       earningRuleName?: string,
 *       spendingOptionName?: string
 *     }>,
 *     pagination: {
 *       limit: number,
 *       offset: number,
 *       hasMore: boolean
 *     }
 *   }
 * }
 */
router.get(
  '/transactions',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    logger.info('Fetching transaction history', { userId, limit, offset });

    const transactions = await scrollGoldService.getTransactionHistory(userId, limit + 1, offset);

    // Check if there are more results
    const hasMore = transactions.length > limit;
    const data = hasMore ? transactions.slice(0, limit) : transactions;

    res.json({
      success: true,
      data: {
        transactions: data,
        pagination: {
          limit,
          offset,
          hasMore
        }
      }
    });
  })
);

/**
 * GET /api/scrollgold/earning-opportunities
 * Get available earning opportunities for student motivation
 * 
 * Validates: Requirements 11.4, 11.6
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     opportunities: Array<{
 *       id: string,
 *       ruleName: string,
 *       ruleType: string,
 *       description: string,
 *       baseAmount: number,
 *       minThreshold?: number,
 *       maxAmount?: number,
 *       scriptureReference?: string,
 *       kingdomPrinciple?: string
 *     }>
 *   }
 * }
 */
router.get(
  '/earning-opportunities',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    logger.info('Fetching earning opportunities', { userId });

    const opportunities = await scrollGoldService.getEarningOpportunities(userId);

    res.json({
      success: true,
      data: {
        opportunities
      }
    });
  })
);

/**
 * GET /api/scrollgold/spending-options
 * Get available spending options
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     options: Array<{
 *       id: string,
 *       optionName: string,
 *       optionType: string,
 *       description: string,
 *       costAmount: number,
 *       discountValueCents?: number,
 *       maxDiscountPercentage?: number,
 *       featureCode?: string,
 *       durationDays?: number
 *     }>
 *   }
 * }
 */
router.get(
  '/spending-options',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);

    logger.info('Fetching spending options', { userId });

    const options = await scrollGoldService.getSpendingOptions(userId);

    res.json({
      success: true,
      data: {
        options
      }
    });
  })
);

/**
 * POST /api/scrollgold/apply-discount
 * Apply ScrollGold discount to a purchase
 * 
 * Body:
 * {
 *   invoiceAmountCents: number,
 *   scrollGoldToSpend: number
 * }
 * 
 * Validates: Requirements 11.4
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     scrollGoldAmount: number,
 *     discountValueCents: number,
 *     remainingBalance: number,
 *     maxDiscountReached: boolean
 *   }
 * }
 */
router.post(
  '/apply-discount',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { invoiceAmountCents, scrollGoldToSpend } = req.body;

    // Validation
    if (!invoiceAmountCents || typeof invoiceAmountCents !== 'number' || invoiceAmountCents <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invoice amount'
      });
    }

    if (!scrollGoldToSpend || typeof scrollGoldToSpend !== 'number' || scrollGoldToSpend <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ScrollGold amount'
      });
    }

    logger.info('Applying ScrollGold discount', { userId, invoiceAmountCents, scrollGoldToSpend });

    const discount = await scrollGoldService.applyScrollGoldDiscount(
      userId,
      invoiceAmountCents,
      scrollGoldToSpend
    );

    res.json({
      success: true,
      data: discount
    });
  })
);

/**
 * GET /api/scrollgold/calculate-max-discount
 * Calculate maximum possible ScrollGold discount for an invoice
 * 
 * Query Parameters:
 * - invoiceAmountCents: number
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     maxScrollGoldUsable: number,
 *     maxDiscountCents: number,
 *     userBalance: number,
 *     canAfford: boolean
 *   }
 * }
 */
router.get(
  '/calculate-max-discount',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const invoiceAmountCents = parseInt(req.query.invoiceAmountCents as string);

    if (!invoiceAmountCents || invoiceAmountCents <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid invoice amount'
      });
    }

    logger.info('Calculating max ScrollGold discount', { userId, invoiceAmountCents });

    const calculation = await scrollGoldService.calculateMaxScrollGoldDiscount(
      userId,
      invoiceAmountCents
    );

    res.json({
      success: true,
      data: calculation
    });
  })
);

/**
 * POST /api/scrollgold/unlock-premium-feature
 * Unlock premium features with ScrollGold
 * 
 * Body:
 * {
 *   featureType: 'AI_LAB_HOURS' | 'MENTORSHIP_CIRCLE',
 *   quantity: number (hours for AI lab, months for mentorship)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string,
 *     expiresAt?: Date
 *   }
 * }
 */
router.post(
  '/unlock-premium-feature',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { featureType, quantity } = req.body;

    if (!featureType || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid feature type or quantity'
      });
    }

    logger.info('Unlocking premium feature', { userId, featureType, quantity });

    let result;

    switch (featureType) {
      case 'AI_LAB_HOURS':
        result = await scrollGoldService.unlockPremiumAILabHours(userId, quantity);
        break;
      case 'MENTORSHIP_CIRCLE':
        result = await scrollGoldService.unlockMentorshipCircle(userId, quantity);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unknown feature type'
        });
    }

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    res.json({
      success: true,
      data: {
        message: result.message,
        expiresAt: result.expiresAt
      }
    });
  })
);

/**
 * GET /api/scrollgold/feature-access/:featureCode
 * Check if user has access to a premium feature
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     hasAccess: boolean,
 *     expiresAt?: Date,
 *     hoursRemaining?: number
 *   }
 * }
 */
router.get(
  '/feature-access/:featureCode',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { featureCode } = req.params;

    logger.info('Checking feature access', { userId, featureCode });

    const access = await scrollGoldService.checkFeatureAccess(userId, featureCode);

    res.json({
      success: true,
      data: access
    });
  })
);

/**
 * POST /api/scrollgold/purchase-governance-votes
 * Purchase governance votes with ScrollGold
 * 
 * Body:
 * {
 *   voteCount: number,
 *   proposalId?: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string,
 *     totalVotes: number
 *   }
 * }
 */
router.post(
  '/purchase-governance-votes',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { voteCount, proposalId } = req.body;

    if (!voteCount || voteCount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote count'
      });
    }

    logger.info('Purchasing governance votes', { userId, voteCount, proposalId });

    const result = await scrollGoldService.purchaseGovernanceVotes(userId, voteCount, proposalId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    res.json({
      success: true,
      data: {
        message: result.message,
        totalVotes: result.totalVotes
      }
    });
  })
);

/**
 * GET /api/scrollgold/governance-voting-power
 * Get user's governance voting power
 * 
 * Query Parameters:
 * - proposalId?: string
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     totalVotesPurchased: number,
 *     votesRemaining: number,
 *     votesUsed: number,
 *     canVote: boolean
 *   }
 * }
 */
router.get(
  '/governance-voting-power',
  authenticateToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const proposalId = req.query.proposalId as string | undefined;

    logger.info('Fetching governance voting power', { userId, proposalId });

    const votingPower = await scrollGoldService.getGovernanceVotingPower(userId, proposalId);

    res.json({
      success: true,
      data: votingPower
    });
  })
);

// ============================================================================
// ADMIN ENDPOINTS (Admin Only)
// ============================================================================

/**
 * POST /api/scrollgold/bestow
 * Bestow ScrollGold to a user (admin honor-based awards)
 * 
 * Body:
 * {
 *   userId: string,
 *   amount: number,
 *   reason: string
 * }
 * 
 * Validates: Requirements 11.4, 11.6
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string
 *   }
 * }
 */
router.post(
  '/bestow',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = getUserId(req);
    const { userId, amount, reason } = req.body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be between 1 and 1000 ScrollGold'
      });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Reason is required'
      });
    }

    logger.info('Admin bestowing ScrollGold', { adminId, userId, amount, reason });

    const result = await scrollGoldService.bestowScrollGold(userId, amount, reason, adminId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    res.json({
      success: true,
      data: {
        message: result.message
      }
    });
  })
);

/**
 * GET /api/scrollgold/admin/fraud-alerts
 * Get fraud alerts for admin review
 * 
 * Query Parameters:
 * - status: 'PENDING_REVIEW' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'FALSE_POSITIVE'
 * - limit: number (default: 50)
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     alerts: Array<{...}>
 *   }
 * }
 */
router.get(
  '/admin/fraud-alerts',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const status = (req.query.status as any) || 'PENDING_REVIEW';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    logger.info('Fetching fraud alerts', { status, limit });

    const alerts = await scrollGoldService.getFraudAlerts(status, limit);

    res.json({
      success: true,
      data: {
        alerts
      }
    });
  })
);

/**
 * POST /api/scrollgold/admin/resolve-fraud-alert
 * Resolve a fraud alert
 * 
 * Body:
 * {
 *   alertId: string,
 *   resolution: 'RESOLVED' | 'FALSE_POSITIVE',
 *   notes: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string
 *   }
 * }
 */
router.post(
  '/admin/resolve-fraud-alert',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = getUserId(req);
    const { alertId, resolution, notes } = req.body;

    if (!alertId || !resolution || !notes) {
      return res.status(400).json({
        success: false,
        error: 'Alert ID, resolution, and notes are required'
      });
    }

    logger.info('Resolving fraud alert', { adminId, alertId, resolution });

    const result = await scrollGoldService.resolveFraudAlert(alertId, adminId, resolution, notes);

    res.json({
      success: true,
      data: {
        message: result.message
      }
    });
  })
);

/**
 * POST /api/scrollgold/admin/freeze-wallet
 * Freeze a user's wallet due to suspicious activity
 * 
 * Body:
 * {
 *   userId: string,
 *   reason: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string
 *   }
 * }
 */
router.post(
  '/admin/freeze-wallet',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = getUserId(req);
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'User ID and reason are required'
      });
    }

    logger.info('Freezing wallet', { adminId, userId, reason });

    const result = await scrollGoldService.freezeWallet(userId, reason, adminId);

    res.json({
      success: true,
      data: {
        message: result.message
      }
    });
  })
);

/**
 * POST /api/scrollgold/admin/unfreeze-wallet
 * Unfreeze a user's wallet after review
 * 
 * Body:
 * {
 *   userId: string,
 *   notes: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string
 *   }
 * }
 */
router.post(
  '/admin/unfreeze-wallet',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = getUserId(req);
    const { userId, notes } = req.body;

    if (!userId || !notes) {
      return res.status(400).json({
        success: false,
        error: 'User ID and notes are required'
      });
    }

    logger.info('Unfreezing wallet', { adminId, userId, notes });

    const result = await scrollGoldService.unfreezeWallet(userId, adminId, notes);

    res.json({
      success: true,
      data: {
        message: result.message
      }
    });
  })
);

/**
 * GET /api/scrollgold/admin/balance-integrity/:userId
 * Check balance integrity for a user
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     isValid: boolean,
 *     currentBalance: number,
 *     calculatedBalance: number,
 *     discrepancy: number,
 *     requiresCorrection: boolean
 *   }
 * }
 */
router.get(
  '/admin/balance-integrity/:userId',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    logger.info('Checking balance integrity', { userId });

    const integrity = await scrollGoldService.verifyBalanceIntegrity(userId);

    res.json({
      success: true,
      data: integrity
    });
  })
);

/**
 * POST /api/scrollgold/admin/correct-balance
 * Correct balance discrepancies (admin only)
 * 
 * Body:
 * {
 *   userId: string,
 *   reason: string
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     message: string,
 *     correctedAmount: number
 *   }
 * }
 */
router.post(
  '/admin/correct-balance',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const adminId = getUserId(req);
    const { userId, reason } = req.body;

    if (!userId || !reason) {
      return res.status(400).json({
        success: false,
        error: 'User ID and reason are required'
      });
    }

    logger.info('Correcting balance', { adminId, userId, reason });

    const result = await scrollGoldService.correctBalanceDiscrepancy(userId, adminId, reason);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.message
      });
    }

    res.json({
      success: true,
      data: {
        message: result.message,
        correctedAmount: result.correctedAmount
      }
    });
  })
);

/**
 * GET /api/scrollgold/admin/manipulation-check/:userId
 * Run comprehensive balance manipulation check
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     isClean: boolean,
 *     issues: string[],
 *     riskScore: number,
 *     recommendedAction: 'NONE' | 'MONITOR' | 'REVIEW' | 'FREEZE'
 *   }
 * }
 */
router.get(
  '/admin/manipulation-check/:userId',
  authenticateToken,
  authorize('admin', 'finance'),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    logger.info('Running balance manipulation check', { userId });

    const check = await scrollGoldService.runBalanceManipulationCheck(userId);

    res.json({
      success: true,
      data: check
    });
  })
);

// ============================================================================
// ERROR HANDLER
// ============================================================================

router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('ScrollGold API error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

export default router;
