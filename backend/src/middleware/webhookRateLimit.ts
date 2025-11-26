/**
 * Webhook Rate Limiting Middleware
 * "The plans of the diligent lead surely to abundance" - Proverbs 21:5
 * 
 * Protects webhook endpoints from abuse and ensures system stability
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/productionLogger';

// In-memory rate limit store (should be replaced with Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  maxRequests: parseInt(process.env.WEBHOOK_RATE_LIMIT_MAX || '100'),
  windowMs: parseInt(process.env.WEBHOOK_RATE_LIMIT_WINDOW || '60000'), // 1 minute
  keyPrefix: 'webhook_ratelimit:'
};

/**
 * Generate rate limit key from request
 */
function getRateLimitKey(req: Request): string {
  // Use IP address as the key
  // In production, you might want to use API key or other identifier
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `${RATE_LIMIT_CONFIG.keyPrefix}${ip}`;
}

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate limiting middleware for webhook endpoints
 */
export const webhookRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const key = getRateLimitKey(req);
    const now = Date.now();

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance on each request
      cleanupExpiredEntries();
    }

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + RATE_LIMIT_CONFIG.windowMs
      };
      rateLimitStore.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > RATE_LIMIT_CONFIG.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      logger.warn('Webhook rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        count: entry.count,
        limit: RATE_LIMIT_CONFIG.maxRequests
      });

      res.status(429)
        .set('Retry-After', retryAfter.toString())
        .set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString())
        .set('X-RateLimit-Remaining', '0')
        .set('X-RateLimit-Reset', entry.resetTime.toString())
        .json({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter,
          message: `Too many requests. Please try again in ${retryAfter} seconds.`
        });
      return;
    }

    // Add rate limit headers
    const remaining = Math.max(0, RATE_LIMIT_CONFIG.maxRequests - entry.count);
    res.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
    res.set('X-RateLimit-Remaining', remaining.toString());
    res.set('X-RateLimit-Reset', entry.resetTime.toString());

    next();
  } catch (error) {
    logger.error('Error in rate limiting middleware', { error });
    // Don't block request on rate limit error
    next();
  }
};

/**
 * Get current rate limit status for a request
 */
export function getRateLimitStatus(req: Request): {
  limit: number;
  remaining: number;
  resetTime: number;
} {
  const key = getRateLimitKey(req);
  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry || entry.resetTime < now) {
    return {
      limit: RATE_LIMIT_CONFIG.maxRequests,
      remaining: RATE_LIMIT_CONFIG.maxRequests,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    };
  }

  return {
    limit: RATE_LIMIT_CONFIG.maxRequests,
    remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - entry.count),
    resetTime: entry.resetTime
  };
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export function resetRateLimit(req: Request): void {
  const key = getRateLimitKey(req);
  rateLimitStore.delete(key);
  logger.info('Rate limit reset', { key });
}

/**
 * Clear all rate limit entries (admin function)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
  logger.info('All rate limits cleared');
}
