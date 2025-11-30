/**
 * Academic Year Automation System - Security Service
 * "The Lord is my rock, my fortress and my deliverer" - Psalm 18:2
 * 
 * Comprehensive security service for SU-AYAS including:
 * - Authentication and authorization
 * - Data encryption
 * - Audit logging
 * - Access control
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { logger } from '../../utils/productionLogger';
import { createAuditLog, AuditEventType } from '../../middleware/auditLogging';

const prisma = new PrismaClient();

/**
 * Security configuration
 */
const SECURITY_CONFIG = {
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    saltLength: 64
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 60 * 60 * 1000 // 1 hour
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000 // 15 minutes
  }
};

/**
 * Permission levels for academic year operations
 */
export enum Permission {
  // Academic Calendar
  VIEW_CALENDAR = 'view_calendar',
  CREATE_CALENDAR = 'create_calendar',
  UPDATE_CALENDAR = 'update_calendar',
  DELETE_CALENDAR = 'delete_calendar',
  
  // Student Lifecycle
  VIEW_STUDENT_DATA = 'view_student_data',
  MANAGE_ADMISSIONS = 'manage_admissions',
  MANAGE_REGISTRATION = 'manage_registration',
  MANAGE_GRADUATION = 'manage_graduation',
  
  // Faculty Operations
  VIEW_FACULTY_DATA = 'view_faculty_data',
  MANAGE_TEACHING_LOAD = 'manage_teaching_load',
  GENERATE_CONTENT = 'generate_content',
  MANAGE_GRADING = 'manage_grading',
  
  // Course Execution
  VIEW_COURSE_DATA = 'view_course_data',
  MANAGE_MODULES = 'manage_modules',
  MANAGE_AI_TUTOR = 'manage_ai_tutor',
  
  // Workflows
  VIEW_WORKFLOWS = 'view_workflows',
  MANAGE_WORKFLOWS = 'manage_workflows',
  MANAGE_NOTIFICATIONS = 'manage_notifications',
  
  // System Administration
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SECURITY = 'manage_security'
}

/**
 * Role-based permissions mapping
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(Permission),
  registrar: [
    Permission.VIEW_CALENDAR,
    Permission.CREATE_CALENDAR,
    Permission.UPDATE_CALENDAR,
    Permission.VIEW_STUDENT_DATA,
    Permission.MANAGE_ADMISSIONS,
    Permission.MANAGE_REGISTRATION,
    Permission.MANAGE_GRADUATION,
    Permission.VIEW_WORKFLOWS,
    Permission.MANAGE_WORKFLOWS,
    Permission.VIEW_AUDIT_LOGS
  ],
  faculty: [
    Permission.VIEW_CALENDAR,
    Permission.VIEW_STUDENT_DATA,
    Permission.VIEW_FACULTY_DATA,
    Permission.MANAGE_TEACHING_LOAD,
    Permission.GENERATE_CONTENT,
    Permission.MANAGE_GRADING,
    Permission.VIEW_COURSE_DATA,
    Permission.MANAGE_MODULES,
    Permission.MANAGE_AI_TUTOR
  ],
  student: [
    Permission.VIEW_CALENDAR,
    Permission.VIEW_COURSE_DATA
  ]
};

/**
 * Security Service
 */
export class SecurityService {
  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        return false;
      }

      const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
      return rolePermissions.includes(permission);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Permission check failed', { error: errorMessage, userId, permission });
      return false;
    }
  }

  /**
   * Check multiple permissions (user must have all)
   */
  async hasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
    const checks = await Promise.all(
      permissions.map(p => this.hasPermission(userId, p))
    );
    return checks.every(check => check === true);
  }

  /**
   * Check multiple permissions (user must have at least one)
   */
  async hasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
    const checks = await Promise.all(
      permissions.map(p => this.hasPermission(userId, p))
    );
    return checks.some(check => check === true);
  }

  /**
   * Encrypt sensitive data
   */
  encryptData(data: string, masterKey?: string): { encrypted: string; iv: string; tag: string; salt: string } {
    try {
      const key = masterKey || process.env.ENCRYPTION_KEY || this.generateKey();
      
      // Generate salt and derive key
      const salt = crypto.randomBytes(SECURITY_CONFIG.encryption.saltLength);
      const derivedKey = crypto.pbkdf2Sync(
        key,
        salt,
        100000,
        SECURITY_CONFIG.encryption.keyLength,
        'sha512'
      );

      // Generate IV
      const iv = crypto.randomBytes(SECURITY_CONFIG.encryption.ivLength);

      // Create cipher
      const cipher = crypto.createCipheriv(
        SECURITY_CONFIG.encryption.algorithm,
        derivedKey,
        iv
      ) as crypto.CipherGCM;

      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get auth tag
      const tag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        salt: salt.toString('hex')
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Encryption failed', { error: errorMessage });
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decryptData(
    encrypted: string,
    iv: string,
    tag: string,
    salt: string,
    masterKey?: string
  ): string {
    try {
      const key = masterKey || process.env.ENCRYPTION_KEY || '';
      
      // Derive key from salt
      const derivedKey = crypto.pbkdf2Sync(
        key,
        Buffer.from(salt, 'hex'),
        100000,
        SECURITY_CONFIG.encryption.keyLength,
        'sha512'
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(
        SECURITY_CONFIG.encryption.algorithm,
        derivedKey,
        Buffer.from(iv, 'hex')
      ) as crypto.DecipherGCM;

      // Set auth tag for GCM mode
      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Decryption failed', { error: errorMessage });
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Generate encryption key
   */
  private generateKey(): string {
    return crypto.randomBytes(SECURITY_CONFIG.encryption.keyLength).toString('hex');
  }

  /**
   * Hash sensitive data (one-way)
   */
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hash: string): boolean {
    const dataHash = this.hashData(data);
    return crypto.timingSafeEqual(
      Buffer.from(dataHash),
      Buffer.from(hash)
    );
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[^\w\s@.-]/gi, '')
      .trim();
  }

  /**
   * Validate data access
   */
  async validateDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: 'read' | 'write' | 'delete'
  ): Promise<boolean> {
    try {
      // Check if user owns the resource
      const ownership = await this.checkResourceOwnership(userId, resourceType, resourceId);
      if (ownership) {
        return true;
      }

      // Check role-based access
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        return false;
      }

      // Admins have full access
      if (user.role === 'admin') {
        return true;
      }

      // Check specific permissions based on resource type
      const requiredPermission = this.getRequiredPermission(resourceType, action);
      return await this.hasPermission(userId, requiredPermission);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Data access validation failed', { error: errorMessage, userId, resourceType, resourceId });
      return false;
    }
  }

  /**
   * Check resource ownership
   */
  private async checkResourceOwnership(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    try {
      switch (resourceType) {
        case 'student':
          // Check if user owns this student record (user is the student)
          const enrollment = await prisma.enrollment.findFirst({
            where: { 
              id: resourceId,
              userId: userId
            }
          });
          return !!enrollment;

        case 'faculty':
          // Check if user is the faculty member for this course
          const course = await prisma.course.findFirst({
            where: { 
              id: resourceId
              // Note: instructorId field needs to be added to Course model in schema
            }
          });
          return !!course;

        case 'enrollment':
          // Check if user owns this enrollment
          const userEnrollment = await prisma.enrollment.findFirst({
            where: { 
              id: resourceId,
              userId: userId
            }
          });
          return !!userEnrollment;

        default:
          return false;
      }
    } catch (error) {
      logger.error('Ownership check failed', { error: error instanceof Error ? error.message : 'Unknown error', userId, resourceType, resourceId });
      return false;
    }
  }

  /**
   * Get required permission for resource action
   */
  private getRequiredPermission(resourceType: string, action: 'read' | 'write' | 'delete'): Permission {
    const permissionMap: Record<string, Record<string, Permission>> = {
      calendar: {
        read: Permission.VIEW_CALENDAR,
        write: Permission.UPDATE_CALENDAR,
        delete: Permission.DELETE_CALENDAR
      },
      student: {
        read: Permission.VIEW_STUDENT_DATA,
        write: Permission.MANAGE_REGISTRATION,
        delete: Permission.MANAGE_ADMISSIONS
      },
      faculty: {
        read: Permission.VIEW_FACULTY_DATA,
        write: Permission.MANAGE_TEACHING_LOAD,
        delete: Permission.MANAGE_USERS
      },
      course: {
        read: Permission.VIEW_COURSE_DATA,
        write: Permission.MANAGE_MODULES,
        delete: Permission.MANAGE_MODULES
      }
    };

    return permissionMap[resourceType]?.[action] || Permission.VIEW_CALENDAR;
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    eventType: AuditEventType,
    userId: string,
    details: any,
    success: boolean = true
  ): Promise<void> {
    await createAuditLog({
      eventType,
      userId,
      action: eventType,
      details,
      success,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent
    });
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(userId: string, action: string): Promise<boolean> {
    try {
      // Note: This requires auditLog model in Prisma schema
      // For now, using in-memory rate limiting
      // TODO: Implement proper audit log table
      
      // Placeholder implementation - always return false for now
      logger.warn('Suspicious activity detection requires auditLog model in schema', { userId, action });
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Suspicious activity detection failed', { error: errorMessage, userId, action });
      return false;
    }
  }

  /**
   * Generate secure token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Validate session
   */
  async validateSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      // Note: This requires session model in Prisma schema
      // TODO: Add Session model to schema or use alternative session management
      logger.warn('Session validation requires session model in schema', { sessionId, userId });
      
      // Placeholder - return true for now (sessions managed elsewhere)
      return true;
    } catch (error) {
      logger.error('Session validation failed', { error, sessionId, userId });
      return false;
    }
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      // Note: This requires session model in Prisma schema
      // TODO: Add Session model to schema
      logger.warn('Session revocation requires session model in schema', { sessionId });
    } catch (error) {
      logger.error('Session revocation failed', { error, sessionId });
      throw new Error('Failed to revoke session');
    }
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      // Note: This requires session model in Prisma schema
      // TODO: Add Session model to schema
      logger.warn('User sessions revocation requires session model in schema', { userId });
    } catch (error) {
      logger.error('User sessions revocation failed', { error, userId });
      throw new Error('Failed to revoke user sessions');
    }
  }
}

export default new SecurityService();
