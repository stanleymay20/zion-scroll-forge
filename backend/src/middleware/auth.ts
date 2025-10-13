/**
 * ScrollUniversity Authentication Middleware
 * Divine authorization system for kingdom access control
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface ScrollJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  scrollAlignment: number;
  iat: number;
  exp: number;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        scrollAlignment: number;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Access denied',
        message: 'No token provided. ScrollUniversity requires divine authorization.',
        scrollMessage: 'Seek ye first the kingdom, then access shall be granted.'
      });
      return;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      logger.error('JWT_SECRET not configured');
      res.status(500).json({
        error: 'Server configuration error',
        message: 'Divine secrets not properly configured'
      });
      return;
    }
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as ScrollJWTPayload;
    
    // Fetch fresh user data to ensure account is still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        scrollAlignment: true,
        enrollmentStatus: true,
        lastLoginAt: true
      }
    });
    
    if (!user) {
      res.status(401).json({
        error: 'User not found',
        message: 'ScrollStudent record not found in the kingdom database'
      });
      return;
    }
    
    if (user.enrollmentStatus !== 'ACTIVE') {
      res.status(403).json({
        error: 'Account suspended',
        message: 'ScrollStudent enrollment is not active',
        status: user.enrollmentStatus
      });
      return;
    }
    
    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      scrollAlignment: user.scrollAlignment
    };
    
    logger.debug(`ScrollStudent authenticated: ${user.email} (${user.role})`);
    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'Divine authorization token is invalid or expired',
        scrollMessage: 'Renew your covenant and try again'
      });
      return;
    }
    
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during divine authorization'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Divine authorization required for this operation'
      });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Insufficient privileges',
        message: `This operation requires ${allowedRoles.join(' or ')} authority`,
        currentRole: req.user.role,
        scrollMessage: 'Seek greater anointing for higher access'
      });
      return;
    }
    
    next();
  };
};

// Scroll alignment requirement middleware
export const requireScrollAlignment = (minimumAlignment: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Divine authorization required for scroll alignment check'
      });
      return;
    }
    
    if (req.user.scrollAlignment < minimumAlignment) {
      res.status(403).json({
        error: 'Insufficient scroll alignment',
        message: `This operation requires scroll alignment of ${minimumAlignment}`,
        currentAlignment: req.user.scrollAlignment,
        scrollMessage: 'Increase your scroll alignment through faithful study and kingdom service'
      });
      return;
    }
    
    next();
  };
};