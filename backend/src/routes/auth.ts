/**
 * ScrollUniversity Authentication Routes
 * Divine access control for kingdom education
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { logger } from '../utils/logger';
import { ScrollValidationError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  location: Joi.string().max(100).optional(),
  phoneNumber: Joi.string().max(20).optional(),
  scrollCalling: Joi.string().max(500).optional(),
  spiritualGifts: Joi.array().items(Joi.string()).optional(),
  kingdomVision: Joi.string().max(1000).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Generate JWT token
const generateToken = (user: any): string => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    scrollAlignment: user.scrollAlignment
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

// Register new ScrollStudent
router.post('/register', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new ScrollValidationError(
        error.details[0].message,
        'The scroll registration requires proper divine formatting',
        'Ensure all required fields are filled with kingdom standards'
      );
    }
    
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      location,
      phoneNumber,
      scrollCalling,
      spiritualGifts,
      kingdomVision
    } = value;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A ScrollStudent with this email or username already exists',
        scrollMessage: 'Each scroll son must have a unique identity in the kingdom'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        firstName,
        lastName,
        location,
        phoneNumber,
        scrollCalling,
        spiritualGifts: spiritualGifts || [],
        kingdomVision,
        role: 'STUDENT',
        enrollmentStatus: 'ACTIVE',
        academicLevel: 'SCROLL_OPEN',
        scrollCoinBalance: 10.0, // Welcome bonus
        scrollAlignment: 0.1 // Starting alignment
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        scrollCoinBalance: true,
        scrollAlignment: true,
        createdAt: true
      }
    });
    
    // Award welcome ScrollCoin
    await prisma.scrollCoinTransaction.create({
      data: {
        userId: newUser.id,
        amount: 10.0,
        type: 'BONUS',
        description: 'Welcome to ScrollUniversity - Divine enrollment bonus',
        activityType: 'DAILY_XP_STREAK'
      }
    });
    
    // Generate token
    const token = generateToken(newUser);
    
    logger.scroll('New ScrollStudent registered', {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username
    });
    
    res.status(201).json({
      message: 'ScrollStudent successfully enrolled in the kingdom',
      scrollMessage: 'Welcome to Zion\'s Academic Government on Earth',
      user: newUser,
      token,
      kingdomGuidance: 'Begin your journey with ScrollOpen courses and daily XP streaks'
    });
    
  } catch (error) {
    next(error);
  }
});

// Login ScrollStudent
router.post('/login', async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new ScrollValidationError(
        error.details[0].message,
        'Divine login requires proper credentials',
        'Provide valid email and password for kingdom access'
      );
    }
    
    const { email, password } = value;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        enrollmentStatus: true,
        scrollCoinBalance: true,
        scrollAlignment: true,
        lastLoginAt: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'ScrollStudent not found in the kingdom database',
        scrollMessage: 'Verify your divine credentials and try again'
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Password does not match kingdom records',
        scrollMessage: 'The divine password is incorrect'
      });
    }
    
    // Check enrollment status
    if (user.enrollmentStatus !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Account not active',
        message: `ScrollStudent enrollment status: ${user.enrollmentStatus}`,
        scrollMessage: 'Your kingdom access has been restricted',
        kingdomGuidance: 'Contact ScrollUniversity administration for account restoration'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;
    
    logger.scroll('ScrollStudent logged in', {
      userId: user.id,
      email: user.email,
      lastLogin: user.lastLoginAt
    });
    
    res.json({
      message: 'ScrollStudent successfully authenticated',
      scrollMessage: 'Welcome back to the kingdom',
      user: userResponse,
      token,
      kingdomGuidance: 'Continue your divine education journey'
    });
    
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        scrollMessage: 'Divine token renewal requires proper credentials'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    
    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        scrollAlignment: true,
        enrollmentStatus: true
      }
    });
    
    if (!user || user.enrollmentStatus !== 'ACTIVE') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        scrollMessage: 'Kingdom access has been revoked'
      });
    }
    
    // Generate new token
    const newToken = generateToken(user);
    
    res.json({
      message: 'Token successfully renewed',
      scrollMessage: 'Divine authorization extended',
      token: newToken
    });
    
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal, but we can log the event)
router.post('/logout', async (req, res) => {
  // In a more complex system, we might maintain a token blacklist
  // For now, we just log the logout event
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      logger.scroll('ScrollStudent logged out', {
        userId: decoded.userId,
        email: decoded.email
      });
    } catch (error) {
      // Token might be invalid, but that's okay for logout
    }
  }
  
  res.json({
    message: 'ScrollStudent successfully logged out',
    scrollMessage: 'May the kingdom peace be with you',
    kingdomGuidance: 'Return anytime to continue your divine education'
  });
});

export default router;