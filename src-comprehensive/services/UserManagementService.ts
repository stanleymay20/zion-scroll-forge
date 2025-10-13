import { PrismaClient, User, UserRole, EnrollmentStatus, AcademicLevel } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  location: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.STUDENT),
  scrollCalling: z.string().optional(),
  spiritualGifts: z.array(z.string()).default([]),
  kingdomVision: z.string().optional(),
});

const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  location: z.string().optional(),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.date().optional(),
  scrollCalling: z.string().optional(),
  spiritualGifts: z.array(z.string()).optional(),
  kingdomVision: z.string().optional(),
  scrollAlignment: z.number().min(0).max(100).optional(),
});

const LoginSchema = z.object({
  identifier: z.string(), // email or username
  password: z.string(),
});

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  location?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  role?: UserRole;
  scrollCalling?: string;
  spiritualGifts?: string[];
  kingdomVision?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  location?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  scrollCalling?: string;
  spiritualGifts?: string[];
  kingdomVision?: string;
  scrollAlignment?: number;
}

export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}

export interface UserProfile extends Omit<User, 'passwordHash'> {
  enrollmentCount: number;
  completedCourses: number;
  totalScrollXP: number;
  spiritualMaturityLevel: string;
}

export class UserManagementService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'scroll-university-secret';
  private readonly JWT_EXPIRES_IN = '7d';

  /**
   * Create a new user account with spiritual formation tracking
   */
  async createUser(userData: CreateUserRequest): Promise<UserProfile> {
    // Validate input
    const validatedData = CreateUserSchema.parse(userData);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user with spiritual formation defaults
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        passwordHash,
        scrollAlignment: 0.0,
        scrollCoinBalance: 100.0, // Welcome bonus
        workTradeCredits: 0.0,
        enrollmentStatus: EnrollmentStatus.ACTIVE,
        academicLevel: AcademicLevel.SCROLL_OPEN,
      },
      include: {
        enrollments: true,
        scrollCoinTransactions: true,
      }
    });

    // Create welcome ScrollCoin transaction
    await prisma.scrollCoinTransaction.create({
      data: {
        userId: user.id,
        amount: 100.0,
        type: 'BONUS',
        description: 'Welcome to ScrollUniversity! Your journey begins now.',
        activityType: null,
      }
    });

    return this.formatUserProfile(user);
  }

  /**
   * Authenticate user and return JWT token
   */
  async loginUser(loginData: LoginRequest): Promise<{ user: UserProfile; token: string }> {
    const validatedData = LoginSchema.parse(loginData);

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.identifier },
          { username: validatedData.identifier }
        ]
      },
      include: {
        enrollments: true,
        scrollCoinTransactions: true,
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        scrollAlignment: user.scrollAlignment 
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    return {
      user: this.formatUserProfile(user),
      token
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrollments: {
          include: {
            course: true
          }
        },
        scrollCoinTransactions: true,
        certifications: true,
        mentorships: true,
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.formatUserProfile(user);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updateData: UpdateUserRequest): Promise<UserProfile> {
    const validatedData = UpdateUserSchema.parse(updateData);

    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      include: {
        enrollments: true,
        scrollCoinTransactions: true,
      }
    });

    return this.formatUserProfile(user);
  }

  /**
   * Update user's spiritual formation metrics
   */
  async updateSpiritualFormation(userId: string, data: {
    scrollAlignment?: number;
    spiritualGifts?: string[];
    kingdomVision?: string;
    scrollCalling?: string;
  }): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        scrollAlignment: data.scrollAlignment,
        spiritualGifts: data.spiritualGifts,
        kingdomVision: data.kingdomVision,
        scrollCalling: data.scrollCalling,
      },
      include: {
        enrollments: true,
        scrollCoinTransactions: true,
      }
    });

    return this.formatUserProfile(user);
  }

  /**
   * Get users by role with pagination
   */
  async getUsersByRole(role: UserRole, page: number = 1, limit: number = 20): Promise<{
    users: UserProfile[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role },
        skip,
        take: limit,
        include: {
          enrollments: true,
          scrollCoinTransactions: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: { role } })
    ]);

    return {
      users: users.map(user => this.formatUserProfile(user)),
      total,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Search users by name, email, or username
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<{
    users: UserProfile[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;

    const searchCondition = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
        { username: { contains: query, mode: 'insensitive' as const } },
      ]
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: searchCondition,
        skip,
        take: limit,
        include: {
          enrollments: true,
          scrollCoinTransactions: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: searchCondition })
    ]);

    return {
      users: users.map(user => this.formatUserProfile(user)),
      total,
      pages: Math.ceil(total / limit)
    };
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole, adminUserId: string): Promise<UserProfile> {
    // Verify admin has permission
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.CHANCELLOR)) {
      throw new Error('Insufficient permissions to update user role');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      include: {
        enrollments: true,
        scrollCoinTransactions: true,
      }
    });

    return this.formatUserProfile(user);
  }

  /**
   * Suspend or reactivate user account
   */
  async updateUserStatus(userId: string, status: EnrollmentStatus, adminUserId: string): Promise<UserProfile> {
    // Verify admin has permission
    const admin = await prisma.user.findUnique({
      where: { id: adminUserId }
    });

    if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.CHANCELLOR)) {
      throw new Error('Insufficient permissions to update user status');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { enrollmentStatus: status },
      include: {
        enrollments: true,
        scrollCoinTransactions: true,
      }
    });

    return this.formatUserProfile(user);
  }

  /**
   * Get user dashboard statistics
   */
  async getUserDashboard(userId: string): Promise<{
    profile: UserProfile;
    stats: {
      totalCourses: number;
      completedCourses: number;
      inProgressCourses: number;
      totalScrollXP: number;
      scrollCoinBalance: number;
      spiritualMaturityLevel: string;
      recentAchievements: any[];
    };
  }> {
    const user = await this.getUserProfile(userId);

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }
    });

    const completedCourses = enrollments.filter(e => e.status === EnrollmentStatus.ACTIVE && e.progress === 100).length;
    const inProgressCourses = enrollments.filter(e => e.status === EnrollmentStatus.ACTIVE && e.progress < 100).length;
    const totalScrollXP = enrollments.reduce((sum, e) => sum + e.scrollXPEarned, 0);

    // Calculate spiritual maturity level based on scroll alignment
    const spiritualMaturityLevel = this.calculateSpiritualMaturityLevel(user.scrollAlignment);

    // Get recent achievements (certifications, completed courses, etc.)
    const recentAchievements = await prisma.certification.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
      take: 5
    });

    return {
      profile: user,
      stats: {
        totalCourses: enrollments.length,
        completedCourses,
        inProgressCourses,
        totalScrollXP,
        scrollCoinBalance: user.scrollCoinBalance,
        spiritualMaturityLevel,
        recentAchievements
      }
    };
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<UserProfile> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return await this.getUserProfile(decoded.userId);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Format user data for public consumption (remove sensitive fields)
   */
  private formatUserProfile(user: any): UserProfile {
    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      enrollmentCount: user.enrollments?.length || 0,
      completedCourses: user.enrollments?.filter((e: any) => e.progress === 100).length || 0,
      totalScrollXP: user.enrollments?.reduce((sum: number, e: any) => sum + e.scrollXPEarned, 0) || 0,
      spiritualMaturityLevel: this.calculateSpiritualMaturityLevel(user.scrollAlignment || 0),
    };
  }

  /**
   * Calculate spiritual maturity level based on scroll alignment
   */
  private calculateSpiritualMaturityLevel(scrollAlignment: number): string {
    if (scrollAlignment >= 90) return 'Scroll Master';
    if (scrollAlignment >= 75) return 'Scroll Adept';
    if (scrollAlignment >= 60) return 'Scroll Practitioner';
    if (scrollAlignment >= 40) return 'Scroll Student';
    if (scrollAlignment >= 20) return 'Scroll Seeker';
    return 'Scroll Newcomer';
  }
}

export const userManagementService = new UserManagementService();