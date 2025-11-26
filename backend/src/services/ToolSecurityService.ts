/**
 * Tool Security Service
 * 
 * Provides security enforcement for tool integrations, including permission
 * validation, sandboxing, and academic integrity monitoring.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

interface SecurityValidationResult {
  isValid: boolean;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

interface PermissionCheck {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export class ToolSecurityService {
  private prisma: PrismaClient;
  private suspiciousActivityThreshold = 10; // Number of violations before flagging

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Validate user permissions for a tool
   */
  async validatePermissions(
    userId: string, 
    manifestId: string, 
    requiredPermissions: PermissionCheck[]
  ): Promise<boolean> {
    try {
      // Get user permissions
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: true,
          role: true
        }
      });

      if (!user) {
        logger.warn(`Permission validation failed: User not found ${userId}`);
        return false;
      }

      // Admin users have all permissions
      if (user.role?.name === 'admin') {
        return true;
      }

      // Check each required permission
      for (const required of requiredPermissions) {
        const hasPermission = user.permissions.some(userPerm => 
          userPerm.action === required.action && 
          userPerm.resource === required.resource &&
          this.checkPermissionConditions(userPerm.conditions, required.conditions)
        );

        if (!hasPermission) {
          logger.warn(`Permission denied: User ${userId} lacks ${required.action} on ${required.resource} for tool ${manifestId}`);
          
          // Log permission violation
          await this.logSecurityEvent('permission-denied', {
            userId,
            manifestId,
            requiredPermission: required,
            timestamp: new Date()
          });

          return false;
        }
      }

      return true;

    } catch (error) {
      logger.error(`Permission validation error for user ${userId}, tool ${manifestId}:`, error);
      return false;
    }
  }

  /**
   * Validate tool integration security
   */
  async validateToolIntegration(manifestId: string, integrationData: any): Promise<SecurityValidationResult> {
    const violations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      // Get tool manifest
      const manifest = await this.prisma.toolManifest.findUnique({
        where: { id: manifestId }
      });

      if (!manifest) {
        violations.push('Tool manifest not found');
        return { isValid: false, violations, riskLevel: 'high' };
      }

      // Validate URL security for iframe integrations
      if (manifest.integrationMethod === 'iframe' && manifest.url) {
        const urlValidation = this.validateURL(manifest.url);
        if (!urlValidation.isValid) {
          violations.push(...urlValidation.violations);
          riskLevel = 'high';
        }
      }

      // Validate API endpoint security
      if (manifest.integrationMethod === 'api' && manifest.apiEndpoint) {
        const apiValidation = this.validateAPIEndpoint(manifest.apiEndpoint);
        if (!apiValidation.isValid) {
          violations.push(...apiValidation.violations);
          riskLevel = Math.max(riskLevel === 'low' ? 0 : riskLevel === 'medium' ? 1 : 2, 1) === 1 ? 'medium' : 'high';
        }
      }

      // Validate embed code security
      if (manifest.integrationMethod === 'embed' && manifest.embedCode) {
        const embedValidation = this.validateEmbedCode(manifest.embedCode);
        if (!embedValidation.isValid) {
          violations.push(...embedValidation.violations);
          riskLevel = 'medium';
        }
      }

      // Check for suspicious patterns in integration data
      const patternValidation = this.checkSuspiciousPatterns(integrationData);
      if (!patternValidation.isValid) {
        violations.push(...patternValidation.violations);
        riskLevel = 'medium';
      }

      return {
        isValid: violations.length === 0,
        violations,
        riskLevel
      };

    } catch (error) {
      logger.error(`Tool integration validation error for ${manifestId}:`, error);
      return {
        isValid: false,
        violations: ['Internal validation error'],
        riskLevel: 'high'
      };
    }
  }

  /**
   * Monitor for academic integrity violations
   */
  async monitorAcademicIntegrity(
    userId: string, 
    instanceId: string, 
    activity: any
  ): Promise<void> {
    try {
      const suspiciousIndicators: string[] = [];

      // Check for rapid-fire submissions
      if (activity.type === 'file-save' || activity.type === 'submission') {
        const recentActivity = await this.prisma.toolEvent.count({
          where: {
            userId,
            type: activity.type,
            timestamp: {
              gte: new Date(Date.now() - 60000) // Last minute
            }
          }
        });

        if (recentActivity > 10) {
          suspiciousIndicators.push('Rapid successive submissions detected');
        }
      }

      // Check for unusual time patterns (e.g., working at 3 AM consistently)
      const hour = new Date().getHours();
      if (hour >= 2 && hour <= 5) {
        const nightActivity = await this.prisma.toolEvent.count({
          where: {
            userId,
            timestamp: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last week
            }
          }
        });

        const totalActivity = await this.prisma.toolEvent.count({
          where: {
            userId,
            timestamp: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        });

        if (nightActivity / totalActivity > 0.8) {
          suspiciousIndicators.push('Unusual activity time patterns');
        }
      }

      // Check for copy-paste patterns in code submissions
      if (activity.type === 'code-submission' && activity.data?.content) {
        const copyPasteIndicators = this.detectCopyPastePatterns(activity.data.content);
        suspiciousIndicators.push(...copyPasteIndicators);
      }

      // Log suspicious activity
      if (suspiciousIndicators.length > 0) {
        await this.logSecurityEvent('academic-integrity-alert', {
          userId,
          instanceId,
          indicators: suspiciousIndicators,
          activity,
          timestamp: new Date()
        });

        // Check if user should be flagged for review
        const violationCount = await this.prisma.securityEvent.count({
          where: {
            userId,
            type: 'academic-integrity-alert',
            timestamp: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        });

        if (violationCount >= this.suspiciousActivityThreshold) {
          await this.flagUserForReview(userId, 'Multiple academic integrity alerts');
        }
      }

    } catch (error) {
      logger.error(`Academic integrity monitoring error for user ${userId}:`, error);
    }
  }

  /**
   * Sanitize tool communication data
   */
  sanitizeToolData(data: any): any {
    try {
      // Remove potentially dangerous properties
      const sanitized = { ...data };
      
      // Remove script tags and event handlers
      if (typeof sanitized === 'object') {
        this.recursiveSanitize(sanitized);
      }

      return sanitized;

    } catch (error) {
      logger.error('Data sanitization error:', error);
      return {};
    }
  }

  /**
   * Generate security token for tool communication
   */
  generateSecurityToken(userId: string, instanceId: string, expiresIn: number = 3600): string {
    try {
      const payload = {
        userId,
        instanceId,
        exp: Math.floor(Date.now() / 1000) + expiresIn,
        iat: Math.floor(Date.now() / 1000)
      };

      // In a real implementation, this would use JWT or similar
      const token = Buffer.from(JSON.stringify(payload)).toString('base64');
      
      logger.debug(`Generated security token for user ${userId}, instance ${instanceId}`);
      return token;

    } catch (error) {
      logger.error('Security token generation error:', error);
      throw new Error('Failed to generate security token');
    }
  }

  /**
   * Validate security token
   */
  validateSecurityToken(token: string): { isValid: boolean; payload?: any } {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return { isValid: false };
      }

      return { isValid: true, payload };

    } catch (error) {
      logger.warn('Security token validation failed:', error);
      return { isValid: false };
    }
  }

  // Private helper methods

  private validateURL(url: string): SecurityValidationResult {
    const violations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      const parsedUrl = new URL(url);

      // Check protocol
      if (parsedUrl.protocol !== 'https:') {
        violations.push('Non-HTTPS URL detected');
        riskLevel = 'medium';
      }

      // Check for suspicious domains
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'goo.gl'];
      if (suspiciousDomains.some(domain => parsedUrl.hostname.includes(domain))) {
        violations.push('Suspicious URL shortener detected');
        riskLevel = 'high';
      }

      // Check for local/private IP addresses
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (ipRegex.test(parsedUrl.hostname)) {
        const parts = parsedUrl.hostname.split('.');
        const firstOctet = parseInt(parts[0]);
        
        if (firstOctet === 10 || firstOctet === 127 || 
           (firstOctet === 172 && parseInt(parts[1]) >= 16 && parseInt(parts[1]) <= 31) ||
           (firstOctet === 192 && parseInt(parts[1]) === 168)) {
          violations.push('Private IP address detected');
          riskLevel = 'high';
        }
      }

    } catch (error) {
      violations.push('Invalid URL format');
      riskLevel = 'high';
    }

    return {
      isValid: violations.length === 0,
      violations,
      riskLevel
    };
  }

  private validateAPIEndpoint(endpoint: string): SecurityValidationResult {
    const violations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Similar validation to URL but with API-specific checks
    const urlValidation = this.validateURL(endpoint);
    violations.push(...urlValidation.violations);
    riskLevel = urlValidation.riskLevel;

    // Additional API-specific validations
    if (!endpoint.includes('/api/') && !endpoint.includes('/v1/') && !endpoint.includes('/v2/')) {
      violations.push('Non-standard API endpoint pattern');
      riskLevel = 'medium';
    }

    return {
      isValid: violations.length === 0,
      violations,
      riskLevel
    };
  }

  private validateEmbedCode(embedCode: string): SecurityValidationResult {
    const violations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // Check for script tags
    if (embedCode.includes('<script')) {
      violations.push('Script tags detected in embed code');
      riskLevel = 'high';
    }

    // Check for event handlers
    const eventHandlers = ['onclick', 'onload', 'onerror', 'onmouseover'];
    for (const handler of eventHandlers) {
      if (embedCode.toLowerCase().includes(handler)) {
        violations.push(`Event handler ${handler} detected in embed code`);
        riskLevel = 'medium';
      }
    }

    // Check for external resource loading
    if (embedCode.includes('src=') && !embedCode.includes('https://')) {
      violations.push('Non-HTTPS resource loading detected');
      riskLevel = 'medium';
    }

    return {
      isValid: violations.length === 0,
      violations,
      riskLevel
    };
  }

  private checkSuspiciousPatterns(data: any): SecurityValidationResult {
    const violations: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    const dataString = JSON.stringify(data).toLowerCase();

    // Check for SQL injection patterns
    const sqlPatterns = ['union select', 'drop table', 'delete from', '-- ', '/*'];
    for (const pattern of sqlPatterns) {
      if (dataString.includes(pattern)) {
        violations.push(`Potential SQL injection pattern detected: ${pattern}`);
        riskLevel = 'high';
      }
    }

    // Check for XSS patterns
    const xssPatterns = ['<script', 'javascript:', 'vbscript:', 'onload=', 'onerror='];
    for (const pattern of xssPatterns) {
      if (dataString.includes(pattern)) {
        violations.push(`Potential XSS pattern detected: ${pattern}`);
        riskLevel = 'high';
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
      riskLevel
    };
  }

  private detectCopyPastePatterns(content: string): string[] {
    const indicators: string[] = [];

    // Check for inconsistent coding style
    const hasTabsAndSpaces = content.includes('\t') && content.includes('  ');
    if (hasTabsAndSpaces) {
      indicators.push('Inconsistent indentation patterns detected');
    }

    // Check for multiple comment styles
    const commentStyles = ['//', '/*', '#', '<!--'];
    const foundStyles = commentStyles.filter(style => content.includes(style));
    if (foundStyles.length > 2) {
      indicators.push('Multiple comment styles detected');
    }

    // Check for unusual variable naming patterns
    const variableRegex = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    const variables = content.match(variableRegex) || [];
    const uniqueVariables = new Set(variables);
    
    if (variables.length > 50 && uniqueVariables.size / variables.length < 0.3) {
      indicators.push('Unusual variable naming patterns detected');
    }

    return indicators;
  }

  private checkPermissionConditions(userConditions: any, requiredConditions?: any): boolean {
    if (!requiredConditions) return true;
    if (!userConditions) return false;

    // Simple condition matching - in a real implementation this would be more sophisticated
    for (const [key, value] of Object.entries(requiredConditions)) {
      if (userConditions[key] !== value) {
        return false;
      }
    }

    return true;
  }

  private recursiveSanitize(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove script tags and event handlers
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .replace(/javascript:/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.recursiveSanitize(obj[key]);
      }
    }
  }

  private async logSecurityEvent(type: string, data: any): Promise<void> {
    try {
      await this.prisma.securityEvent.create({
        data: {
          type,
          userId: data.userId,
          data: JSON.stringify(data),
          timestamp: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to log security event:', error);
    }
  }

  private async flagUserForReview(userId: string, reason: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          flaggedForReview: true,
          flagReason: reason,
          flaggedAt: new Date()
        }
      });

      logger.warn(`User ${userId} flagged for review: ${reason}`);
    } catch (error) {
      logger.error(`Failed to flag user ${userId} for review:`, error);
    }
  }
}