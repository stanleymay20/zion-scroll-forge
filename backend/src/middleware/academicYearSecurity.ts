/**
 * Academic Year Automation System - Security Middleware
 * "The Lord watches over you" - Psalm 121:5
 * 
 * Security middleware specific to SU-AYAS operations
 */

import { Request, Response, NextFunction } from 'express';
import SecurityService, { Permission } from '../services/academic-year/SecurityService';
import { logger } from '../utils/productionLogger';
import { createAuditLog, AuditEventType } from './auditLogging';

/**
 * Require specific permission
 */
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const hasPermission = await SecurityService.hasPermission(req.user.id, permission);

      if (!hasPermission) {
        await createAuditLog({
          eventType: AuditEventType.ACCESS_DENIED,
          userId: req.user.id,
          action: `PERMISSION_DENIED: ${permission}`,
          details: {
            path: req.path,
            method: req.method,
            requiredPermission: permission
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          success: false
        });

        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check failed', { error, permission });
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Require any of the specified permissions
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const hasPermission = await SecurityService.hasAnyPermission(req.user.id, permissions);

      if (!hasPermission) {
        await createAuditLog({
          eventType: AuditEventType.ACCESS_DENIED,
          userId: req.user.id,
          action: 'PERMISSION_DENIED',
          details: {
            path: req.path,
            method: req.method,
            requiredPermissions: permissions
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          success: false
        });

        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check failed', { error, permissions });
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Require all of the specified permissions
 */
export function requireAllPermissions(...permissions: Permission[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const hasPermissions = await SecurityService.hasAllPermissions(req.user.id, permissions);

      if (!hasPermissions) {
        await createAuditLog({
          eventType: AuditEventType.ACCESS_DENIED,
          userId: req.user.id,
          action: 'PERMISSION_DENIED',
          details: {
            path: req.path,
            method: req.method,
            requiredPermissions: permissions
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          success: false
        });

        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check failed', { error, permissions });
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Validate data access for specific resource
 */
export function validateDataAccess(resourceType: string, action: 'read' | 'write' | 'delete' = 'read') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const resourceId = req.params.id || req.body.id;
      if (!resourceId) {
        res.status(400).json({
          success: false,
          error: 'Resource ID required'
        });
        return;
      }

      const hasAccess = await SecurityService.validateDataAccess(
        req.user.id,
        resourceType,
        resourceId,
        action
      );

      if (!hasAccess) {
        await createAuditLog({
          eventType: AuditEventType.ACCESS_DENIED,
          userId: req.user.id,
          resourceType,
          resourceId,
          action: `DATA_ACCESS_DENIED: ${action}`,
          details: {
            path: req.path,
            method: req.method
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          success: false
        });

        res.status(403).json({
          success: false,
          error: 'Access denied to this resource'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Data access validation failed', { error, resourceType, action });
      res.status(500).json({
        success: false,
        error: 'Data access validation failed'
      });
    }
  };
}

/**
 * Detect and prevent suspicious activity
 */
export function detectSuspiciousActivity(action: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        next();
        return;
      }

      const isSuspicious = await SecurityService.detectSuspiciousActivity(req.user.id, action);

      if (isSuspicious) {
        await createAuditLog({
          eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
          userId: req.user.id,
          action: `SUSPICIOUS_ACTIVITY: ${action}`,
          details: {
            path: req.path,
            method: req.method,
            body: req.body
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          success: false
        });

        res.status(429).json({
          success: false,
          error: 'Too many requests. Please try again later.'
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Suspicious activity detection failed', { error, action });
      next(); // Don't block on detection failure
    }
  };
}

/**
 * Sanitize request input
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  try {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = SecurityService.sanitizeInput(req.query[key] as string);
        }
      });
    }

    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization failed', { error });
    next(); // Don't block on sanitization failure
  }
}

/**
 * Recursively sanitize object
 */
function sanitizeObject(obj: any): void {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = SecurityService.sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  });
}

/**
 * Validate session
 */
export function validateSession(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.headers['x-session-id'] as string;

  if (!sessionId || !req.user) {
    next();
    return;
  }

  SecurityService.validateSession(sessionId, req.user.id)
    .then(isValid => {
      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired session'
        });
        return;
      }
      next();
    })
    .catch(error => {
      logger.error('Session validation failed', { error, sessionId });
      res.status(500).json({
        success: false,
        error: 'Session validation failed'
      });
    });
}

/**
 * Audit academic operation
 */
export function auditAcademicOperation(eventType: AuditEventType, resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);

    res.json = function(data: any) {
      createAuditLog({
        eventType,
        userId: req.user?.id,
        resourceType,
        resourceId: req.params.id || data.id,
        action: `${req.method} ${req.path}`,
        details: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: sanitizeBodyForAudit(req.body)
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        success: data.success === true,
        errorMessage: data.success ? undefined : data.error
      }).catch(error => {
        logger.error('Audit logging failed', { error });
      });

      return originalJson(data);
    };

    next();
  };
}

/**
 * Sanitize body for audit logging
 */
function sanitizeBodyForAudit(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'ssn', 'creditCard'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Require admin role
 */
export const requireAdmin = requirePermission(Permission.MANAGE_SECURITY);

/**
 * Require registrar role
 */
export const requireRegistrar = requireAnyPermission(
  Permission.MANAGE_ADMISSIONS,
  Permission.MANAGE_REGISTRATION
);

/**
 * Require faculty role
 */
export const requireFaculty = requirePermission(Permission.GENERATE_CONTENT);

export default {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  validateDataAccess,
  detectSuspiciousActivity,
  sanitizeInput,
  validateSession,
  auditAcademicOperation,
  requireAdmin,
  requireRegistrar,
  requireFaculty
};
