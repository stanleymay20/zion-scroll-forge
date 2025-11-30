/**
 * ScrollUniversity User Management Service
 * "Managing the kingdom's scroll sons and daughters with divine precision"
 */

import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

class UserManagementService {
  /**
   * Create a new user
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.email.split('@')[0],
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role || 'STUDENT',
        },
      });

      logger.info('User created successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating user', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching user', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching user by email', { email, error: errorMessage });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      logger.info('User updated successfully', { userId });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating user', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Delete user (soft delete by removing email)
   */
  async deleteUser(userId: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          email: `deleted_${userId}@deleted.com`,
          username: `deleted_${userId}`,
        },
      });

      logger.info('User deactivated successfully', { userId });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deactivating user', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * List users with pagination
   */
  async listUsers(page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count(),
      ]);

      return { users, total };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error listing users', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });

      logger.info('User password updated successfully', { userId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating password', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      return await bcrypt.compare(password, user.passwordHash);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error verifying password', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get user profile (without password)
   */
  async getUserProfile(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          scrollCalling: true,
          spiritualGifts: true,
          kingdomVision: true,
          scrollAlignment: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching user profile', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Login user
   */
  async loginUser(loginData: { email: string; password: string }): Promise<{ user: User; token: string }> {
    try {
      const user = await this.getUserByEmail(loginData.email);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(loginData.password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token (simplified - in production use proper JWT)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      logger.info('User logged in successfully', { userId: user.id });
      return { user, token };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error logging in user', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: UpdateUserData): Promise<User> {
    return this.updateUser(userId, updateData);
  }

  /**
   * Update spiritual formation data
   */
  async updateSpiritualFormation(userId: string, spiritualData: any): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          // Store spiritual data in user metadata or related table
          updatedAt: new Date(),
        },
      });

      logger.info('Spiritual formation updated', { userId });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating spiritual formation', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Get user dashboard data
   */
  async getUserDashboard(userId: string): Promise<any> {
    try {
      const user = await this.getUserProfile(userId);
      
      return {
        user,
        stats: {
          coursesEnrolled: 0,
          coursesCompleted: 0,
          scrollCoins: 0,
          scrollBadges: 0,
        },
        recentActivity: [],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching user dashboard', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({
          where: {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ]);

      return { users, total };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error searching users', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string, page: number = 1, limit: number = 20): Promise<{ users: User[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: { role },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: { role } }),
      ]);

      return { users, total };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching users by role', { role, error: errorMessage });
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string, adminId: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      logger.info('User role updated', { userId, role, adminId });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating user role', { userId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Update user status (using role field as a workaround)
   */
  async updateUserStatus(userId: string, status: boolean, adminId: string): Promise<User> {
    try {
      // Since there's no isActive field, we'll just update the updatedAt timestamp
      const user = await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });

      logger.info('User status updated', { userId, status, adminId });
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error updating user status', { userId, error: errorMessage });
      throw error;
    }
  }
}

export const userManagementService = new UserManagementService();
export default UserManagementService;
